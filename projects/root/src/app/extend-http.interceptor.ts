import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse,
  HttpResponse,
  HttpEventType
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, EMPTY, defer } from 'rxjs';
import { catchError, switchMap, timeout, tap, map, finalize, shareReplay } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { AccountService } from './account.service';
import { ACTIVE_ACCOUNT_KEY, CrossTenantLogoutService, isBrowserSessionToken, PlatformTokenStore } from '@consumer/cross-tenant';

interface MaintenanceStatus {
  maintenanceMode: boolean;
  message?: string;
  // Add other expected fields here if needed
}

@Injectable()
export class ExtendHttpInterceptor implements HttpInterceptor {

  private sessionRefresh: { context: string; result: Observable<string> } | null = null;

  private _maintenanceSubject = new BehaviorSubject<MaintenanceStatus | null>(null);
  private _maintenanceInProgress = false;

  constructor(
    private lStorageService: LocalStorageService,
    private router: Router,
    private accountService: AccountService,
    private sharedService: SharedService,
    private authService: AuthService,
    private platformTokenStore: PlatformTokenStore,
    private crossTenantLogout: CrossTenantLogoutService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const isNormalLogin = this.isExactConsumerLogin(request, 'POST');
    const isLogout = this.isExactConsumerLogin(request, 'DELETE');

    // Absolute URLs for this API need the same auth/refresh handling as relative
    // URLs. CDN and third-party requests must never receive our credentials.
    if (/^https?:\/\//i.test(request.url)
      && !request.url.startsWith(this.sharedService.getAPIEndPoint().replace(/\/+$/, '') + '/')) {
      return next.handle(request);
    }

    const isRefreshCall = request.url.includes('consumer/oauth/token/refresh');
    const context = this.sessionContext();
    request = this.updateHeader(request, isRefreshCall, isLogout);

    return this.observeAuthenticationResponse(next.handle(request), isNormalLogin, isLogout).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this._isSessionExpiredError(error) && !isRefreshCall && !isNormalLogin && !isLogout) {
          if (context !== this.sessionContext()) return throwError(() => error);
          // Handle token refresh flow
          return this._handleSessionExpired(context).pipe(
            switchMap(() => {
              // Retry original request with updated token
              const retryReq = this.updateHeader(request, false, isLogout);
              return next.handle(retryReq);
            })
          );
        } else if (this._isMaintenanceError(error)) {
          // Handle maintenance mode
          return this._handleMaintenance().pipe(
            switchMap(() => {
              this.router.navigate(['maintenance']);
              return EMPTY;
            })
          );
        }
        // Other errors: rethrow
        return throwError(() => error);
      })
    );
  }

  private updateHeader(request: HttpRequest<any>, isRefreshCall: boolean, skipAuthorization = false): HttpRequest<any> {
    let headers = request.headers
      .set('Accept', 'application/json')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
      .set('Pragma', 'no-cache')
      .set('Expires', '0')
      .set('BOOKING_REQ_FROM', 'CUSTOM_APP');

    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      headers = headers.set('timezone', timezone);
    }

    let params = request.params;
    if (this.lStorageService.getitemfromLocalStorage('c-location') && request.method !== 'GET') {
      params = params.set('location', this.lStorageService.getitemfromLocalStorage('c-location'));
    }

    const sessionToken = this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
    const browserSession = isBrowserSessionToken(sessionToken);
    if (skipAuthorization) {
      headers = headers.delete('Authorization').delete('AuthToken');
      const appId = this.lStorageService.getitemfromLocalStorage('appId');
      const installId = this.lStorageService.getitemfromLocalStorage('installId');
      if (!browserSession && appId && installId) {
        headers = headers.set('Authorization', `${appId}-${installId}`);
      } else if (sessionToken && !browserSession) {
        headers = headers.set('Authorization', sessionToken);
      }
    } else if (isRefreshCall) {
      headers = headers.delete('AuthToken');
      const refreshToken = this.lStorageService.getitemfromLocalStorage('refreshToken');
      if (refreshToken && !isBrowserSessionToken(refreshToken)) headers = headers.set('Authorization', refreshToken);
      else headers = headers.delete('Authorization');
    } else {
      headers = headers.delete('Authorization').delete('AuthToken');
      // A browser session descriptor is not a header credential. Sending it
      // overrides the valid cookie session and produces "Invalid Token format".
      if (sessionToken && !browserSession) {
        headers = headers.set('Authorization', sessionToken);
      } else if (!browserSession) {
        const appId = this.lStorageService.getitemfromLocalStorage('appId');
        const installId = this.lStorageService.getitemfromLocalStorage('installId');
        if (appId && installId) {
          headers = headers.set('Authorization', `${appId}-${installId}`);
        }
      }
    }

    const googleToken = this.lStorageService.getitemfromLocalStorage('googleToken');
    if (!skipAuthorization && !isRefreshCall && googleToken
      && /(?:consumer\/login|consumer)$/.test(request.url.split('?')[0])) {
      headers = headers.set('authToken', googleToken);
    }
    // ✅ Guard against double-prefixing full URLs
    const finalUrl = request.url.startsWith('http')
      ? request.url
      : this.sharedService.getAPIEndPoint() + request.url;
    return request.clone({
      headers,
      params,
      url: finalUrl,
      responseType: 'json',
      withCredentials: true,
    });
  }

  private observeAuthenticationResponse(
    response$: Observable<HttpEvent<any>>,
    isNormalLogin: boolean,
    isLogout: boolean
  ): Observable<HttpEvent<any>> {
    if (!isNormalLogin && !isLogout) return response$;
    return response$.pipe(
      tap((event) => {
        // Native-federation remotes can load a separate Angular class copy,
        // so instanceof HttpResponse is not reliable across the boundary.
        if (event.type !== HttpEventType.Response) return;
        const response = event as HttpResponse<any>;
        if (isNormalLogin) {
          this.lStorageService.removeitemfromLocalStorage('logout');
          this.lStorageService.removeitemfromLocalStorage('googleToken');
          const token = response.body?.platform_token ?? response.body?.platformToken;
          if (typeof token === 'string' && token.trim()) {
            this.platformTokenStore.save(token);
          }
        }
        if (isLogout) this.crossTenantLogout.clearProviderState();
      })
    );
  }

  private isExactConsumerLogin(request: HttpRequest<any>, method: 'POST' | 'DELETE'): boolean {
    if (request.method.toUpperCase() !== method) return false;
    const urlWithoutQuery = request.url.split('?')[0].replace(/\/+$/, '');
    return /(?:^|\/)consumer\/login$/.test(urlWithoutQuery);
  }

  private _isSessionExpiredError(error: HttpErrorResponse): boolean {
    return error.status === 419;
  }

  private _isMaintenanceError(error: HttpErrorResponse): boolean {
    return error.status === 405;
  }


  private _handleSessionExpired(context: string): Observable<string> {
    if (this.sessionRefresh?.context === context) return this.sessionRefresh.result;
    // Use the observable API. The library's Promise wrapper writes refreshToken
    // before callers can reject a response belonging to a previous account.
    const result = defer(() => this.authService.refreshLogin()).pipe(
        timeout(10000),
        map((response: any) => {
          if (context !== this.sessionContext()) throw new Error('Session changed during refresh');
          const token = response?.token;
          if (typeof token !== 'string' || !token.trim()) {
            throw new Error('Session refresh returned no token');
          }
          this.lStorageService.setitemonLocalStorage('c_authorizationToken', token);
          this.lStorageService.setitemonLocalStorage('refreshToken', response.refreshToken || token);
          return token;
        }),
        catchError(err => {
          if (context === this.sessionContext() && (err.status === 401 || err.status === 419)) {
            this.crossTenantLogout.clearProviderAuthentication();
            this.authService.sendMessage({ ttype: 'refresh', action: false });
          }
          return throwError(() => err);
        }),
        finalize(() => {
          if (this.sessionRefresh?.result === result) this.sessionRefresh = null;
        }),
        // Both success and failure reach every waiting request; nobody remains
        // subscribed to a null-only subject after a failed refresh.
        shareReplay({ bufferSize: 1, refCount: true })
    );
    this.sessionRefresh = { context, result };
    return result;
  }

  private sessionContext(): string {
    return JSON.stringify([
      typeof localStorage === 'undefined' ? null : localStorage.getItem(ACTIVE_ACCOUNT_KEY),
      this.lStorageService.getitemfromLocalStorage('c_authorizationToken'),
      this.lStorageService.getitemfromLocalStorage('ynw-credentials')
    ]);
  }

  private _handleMaintenance(): Observable<MaintenanceStatus | null> {
    if (!this._maintenanceInProgress) {
      this._maintenanceInProgress = true;

      this.accountService.callMaintanance()
        .then((data: any) => {
          this._maintenanceSubject.next(data);
          this._maintenanceSubject.complete();
          this._maintenanceInProgress = false;
        })
        .catch(err => {
          this._maintenanceSubject.error(err);
          this._maintenanceSubject = new BehaviorSubject<MaintenanceStatus | null>(null);
          this._maintenanceInProgress = false;
        });
    }

    return this._maintenanceSubject.asObservable();
  }
}
