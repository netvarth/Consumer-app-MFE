import { HttpBackend, HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, isDevMode } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AccountService, ConsumerService, SharedService } from 'jconsumer-shared';
import { CrossTenantJourneyService, PlatformTokenStore } from '@consumer/cross-tenant';
import { isBrowserSessionToken } from '../../../../cross-tenant/helpers/browser-session-token';
import { DeviceIdentityService } from '../../../../cross-tenant/helpers/device-identity.service';
import { normalizeStorageString } from '../../../../cross-tenant/helpers/normalize-storage-string';
import { AccountStateCoordinator } from './account-state-coordinator.service';

export interface CrossTenantSwitchResponse {
  id?: number | string;
  providerConsumer?: number | string;
  token: string;
  refreshToken?: string;
  status: 'signed_in' | 'provisioned';
  [key: string]: unknown;
}

export class CrossTenantSessionError extends Error {
  constructor(
    message = 'Account switch succeeded but the target authenticated session could not be validated.',
    override readonly cause?: unknown
  ) {
    super(message);
    this.name = 'CrossTenantSessionError';
  }
}

@Injectable({ providedIn: 'root' })
export class CrossTenantSsoService {
  private readonly http: HttpClient;
  private readonly inFlight = new Map<string, Promise<void>>();
  private platformRefresh: Promise<string> | null = null;

  constructor(
    backend: HttpBackend,
    private readonly sharedService: SharedService,
    private readonly platformTokens: PlatformTokenStore,
    private readonly journey: CrossTenantJourneyService,
    private readonly accountState: AccountStateCoordinator,
    private readonly accountService: AccountService,
    private readonly consumerService: ConsumerService,
    private readonly deviceIdentity: DeviceIdentityService
  ) {
    // Keep source-account interceptors and automatic refresh out of the transition.
    // Every request below selects its own credentials until validation succeeds.
    this.http = new HttpClient(backend);
  }

  prepareForTargetAccount(accountId: number | string, _customId: string): Promise<void> {
    const target = String(accountId).trim();
    const existing = this.inFlight.get(target);
    if (existing) return existing;

    const operation = this.prepare(target)
      .finally(() => this.inFlight.delete(target));
    this.inFlight.set(target, operation);
    return operation;
  }

  async switchAccount(accountId: number | string): Promise<CrossTenantSwitchResponse> {
    try {
      return await this.requestSwitch(accountId);
    } catch (error) {
      if (this.httpStatus(error) !== 498) throw error;
      await this.refreshPlatformToken();
      return this.requestSwitch(accountId);
    }
  }

  refreshPlatformToken(): Promise<string> {
    if (!this.platformRefresh) {
      this.platformRefresh = this.requestPlatformRefresh().finally(() => this.platformRefresh = null);
    }
    return this.platformRefresh;
  }

  private async requestPlatformRefresh(): Promise<string> {
    const oldToken = this.platformTokens.get();
    if (!oldToken) throw new Error('No platform token is available');
    try {
      const response = await firstValueFrom(this.http.post<{ platform_token?: string; platformToken?: string }>(
        this.apiUrl('consumer/oauth/platformtoken/refresh'),
        null,
        this.requestOptions(oldToken)
      ).pipe(timeout(10000)));
      const refreshed = response?.platform_token ?? response?.platformToken;
      if (typeof refreshed !== 'string' || !refreshed.trim()) throw new Error('Platform token refresh returned no token');
      const currentToken = this.platformTokens.get();
      if (currentToken !== oldToken) {
        if (!currentToken) throw new Error('Platform identity changed during refresh');
        return currentToken;
      }
      this.platformTokens.update(refreshed);
      return refreshed;
    } catch (error) {
      // Only a definitive credential rejection invalidates the native copy.
      // Offline, timeout, throttling, and server errors remain retryable.
      if (this.httpStatus(error) === 401 && this.platformTokens.get() === oldToken) {
        this.platformTokens.clear();
      }
      throw error;
    }
  }

  private async prepare(target: string): Promise<void> {
    const marker = this.journey.get();
    const platformToken = this.platformTokens.get();
    const credentials = this.readStoredObject('ynw-credentials');
    const activeAccount = this.accountState.getActiveAccount();
    const ownsSession = String(credentials['accountId']) === target
      && (!activeAccount || activeAccount === target);
    if (!marker && ownsSession && this.hasActiveSession()) {
      try {
        // A persisted token/credential pair is not proof that its cookie or
        // provider session still exists. Validate before rendering account/cart UI.
        const profile = await this.requestProfile(this.currentSessionToken());
        const user = this.readUser();
        if (user['providerConsumer'] != null && String(user['providerConsumer']) !== String(profile['id'])) {
          throw new CrossTenantSessionError('Stored session resolved to a different provider consumer.');
        }
        this.writeUserProfile(this.hydrateUser(user, profile));
        this.accountState.setActiveAccount(target);
        return;
      } catch {
        // Recover through platform SSO below, or expose a clean anonymous state.
      }
    }

    if (!platformToken) {
      this.activateAnonymousAccount(target);
      return;
    }

    try {
      const response = await this.switchAccount(target);
      // Store the target's login details directly from switch. A profile request
      // using the app's device identity can still describe the base account.
      this.clearRuntimeAccountState();
      this.accountState.transitionTo(target);
      this.installSession(response, target);
      this.accountState.setActiveAccount(target);
      this.journey.clear();
    } catch (error) {
      this.diagnostic('switch failed', { target, status: this.httpStatus(error) });
      // Preserve source credentials/cart ownership. The guard must stop target
      // rendering so these credentials cannot be used by the rejected app.
      throw error;
    }
  }

