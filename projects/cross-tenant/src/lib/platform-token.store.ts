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
    for (const bridge of this.nativeBridges()) {
      if (typeof bridge.getPlatformToken !== 'function') continue;
      try {
        const token = this.normalize(bridge.getPlatformToken());
        if (token) {
          this.storage()?.setItem(PLATFORM_TOKEN_KEY, token);
          return token;
        }
      } catch {
        // A broken/older native bridge must not hide a usable web fallback.
      }
    }
    return this.normalize(this.storage()?.getItem(PLATFORM_TOKEN_KEY));
  }

  save(token: string): void {
    const value = this.normalize(token);
    if (!value) return;
    this.storage()?.setItem(PLATFORM_TOKEN_KEY, value);
    for (const bridge of this.nativeBridges()) {
      try {
        if (typeof bridge.storePlatformToken === 'function') bridge.storePlatformToken(value);
        else if (typeof bridge.updatePlatformToken === 'function') bridge.updatePlatformToken(value);
      } catch {
        // localStorage remains a valid fallback for this WebView.
      }
    }
  }

  update(token: string): void {
    const value = this.normalize(token);
    if (!value) return;
    this.storage()?.setItem(PLATFORM_TOKEN_KEY, value);
    for (const bridge of this.nativeBridges()) {
      try {
        if (typeof bridge.updatePlatformToken === 'function') bridge.updatePlatformToken(value);
        else if (typeof bridge.storePlatformToken === 'function') bridge.storePlatformToken(value);
      } catch {
        // localStorage remains a valid fallback for this WebView.
      }
    }
  }

  clear(): void {
    this.storage()?.removeItem(PLATFORM_TOKEN_KEY);
    for (const bridge of this.nativeBridges()) {
      try { bridge.clearPlatformToken?.(); } catch { /* best-effort native cleanup */ }
    }
  }

  private nativeBridges(): AndroidPlatformTokenBridge[] {
    if (typeof window === 'undefined') return [];
    return Array.from(new Set([window.AndroidBridge, window.Android].filter(
      (bridge): bridge is AndroidPlatformTokenBridge => !!bridge
    )));
  }

  private storage(): Storage | null {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  /** Keep one raw platform-token representation across legacy native bridges. */
  private normalize(token: unknown): string | null {
    if (typeof token !== 'string') return null;
    let value = token.trim();
    for (let attempt = 0; attempt < 2 && value.startsWith('"') && value.endsWith('"'); attempt += 1) {
      try {
        const parsed = JSON.parse(value);
        if (typeof parsed !== 'string') return null;
        value = parsed.trim();
      } catch {
        return null;
      }
    }
    value = value.replace(/^(?:platformToken-)+/i, '').trim();
    if (!value || /^(?:null|undefined|\[object Object\])$/i.test(value)) return null;
    return /[\u0000-\u001f\u007f]/.test(value) ? null : value;
  }
}
