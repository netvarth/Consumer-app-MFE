import { Injectable } from '@angular/core';
import {
  ACTIVE_ACCOUNT_KEY,
  ACTIVE_AUTH_KEYS,
  CROSS_TENANT_SESSION_KEY,
  TENANT_STATE_PREFIX,
  TENANT_STATE_REGISTRY_KEY,
  TRANSIENT_ACCOUNT_KEYS
} from './cross-tenant.constants';
import { PlatformTokenStore } from './platform-token.store';

@Injectable({ providedIn: 'root' })
export class CrossTenantLogoutService {
  constructor(private readonly platformTokens: PlatformTokenStore) {}

  clearPersonState(): void {
    this.platformTokens.clear();
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CROSS_TENANT_SESSION_KEY);
    if (typeof localStorage === 'undefined') return;

    const keysToRemove: string[] = [];
    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);
      if (key?.startsWith(TENANT_STATE_PREFIX)) keysToRemove.push(key);
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
    [
      ACTIVE_ACCOUNT_KEY,
      TENANT_STATE_REGISTRY_KEY,
      'ynw-credentials',
      ...ACTIVE_AUTH_KEYS,
      ...TRANSIENT_ACCOUNT_KEYS
    ].forEach((key) => localStorage.removeItem(key));
    this.removeProviderConsumerFromGroup();
  }

  private removeProviderConsumerFromGroup(): void {
    if (typeof sessionStorage === 'undefined') return;
    const groupKey = sessionStorage.getItem('tabId')
      ? this.parseStoredValue(sessionStorage.getItem('accountid'))
      : 0;
    const raw = localStorage.getItem(String(groupKey ?? 0));
    if (!raw) return;
    try {
      const group = JSON.parse(raw);
      if (group && typeof group === 'object') {
        delete group.jld_scon;
        localStorage.setItem(String(groupKey ?? 0), JSON.stringify(group));
      }
    } catch {
      localStorage.removeItem(String(groupKey ?? 0));
    }
  }

  private parseStoredValue(value: string | null): unknown {
    if (value === null) return null;
    try { return JSON.parse(value); } catch { return value; }
  }
}
