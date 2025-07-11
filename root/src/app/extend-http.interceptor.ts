import { catchError, switchMap } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, EMPTY, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AuthService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../environment';

@Injectable()
export class ExtendHttpInterceptor implements HttpInterceptor {

  private _refreshSubject: Subject<any> = new Subject<any>();
  private _maintananceSubject: Subject<any> = new Subject<any>();
  target: any;


  constructor(
    private lStorageService: LocalStorageService,
    private router: Router,
    private authService: AuthService,
    private sharedService: SharedService
  ) { 
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {    
    if (request.url.substr(0, 4) === 'http') {
      return next.handle(request);
    }
    if (this.lStorageService.getitemfromLocalStorage('c-location') && request.method!=='GET') {
      request = request.clone({
        params: this.getModifiedParams(request.params)
      });      
    }
    request = request.clone({ headers: request.headers.set('Accept', 'application/json'), withCredentials: true });
    request = request.clone({ headers: request.headers.append('Cache-Control', 'no-cache, no-store, must-revalidate, post-check=0, pre-check=0'), withCredentials: true });
    request = request.clone({ headers: request.headers.append('Pragma', 'no-cache'), withCredentials: true });
    request = request.clone({ headers: request.headers.append('SameSite', 'None'), withCredentials: true });
    request = request.clone({ headers: request.headers.append('Expires', '0'), withCredentials: true });
    if (Intl.DateTimeFormat().resolvedOptions().timeZone) {
      request = request.clone({ headers: request.headers.append('timezone', Intl.DateTimeFormat().resolvedOptions().timeZone), withCredentials: true });
    }
    // Custom Website *******************

    // if (this.lStorageService.getitemfromLocalStorage('source')) {
    //   request = request.clone({ headers: request.headers.append('BOOKING_REQ_FROM', 'CUSTOM_WEBSITE'), withCredentials: true });
    //   request = request.clone({ headers: request.headers.append('website-link', this.lStorageService.getitemfromLocalStorage('source')), withCredentials: true });
    //   // **********************************
    // } else {
    // QR Link **************************
    request = request.clone({ headers: request.headers.append('BOOKING_REQ_FROM', 'WEB_LINK'), withCredentials: true });
    // **********************************
    // }
    if (this.lStorageService.getitemfromLocalStorage('logout')) {
      this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    } 
    if (this.lStorageService.getitemfromLocalStorage('ynw-credentials')) {
      this.lStorageService.removeitemfromLocalStorage('c_authorizationToken');
    } else {
      if (this.lStorageService.getitemfromLocalStorage('googleToken')) {
        request = request.clone({ headers: request.headers.append('authToken', this.lStorageService.getitemfromLocalStorage('googleToken')), withCredentials: true });
      }
      if (this.lStorageService.getitemfromLocalStorage("c_authorizationToken")) {
        request = request.clone({ headers: request.headers.append('authorization', this.lStorageService.getitemfromLocalStorage("c_authorizationToken")), withCredentials: true });
      } else if (!this.lStorageService.getitemfromLocalStorage('logout')){
        request = request.clone({ headers: request.headers.append('authorization', 'browser'), withCredentials: true });
      }
    }        
    request = request.clone({ url: projectConstants.APIENDPOINT + request.url, responseType: 'json' });
    const _this = this;
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (_this._checkSessionExpiryErr(error)) {
          return _this._ifSessionExpiredN().pipe(
            switchMap(() => {
              return EMPTY;
            })
          );
        } else if (_this._checkMaintanance(error)) {
          return _this._ifMaintenanceOn().pipe(
            switchMap(() => {
              _this.router.navigate(['maintenance']);
              return EMPTY;
            })
          );
        }
        return throwError(error);
      })
    );
  }

  private getModifiedParams(params: any): HttpParams {
    return params.append('location', this.lStorageService.getitemfromLocalStorage('c-location'));
  }

  private _checkMaintanance(error: HttpErrorResponse): boolean {
    if (error.status && error.status === 405)
      return true;
    return false
  }

  private _ifSessionExpiredN() {
    const _this = this;

    _this._refreshSubject.subscribe({
      complete: () => {
        _this._refreshSubject = new Subject<any>();
      }
    });
    // let fullPath = window.location.href;
    // const origin = `${this.platformLocation.protocol}//${this.platformLocation.hostname}${this.platformLocation.port ? ':' + this.platformLocation.port : ''}/csite/`;
    // let target = fullPath.split(origin)[1];
    // this.lStorageService.setitemonLocalStorage('target', target);
    // console.log("Target:", _this.target);
    if (_this._refreshSubject.observers.length === 1) {
      _this.authService.doLogout().then(
        (refreshSubject: any) => {
          _this._refreshSubject.next(refreshSubject);
          // _this.accountService.sendMessage({ ttype: 'refresh' });
          _this.router.navigate([_this.sharedService.getRouteID()]);
        });
    }
    return _this._refreshSubject;
  }
  private _ifMaintenanceOn() {
    this._maintananceSubject.subscribe({
      complete: () => {
        this._maintananceSubject = new Subject<any>();
      }
    });
    if (this._maintananceSubject.observers.length === 1) {
      this.sharedService.callMaintanance().then(
        (refreshSubject: any) => {
          this._maintananceSubject.next(refreshSubject);
        }
      );
    }
    return this._maintananceSubject;
  }
  private _checkSessionExpiryErr(error: HttpErrorResponse): boolean {
    return (
      error.status &&
      error.status === 419 || (error.status === 401 && error.error === 'Session Already Exist')
    );
  }
}