  private activateAnonymousAccount(target: string): void {
    // On the first boot there is no owner recorded for existing legacy cart
    // data, so keep it with the account being opened. Once an owner exists,
    // always transition through the coordinator to prevent account-local
    // cart and transient state from leaking into the next account.
    const activeAccount = this.accountState.getActiveAccount();
    if (activeAccount && activeAccount !== target) {
      this.clearRuntimeAccountState();
      this.accountState.transitionTo(target);
    }
    this.accountState.clearActiveAuthentication();
    this.accountState.setActiveAccount(target);
    this.journey.clear();
  }

  private async requestSwitch(accountId: number | string): Promise<CrossTenantSwitchResponse> {
    const token = this.platformTokens.get();
    if (!token) throw new Error('No platform token is available');
    const response = await firstValueFrom(this.http.post<CrossTenantSwitchResponse>(
      this.apiUrl('consumer/login/switch'),
      { accountId },
      this.requestOptions(token)
    ).pipe(timeout(10000)));
    const sessionToken = this.normalizeSessionToken(response?.token);
    if (!response || !sessionToken) {
      throw new Error('Account switch returned no session token');
    }
    if (response.status !== 'signed_in' && response.status !== 'provisioned') {
      throw new Error('Account switch returned an unsupported status');
    }
    const refreshToken = this.normalizeSessionToken(response.refreshToken);
    this.diagnostic('switch response', {
      target: accountId, status: response.status,
      tokenClassification: isBrowserSessionToken(sessionToken) ? 'browser-authn' : 'api-token',
      explicitRefreshTokenPresent: !!refreshToken
    });
    return {
      ...response,
      token: sessionToken,
      ...(refreshToken ? { refreshToken } : {})
    };
  }

  private installSession(response: CrossTenantSwitchResponse, accountId: string): void {
    this.accountState.clearActiveAuthentication();
    // Browser apps keep using appId/installId for request authorization.
    // Their returned token remains part of the login details in jld_scon.
    if (!isBrowserSessionToken(response.token)) {
      localStorage.setItem('c_authorizationToken', JSON.stringify(response.token));
    }
    const refreshToken = this.sessionRefreshToken(response);
    if (refreshToken) {
      localStorage.setItem('refreshToken', JSON.stringify(refreshToken));
    } else {
      localStorage.removeItem('refreshToken');
    }

    this.writeUserProfile(response);

    // Credentials and profile must describe the target, never the old provider.
    const credentials: Record<string, unknown> = {};
    credentials['accountId'] = accountId;
    ['countryCode', 'loginId', 'phoneNumber', 'primaryMobileNo'].forEach((field) => {
      if (response[field] !== undefined && response[field] !== null) credentials[field] = response[field];
    });
    this.writeSharedStorageObject('ynw-credentials', credentials);
    localStorage.removeItem('login');
    localStorage.removeItem('logout');
    localStorage.removeItem('googleToken');
  }

  private async requestProfile(token: string | null): Promise<Record<string, any>> {
    let headers = new HttpHeaders({ Accept: 'application/json', BOOKING_REQ_FROM: 'CUSTOM_APP' });
    const apiToken = token && !isBrowserSessionToken(token) ? token : null;
    // Also support direct SSO callers which do not pass through the route guard.
    if (!apiToken) this.deviceIdentity.bootstrapFromCurrentUrl();
    const { appId, installId } = this.deviceIdentity.getIdentity();
    const authorization = apiToken || (appId && installId ? `${appId}-${installId}` : null);
    if (authorization) headers = headers.set('Authorization', authorization);
    this.diagnostic('profile request', {
      tokenType: !token ? 'NONE' : apiToken ? 'API_TOKEN' : 'BROWSER_AUTHN',
      appIdPresent: !!appId, installIdPresent: !!installId,
      authMode: apiToken ? 'API_TOKEN' : authorization ? 'DEVICE_IDENTITY' : 'COOKIE_ONLY',
      hasAuthorization: headers.has('Authorization')
    });
    let profile: Record<string, any>;
    try {
      const result = await firstValueFrom(this.http.get<Record<string, any>>(this.apiUrl('spconsumer'), {
        headers, withCredentials: true, observe: 'response'
      }).pipe(timeout(10000)));
      this.diagnostic('profile result', { status: result.status });
      profile = result.body!;
    } catch (error) {
      this.diagnostic('profile result', { status: this.httpStatus(error) });
      throw error;
    }
    if (!profile || typeof profile !== 'object' || !profile['id']) {
      throw new CrossTenantSessionError('Provider session returned no customer profile');
    }
    return profile;
  }

