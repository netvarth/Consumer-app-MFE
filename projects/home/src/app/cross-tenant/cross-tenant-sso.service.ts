import { HttpBackend, HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';
import { SharedService } from 'jconsumer-shared';
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
    private readonly accountState: AccountStateCoordinator
  ) {
    this.http = new HttpClient(backend);
  }

  prepareForTargetAccount(accountId: number | string, customId: string): Promise<void> {
    const target = String(accountId).trim();
    const existing = this.inFlight.get(target);
    if (existing) return existing;

    const operation = this.prepare(target, String(customId || '').trim().toLowerCase())
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
      this.platformTokens.clear();
      throw error;
    }
  }

  private async prepare(target: string, customId: string): Promise<void> {
    const marker = this.journey.get();
    if (!marker) return;

    this.accountState.transitionTo(target);
    if (customId === marker.hubCustomId) {
      this.accountState.clearActiveAuthentication();
      this.accountState.setActiveAccount(target);
      return;
    }

    this.accountState.clearActiveAuthentication();
    if (!this.platformTokens.get()) {
      this.accountState.setActiveAccount(target);
      return;
    }

    try {
      const response = await this.switchAccount(target);
      this.installSession(response, target);
    } catch (error) {
      this.accountState.clearActiveAuthentication();
      if (error instanceof HttpErrorResponse && error.status === 401 && this.shouldClearPlatformToken(error)) {
        this.platformTokens.clear();
      }
      if (error instanceof HttpErrorResponse && (error.status === 401 || error.status === 422)) this.journey.clear();
      if (error instanceof HttpErrorResponse && error.status === 498) this.platformTokens.clear();
    } finally {
      this.accountState.setActiveAccount(target);
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
    }

    const groupKey = sessionStorage.getItem('tabId')
      ? this.parseStorageValue(sessionStorage.getItem('accountid'))
      : 0;
    const key = String(groupKey ?? 0);
    let group: Record<string, unknown> = {};
    try { group = JSON.parse(localStorage.getItem(key) || '{}') || {}; } catch { group = {}; }
    group['jld_scon'] = response;
    localStorage.setItem(key, JSON.stringify(group));

    let credentials: Record<string, unknown> = {};
    try { credentials = JSON.parse(localStorage.getItem('ynw-credentials') || '{}') || {}; } catch { credentials = {}; }
    credentials['accountId'] = accountId;
    ['countryCode', 'coountryCode', 'loginId', 'phoneNumber', 'primaryMobileNo'].forEach((field) => {
      if (response[field] !== undefined && response[field] !== null) credentials[field] = response[field];
    });
    localStorage.setItem('ynw-credentials', JSON.stringify(credentials));
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
