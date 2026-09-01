import { Injectable } from '@angular/core';
import { PLATFORM_TOKEN_KEY } from './cross-tenant.constants';

export interface AndroidPlatformTokenBridge {
  storePlatformToken?(token: string): void;
  updatePlatformToken?(token: string): void;
  getPlatformToken?(): string | null;
  clearPlatformToken?(): void;
}

declare global {
  interface Window {
    AndroidBridge?: AndroidPlatformTokenBridge;
    Android?: AndroidPlatformTokenBridge;
  }
}

@Injectable({ providedIn: 'root' })
export class PlatformTokenStore {
  get(): string | null {
    const bridge = this.bridgeFor('getPlatformToken');
    if (bridge?.getPlatformToken) {
      const token = bridge.getPlatformToken();
      return this.validToken(token) ? token.trim() : null;
    }
    const token = this.storage()?.getItem(PLATFORM_TOKEN_KEY);
    return this.validToken(token) ? token!.trim() : null;
  }

  save(token: string): void {
    if (!this.validToken(token)) return;
    const bridge = this.bridgeFor('storePlatformToken');
    if (bridge?.storePlatformToken) bridge.storePlatformToken(token);
    else this.storage()?.setItem(PLATFORM_TOKEN_KEY, token);
  }

  update(token: string): void {
    if (!this.validToken(token)) return;
    const bridge = this.bridgeFor('updatePlatformToken');
    if (bridge?.updatePlatformToken) bridge.updatePlatformToken(token);
    else this.storage()?.setItem(PLATFORM_TOKEN_KEY, token);
  }

  clear(): void {
    const bridge = this.bridgeFor('clearPlatformToken');
    if (bridge?.clearPlatformToken) bridge.clearPlatformToken();
    else this.storage()?.removeItem(PLATFORM_TOKEN_KEY);
  }

  private bridgeFor(method: keyof AndroidPlatformTokenBridge): AndroidPlatformTokenBridge | null {
    if (typeof window === 'undefined') return null;
    const candidates = [window.AndroidBridge, window.Android];
    return candidates.find((bridge) => typeof bridge?.[method] === 'function') || null;
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  private validToken(token: unknown): token is string {
    return typeof token === 'string' && token.trim().length > 0;
  }
}