  private sessionRefreshToken(response: CrossTenantSwitchResponse): string | null {
    return this.normalizeSessionToken(response.refreshToken);
  }

  private async requestSessionRefresh(refreshToken: string): Promise<{ token: string; refreshToken: string }> {
    const response = await firstValueFrom(this.http.post<{ token?: string; refreshToken?: string }>(
      this.apiUrl('consumer/oauth/token/refresh'),
      null,
      {
        // This must be an explicit backend refresh credential, never an authn descriptor.
        headers: new HttpHeaders({ Authorization: refreshToken, Accept: 'application/json', BOOKING_REQ_FROM: 'CUSTOM_APP' }),
        withCredentials: true
      }
    ).pipe(timeout(10000)));
    const token = this.normalizeSessionToken(response?.token);
    if (!token) throw new Error('Target session refresh returned no token');
    // If no rotation is supplied, retain the explicit credential used above.
    return { token, refreshToken: this.normalizeSessionToken(response.refreshToken) ?? refreshToken };
  }

  private hydrateUser(user: Record<string, any>, profile: Record<string, any>): Record<string, any> {
    return {
      ...user,
      ...profile,
      // spconsumer.id is the provider's customer ID; login.id can be a different ID.
      id: user['id'] ?? profile['id'],
      providerConsumer: profile['id'],
      token: user['token'],
      refreshToken: user['refreshToken'],
      status: user['status'],
      userName: [profile['title'], profile['firstName'], profile['lastName']].filter(Boolean).join(' ')
    };
  }

  private groupKey(): string {
    return String(this.parseStorageValue(sessionStorage.getItem('tabId'))
      ? this.parseStorageValue(sessionStorage.getItem('accountid')) ?? 0 : 0);
  }

  private readUser(): Record<string, any> {
    return this.readStoredObject(this.groupKey())['jld_scon'] as Record<string, any> || {};
  }

  private writeUserProfile(user: Record<string, any>): void {
    const key = this.groupKey();
    this.writeSharedStorageObject(key, { ...this.readStoredObject(key), jld_scon: user });
  }

  /**
   * LocalStorageService stores shared objects as a JSON string inside its own
   * JSON encoding. Accept both that format and the older single-encoded values.
   */
  private readStoredObject(key: string): Record<string, unknown> {
    let value: unknown = localStorage.getItem(key);
    try {
      for (let attempt = 0; attempt < 2 && typeof value === 'string'; attempt++) {
        value = JSON.parse(value);
      }
    } catch {
      return {};
    }
    return value && typeof value === 'object' && !Array.isArray(value)
      ? value as Record<string, unknown>
      : {};
  }

  private writeSharedStorageObject(key: string, value: Record<string, unknown>): void {
    localStorage.setItem(key, JSON.stringify(JSON.stringify(value)));
  }

  private clearRuntimeAccountState(): void {
    this.accountService.setActiveStore(null);
    this.accountService.setStores([]);
    this.accountService.setActiveLocation(null);
    this.accountService.setAccountLocations([]);
    this.consumerService.setOrderDetails(null);
  }

  private requestOptions(platformToken: string): { headers: HttpHeaders; withCredentials: true } {
    return {
      headers: new HttpHeaders({
        AuthToken: `platformToken-${platformToken}`,
        'Content-Type': 'application/json'
      }),
      withCredentials: true
    };
  }

  private apiUrl(path: string): string {
    const base = String(this.sharedService.getAPIEndPoint() || '').replace(/\/+$/, '');
    return `${base}/${path.replace(/^\/+/, '')}`;
  }

  private parseStorageValue(value: string | null): unknown {
    if (value === null) return null;
    try { return JSON.parse(value); } catch { return value; }
  }

  private httpStatus(error: unknown): number | null {
    // The HttpBackend and this remote can have different Angular class copies.
    // Match the HTTP status rather than an instanceof check across federation.
    return error && typeof error === 'object' && 'status' in error
      && typeof error.status === 'number' ? error.status : null;
  }

  private hasActiveSession(): boolean {
    if (typeof localStorage === 'undefined') return false;
    return !!this.readStoredObject('ynw-credentials')['accountId']
      && !!(this.readUser()['providerConsumer'] ?? this.readUser()['id']);
  }

  private currentSessionToken(): string | null {
    return this.getNormalizedStorageString('c_authorizationToken');
  }

  private getNormalizedStorageString(key: string): string | null {
    return this.normalizeSessionToken(
      this.parseStorageValue(localStorage.getItem(key))
    );
  }

  private diagnostic(event: string, metadata: Record<string, unknown>): void {
    if (isDevMode()) console.debug(`[CrossTenantSso] ${event}`, metadata);
  }

  private normalizeSessionToken(token: unknown): string | null {
    return normalizeStorageString(token);
  }
}
