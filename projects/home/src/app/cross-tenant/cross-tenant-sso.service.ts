import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { AccountService, ConsumerService, SharedService } from 'jconsumer-shared';
import { CrossTenantJourneyService, PlatformTokenStore } from '@consumer/cross-tenant';
import { AccountStateCoordinator } from './account-state-coordinator.service';

export interface CrossTenantSwitchResponse {
  id?: number | string;
  providerConsumer?: number | string;
  token: string;
  refreshToken?: string;
  status: 'signed_in' | 'provisioned';
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class CrossTenantSsoService {
  private readonly http: HttpClient;
  private readonly inFlight = new Map<string, Promise<void>>();

  constructor(
    backend: HttpBackend,
    private readonly sharedService: SharedService,
    private readonly platformTokens: PlatformTokenStore,
    private readonly journey: CrossTenantJourneyService,
    private readonly accountState: AccountStateCoordinator,
    private readonly accountService: AccountService,
    private readonly consumerService: ConsumerService
  ) {
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
      if (!(error instanceof HttpErrorResponse) || error.status !== 498) throw error;
      await this.refreshPlatformToken();
      return this.requestSwitch(accountId);
    }
  }

  async refreshPlatformToken(): Promise<string> {
    const oldToken = this.platformTokens.get();
    if (!oldToken) throw new Error('No platform token is available');
    try {
      const response = await firstValueFrom(this.http.post<{ platform_token?: string }>(
        this.apiUrl('consumer/oauth/platformtoken/refresh'),
        null,
        this.requestOptions(oldToken)
      ).pipe(timeout(10000)));
      const refreshed = response?.platform_token;
      if (typeof refreshed !== 'string' || !refreshed.trim()) throw new Error('Platform token refresh returned no token');
      this.platformTokens.update(refreshed);
      return refreshed;
    } catch (error) {
      // Only a definitive credential rejection invalidates the native copy.
      // Offline, timeout, throttling, and server errors remain retryable.
      if (error instanceof HttpErrorResponse && error.status === 401) {
        this.platformTokens.clear();
      }
      throw error;
    }
  }

  private async prepare(target: string): Promise<void> {
    const marker = this.journey.get();
    if (!marker) {
      if (this.accountState.getActiveAccount() === target) return;
      if (!this.platformTokens.get()) {
        // Record the account during anonymous boot. A later navigation can
        // then detect that the authenticated platform session changed apps.
        this.accountState.setActiveAccount(target);
        return;
      }
    }

    if (!this.platformTokens.get()) {
      this.accountState.setActiveAccount(target);
      return;
    }

    try {
      const response = await this.switchAccount(target);
      // Commit local state only after the target session exists. A failed
      // request therefore leaves the source account usable.
      this.clearRuntimeAccountState();
      this.accountState.transitionTo(target);
      this.installSession(response, target);
      this.accountState.setActiveAccount(target);
      this.journey.clear();
    } catch (error) {
      const status = error instanceof HttpErrorResponse ? error.status : 'n/a';
      const reason = error instanceof Error ? error.message : String(error);
      console.warn(`[CrossTenantSso] Account switch failed target=${target} status=${status} reason=${reason}`);
      if (error instanceof HttpErrorResponse && error.status === 401 && this.shouldClearPlatformToken(error)) {
        this.platformTokens.clear();
      }
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 422)) this.journey.clear();
    }
  }

  private async requestSwitch(accountId: number | string): Promise<CrossTenantSwitchResponse> {
    const token = this.platformTokens.get();
    if (!token) throw new Error('No platform token is available');
    const response = await firstValueFrom(this.http.post<CrossTenantSwitchResponse>(
      this.apiUrl('consumer/login/switch'),
      { accountId },
      this.requestOptions(token)
    ).pipe(timeout(10000)));
    if (!response || typeof response.token !== 'string' || !response.token.trim()) {
      throw new Error('Account switch returned no session token');
    }
    if (response.status !== 'signed_in' && response.status !== 'provisioned') {
      throw new Error('Account switch returned an unsupported status');
    }
    return response;
  }

  private installSession(response: CrossTenantSwitchResponse, accountId: string): void {
    localStorage.setItem('c_authorizationToken', JSON.stringify(response.token));
    if (typeof response.refreshToken === 'string' && response.refreshToken.trim()) {
      localStorage.setItem('refreshToken', JSON.stringify(response.refreshToken));
    } else {
      localStorage.removeItem('refreshToken');
    }

    const groupKey = sessionStorage.getItem('tabId')
      ? this.parseStorageValue(sessionStorage.getItem('accountid'))
      : 0;
    const key = String(groupKey ?? 0);
    const group = this.readStoredObject(key);
    group['jld_scon'] = response;
    this.writeSharedStorageObject(key, group);

    const credentials = this.readStoredObject('ynw-credentials');
    credentials['accountId'] = accountId;
    ['countryCode', 'coountryCode', 'loginId', 'phoneNumber', 'primaryMobileNo'].forEach((field) => {
      if (response[field] !== undefined && response[field] !== null) credentials[field] = response[field];
    });
    this.writeSharedStorageObject('ynw-credentials', credentials);
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

  private shouldClearPlatformToken(error: HttpErrorResponse): boolean {
    const detail = typeof error.error === 'string'
      ? error.error
      : String(error.error?.message || error.error?.code || '');
    return !/NOT_REGISTERED_CUSTOMER|INACTIVE/i.test(detail);
  }
}
