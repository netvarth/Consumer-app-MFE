import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpInterceptor,
  HttpHandler,
  HttpRequest,
  HttpErrorResponse
} from '@angular/common/http';
import { Observable, BehaviorSubject, throwError, EMPTY, from } from 'rxjs';
import { catchError, switchMap, filter, take, timeout, first } from 'rxjs/operators';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../environment';
import { AccountService } from './account.service';

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
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // If request URL starts with http (external), don't modify
    if (request.url.startsWith('http')) {
      return next.handle(request);
    }

    const isRefreshCall = request.url.includes('consumer/oauth/token/refresh');
    request = this.updateHeader(request, isRefreshCall);

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (this._isSessionExpiredError(error)) {
          // Handle token refresh flow
          return this._handleSessionExpired().pipe(
            switchMap(() => {
              // Retry original request with updated token
              const retryReq = this.updateHeader(request, false);
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

  private updateHeader(request: HttpRequest<any>, isRefreshCall: boolean): HttpRequest<any> {
    let headers = request.headers
      .set('Accept', 'application/json')
      .set('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0')
      .set('Pragma', 'no-cache')
      .set('SameSite', 'None')
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

    if (this.lStorageService.getitemfromLocalStorage('logout')) {
      this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
      const appId = this.lStorageService.getitemfromLocalStorage('appId');
      const installId = this.lStorageService.getitemfromLocalStorage('installId');
      if (appId && installId) {
        headers = headers.set('Authorization', `${appId}-${installId}`);
      }
    } else if (isRefreshCall) {
      // Use refresh token for refresh calls
      const refreshToken = this.lStorageService.getitemfromLocalStorage('refreshToken') || '';
      headers = headers.set('Authorization', refreshToken);
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
    if (googleToken) {
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
        switchMap(response => this.authService.refresh(response)),
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
