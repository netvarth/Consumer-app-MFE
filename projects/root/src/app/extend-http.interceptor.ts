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
import { Observable, BehaviorSubject, throwError, EMPTY, from } from 'rxjs';
import { catchError, switchMap, filter, take, timeout, first, tap, map } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../environment';
import { AccountService } from './account.service';
import { CrossTenantLogoutService, PlatformTokenStore } from '@consumer/cross-tenant';

interface MaintenanceStatus {
  maintenanceMode: boolean;
  message?: string;
  // Add other expected fields here if needed
}

@Injectable()
export class ExtendHttpInterceptor implements HttpInterceptor {

  private _refreshSubject = new BehaviorSubject<string | null>(null);
  private _isRefreshing = false;

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

    // If request URL starts with http (external), don't modify
    if (request.url.startsWith('http')) {
      if (isLogout) {
        request = request.clone({
          headers: request.headers.delete('Authorization').delete('AuthToken')
        });
      }
      return this.observeAuthenticationResponse(next.handle(request), isNormalLogin, isLogout);
    }

    const isRefreshCall = request.url.includes('consumer/oauth/token/refresh');
    request = this.updateHeader(request, isRefreshCall, isLogout);

    return this.observeAuthenticationResponse(next.handle(request), isNormalLogin, isLogout).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this._isSessionExpiredError(error) && !isRefreshCall && !isNormalLogin && !isLogout) {
          // Handle token refresh flow
          return this._handleSessionExpired().pipe(
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
      params = params.append('location', this.lStorageService.getitemfromLocalStorage('c-location'));
    }

    if (skipAuthorization) {
      const sessionToken = this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
      headers = headers.delete('Authorization').delete('AuthToken');
      this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
      const appId = this.lStorageService.getitemfromLocalStorage('appId');
      const installId = this.lStorageService.getitemfromLocalStorage('installId');
      if (appId && installId) {
        headers = headers.set('Authorization', `${appId}-${installId}`);
      } else if (sessionToken) {
        headers = headers.set('Authorization', sessionToken);
      }
    } else if (isRefreshCall) {
      headers = headers.delete('AuthToken');
      const refreshToken = this.lStorageService.getitemfromLocalStorage('refreshToken');
      if (refreshToken) headers = headers.set('Authorization', refreshToken);
      else headers = headers.delete('Authorization');
    } else if (this.lStorageService.getitemfromLocalStorage('logout')) {
      this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
      const appId = this.lStorageService.getitemfromLocalStorage('appId');
      const installId = this.lStorageService.getitemfromLocalStorage('installId');
      if (appId && installId) {
        headers = headers.set('Authorization', `${appId}-${installId}`);
      }
    } else {
      // Use auth token for normal calls
      const authToken = this.lStorageService.getitemfromLocalStorage('c_authorizationToken');
      if (authToken) {
        headers = headers.set('Authorization', authToken);
      } else {
        const appId = this.lStorageService.getitemfromLocalStorage('appId');
        const installId = this.lStorageService.getitemfromLocalStorage('installId');
        if (appId && installId) {
          headers = headers.set('Authorization', `${appId}-${installId}`);
        }
      }
    }

    const googleToken = this.lStorageService.getitemfromLocalStorage('googleToken');
    if (!skipAuthorization && !isRefreshCall && googleToken) {
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


  private _handleSessionExpired(): Observable<string | null> {
    if (!this._isRefreshing) {
      this._isRefreshing = true;
      this._refreshSubject.next(null); // reset

      const ynwUser = this.sharedService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
      if (!ynwUser) {
        this._isRefreshing = false;
        this._handleRefreshFailure();
        return EMPTY;
      }

      return from(this.authService.refreshToken()).pipe(
        timeout(10000),
        map((response: any) => {
          const token = response?.token;
          if (typeof token !== 'string' || !token.trim()) {
            throw new Error('Session refresh returned no token');
          }
          this.lStorageService.setitemonLocalStorage('c_authorizationToken', token);
          return token;
        }),
        catchError(err => {
          this._handleRefreshFailure();
          return throwError(() => err);
        }),
        switchMap((token: string) => {
          this._isRefreshing = false;
          this._refreshSubject.next(token);
          return this._refreshSubject.pipe(
            filter(t => t !== null),
            take(1)
          );
        })
      );
    } else {
      // Wait for ongoing refresh to complete and get token from subject
      return this._refreshSubject.pipe(
        filter(token => token !== null),
        take(1)
      );
    }
  }

  private _handleRefreshFailure() {
    this._refreshSubject.next(null);
    this._isRefreshing = false;

    this.authService.doLogout().then(() => {
      this.router.navigate([this.sharedService.getRouteID()]);

      this.router.events.pipe(
        first(event => event instanceof NavigationEnd)
      ).subscribe(() => {
        window.location.reload();
      });
    });
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
