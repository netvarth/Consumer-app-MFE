import { Injectable } from '@angular/core';
import {
  ACTIVE_ACCOUNT_KEY,
  ACTIVE_AUTH_KEYS,
  RETAINED_ACCOUNT_KEYS,
  TENANT_STATE_PREFIX,
  TENANT_STATE_REGISTRY_KEY,
  TRANSIENT_ACCOUNT_KEYS
} from '@consumer/cross-tenant';

interface TenantStateSnapshot {
  version: 1;
  updatedAt: number;
  values: Record<string, string>;
}

type TenantRegistry = Record<string, { lastAccessed: number }>;

@Injectable({ providedIn: 'root' })
export class AccountStateCoordinator {
  private readonly staleAfterMs = 90 * 24 * 60 * 60 * 1000;

  transitionTo(targetAccountId: string): void {
    const target = this.validAccountId(targetAccountId);
    if (!target || typeof localStorage === 'undefined') return;
    const previous = this.validAccountId(localStorage.getItem(ACTIVE_ACCOUNT_KEY));
    if (previous === target) return;

    if (previous) this.snapshot(previous);
    this.clearRetainedMirrors();
    this.clearTransientState();
    this.clearActiveAuthentication();
    this.restore(target);
    this.cleanupStaleSnapshots(target);
  }

  setActiveAccount(accountId: string): void {
    const value = this.validAccountId(accountId);
    if (!value || typeof localStorage === 'undefined') return;
    localStorage.setItem(ACTIVE_ACCOUNT_KEY, value);
    this.touchRegistry(value);
  }

  getActiveAccount(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return this.validAccountId(localStorage.getItem(ACTIVE_ACCOUNT_KEY));
  }

  clearActiveAuthentication(): void {
    if (typeof localStorage === 'undefined') return;
    ACTIVE_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    this.removeProviderConsumerFromGroup();
  }

  clearTransientState(): void {
    if (typeof localStorage === 'undefined') return;
    TRANSIENT_ACCOUNT_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  private snapshot(accountId: string): void {
    const values: Record<string, string> = {};
    RETAINED_ACCOUNT_KEYS.forEach((key) => {
      const value = localStorage.getItem(key);
      if (value !== null) values[key] = value;
    });
    const snapshot: TenantStateSnapshot = { version: 1, updatedAt: Date.now(), values };
    localStorage.setItem(`${TENANT_STATE_PREFIX}${accountId}`, JSON.stringify(snapshot));
    this.touchRegistry(accountId);
  }

  private restore(accountId: string): void {
    try {
      const snapshot = JSON.parse(localStorage.getItem(`${TENANT_STATE_PREFIX}${accountId}`) || 'null') as TenantStateSnapshot | null;
      if (snapshot?.version !== 1 || !snapshot.values || typeof snapshot.values !== 'object') return;
      RETAINED_ACCOUNT_KEYS.forEach((key) => {
        const value = snapshot.values[key];
        if (typeof value === 'string') localStorage.setItem(key, value);
      });
    } catch {
      localStorage.removeItem(`${TENANT_STATE_PREFIX}${accountId}`);
    }
  }

  private clearRetainedMirrors(): void {
    RETAINED_ACCOUNT_KEYS.forEach((key) => localStorage.removeItem(key));
  }

  private removeProviderConsumerFromGroup(): void {
    if (typeof sessionStorage === 'undefined') return;
    const groupKey = sessionStorage.getItem('tabId')
      ? this.parseStorageValue(sessionStorage.getItem('accountid'))
      : 0;
    const key = String(groupKey ?? 0);
    const raw = localStorage.getItem(key);
    if (!raw) return;
    try {
      let group: unknown = JSON.parse(raw);
      if (typeof group === 'string') group = JSON.parse(group);
      if (group && typeof group === 'object') {
        delete (group as Record<string, unknown>)['jld_scon'];
        localStorage.setItem(key, JSON.stringify(JSON.stringify(group)));
      }
    } catch {
      localStorage.removeItem(key);
    }
  }

  private cleanupStaleSnapshots(activeAccountId: string): void {
    const registry = this.readRegistry();
    const cutoff = Date.now() - this.staleAfterMs;
    Object.entries(registry).forEach(([accountId, metadata]) => {
      if (accountId !== activeAccountId && metadata.lastAccessed < cutoff) {
        localStorage.removeItem(`${TENANT_STATE_PREFIX}${accountId}`);
        delete registry[accountId];
      }
    });
    localStorage.setItem(TENANT_STATE_REGISTRY_KEY, JSON.stringify(registry));
  }

  private touchRegistry(accountId: string): void {
    const registry = this.readRegistry();
    registry[accountId] = { lastAccessed: Date.now() };
    localStorage.setItem(TENANT_STATE_REGISTRY_KEY, JSON.stringify(registry));
  }

  private readRegistry(): TenantRegistry {
    try {
      const value = JSON.parse(localStorage.getItem(TENANT_STATE_REGISTRY_KEY) || '{}');
      return value && typeof value === 'object' ? value : {};
    } catch {
      return {};
    }
  }

  private validAccountId(value: unknown): string | null {
    if (typeof value !== 'string' && typeof value !== 'number') return null;
    const normalized = String(value).trim();
    return /^[A-Za-z0-9_-]+$/.test(normalized) ? normalized : null;
  }

  private parseStorageValue(value: string | null): unknown {
    if (value === null) return null;
    try { return JSON.parse(value); } catch { return value; }
  }
}
