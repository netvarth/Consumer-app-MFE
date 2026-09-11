import { DOCUMENT } from '@angular/common';
import { Inject, Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from 'jconsumer-shared';
import { normalizeStorageString } from './normalize-storage-string';

/** Shared by early bootstrap and legacy component query-param subscriptions. */
export function persistDeviceIdentity(
  params: Record<string, unknown>,
  storage: Pick<LocalStorageService, 'setitemonLocalStorage'>
): void {
  for (const [param, key] of [['app_id', 'appId'], ['inst_id', 'installId']]) {
    const value = normalizeStorageString(params?.[param]);
    // Missing/invalid URL fields must not erase an existing identity.
    if (value) storage.setitemonLocalStorage(key, value);
  }
}

// Bundle locally like browser-session-token: independently deployed remotes must
// not require a new export from an older @consumer/cross-tenant shared runtime.
@Injectable({ providedIn: 'root' })
export class DeviceIdentityService {
  constructor(
    private readonly storage: LocalStorageService,
    @Inject(DOCUMENT) private readonly document: Document,
    @Optional() private readonly router: Router
  ) {}

  bootstrapFromCurrentUrl(): void {
    try {
      // During SPA navigation the address bar can still contain the source URL.
      const pending = this.router?.getCurrentNavigation()?.extractedUrl.queryParams;
      const params = pending ?? {};
      if (!pending) {
        new URL(this.document.URL).searchParams.forEach((value, key) => { params[key] = value; });
      }
      persistDeviceIdentity(params, this.storage);
    } catch {
      // Malformed URLs or unavailable browser storage must not crash startup.
    }
  }

  getIdentity(): { appId: string | null; installId: string | null } {
    const read = (key: string): string | null => {
      try {
        // The library reader unconditionally JSON.parses and rejects legacy raw
        // strings. Normalize both formats using the same helper as session tokens.
        return normalizeStorageString(this.document.defaultView?.localStorage.getItem(key));
      } catch {
        return null;
      }
    };
    return { appId: read('appId'), installId: read('installId') };
  }
}
