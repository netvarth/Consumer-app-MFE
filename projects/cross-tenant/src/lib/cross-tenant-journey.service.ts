import { Injectable } from '@angular/core';
import { CROSS_TENANT_SESSION_KEY } from './cross-tenant.constants';
import { validatedProviderLink } from './provider-link';

export interface CrossTenantSession {
  enabled: true;
  hubCustomId: string;
  returnTo: string;
  startedAt: number;
  lastProviderUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CrossTenantJourneyService {
  private readonly maximumAgeMs = 24 * 60 * 60 * 1000;

  start(hubCustomId: string, returnTo: string, providerUrl: string): void {
    if (typeof sessionStorage === 'undefined') return;
    const marker: CrossTenantSession = {
      enabled: true,
      hubCustomId: hubCustomId.trim().toLowerCase(),
      returnTo,
      startedAt: Date.now(),
      lastProviderUrl: providerUrl
    };
    if (!this.isSafeReturnTo(marker.returnTo, marker.hubCustomId)) return;
    sessionStorage.setItem(CROSS_TENANT_SESSION_KEY, JSON.stringify(marker));
  }

  get(): CrossTenantSession | null {
    if (typeof sessionStorage === 'undefined') return null;
    try {
      const marker = JSON.parse(sessionStorage.getItem(CROSS_TENANT_SESSION_KEY) || 'null');
      if (!this.isValid(marker)) {
        this.clear();
        return null;
      }
      return marker;
    } catch {
      this.clear();
      return null;
    }
  }

  clear(): void {
    if (typeof sessionStorage !== 'undefined') sessionStorage.removeItem(CROSS_TENANT_SESSION_KEY);
  }

  private isValid(value: any): value is CrossTenantSession {
    return value?.enabled === true
      && typeof value.hubCustomId === 'string'
      && /^[a-z0-9_-]+$/i.test(value.hubCustomId)
      && typeof value.startedAt === 'number'
      && value.startedAt <= Date.now()
      && Date.now() - value.startedAt <= this.maximumAgeMs
      && validatedProviderLink(value.lastProviderUrl) !== null
      && this.isSafeReturnTo(value.returnTo, value.hubCustomId);
  }

  private isSafeReturnTo(value: unknown, hubCustomId: string): value is string {
    if (typeof value !== 'string' || typeof window === 'undefined') return false;
    try {
      const url = new URL(value, window.location.origin);
      return url.origin === window.location.origin
        && (url.pathname === `/capp/${hubCustomId}` || url.pathname.startsWith(`/capp/${hubCustomId}/`));
    } catch {
      return false;
    }
  }
}
