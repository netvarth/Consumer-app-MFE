import { HttpErrorResponse, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of, Subject, throwError } from 'rxjs';
import { CrossTenantLogoutService, PlatformTokenStore } from '@consumer/cross-tenant';
import { ExtendHttpInterceptor } from './extend-http.interceptor';

describe('ExtendHttpInterceptor cross-tenant integration', () => {
  const values = new Map<string, any>();
  const storage = {
    getitemfromLocalStorage: (key: string) => values.get(key),
    setitemonLocalStorage: (key: string, value: any) => values.set(key, value),
    removeitemfromLocalStorage: (key: string) => values.delete(key)
  };
  const platformTokens = jasmine.createSpyObj<PlatformTokenStore>('PlatformTokenStore', ['save']);
  const logout = jasmine.createSpyObj<CrossTenantLogoutService>('CrossTenantLogoutService', ['clearProviderState', 'clearProviderAuthentication']);
  let auth: any;
  let interceptor: ExtendHttpInterceptor;

  beforeEach(() => {
    values.clear();
    platformTokens.save.calls.reset();
    logout.clearProviderState.calls.reset();
    logout.clearProviderAuthentication.calls.reset();
    auth = jasmine.createSpyObj('authService', ['refreshLogin', 'refreshToken', 'doLogout', 'sendMessage']);
    interceptor = new ExtendHttpInterceptor(
      storage as any,
      jasmine.createSpyObj('router', ['navigate']),
      jasmine.createSpyObj('accountService', ['callMaintanance']),
      { getAPIEndPoint: () => 'https://api.example/v1/rest/', getJson: (value: any) => value } as any,
      auth,
      platformTokens,
      logout
    );
  });

  it('captures platform_token without changing the normal login response', async () => {
    const body = { token: 'T1', platform_token: 'P1', status: 'ok' };
    const handler = { handle: () => of(new HttpResponse({ body })) } as HttpHandler;
    const response = await firstValueFrom(interceptor.intercept(
      new HttpRequest('POST', 'consumer/login', { loginId: '1' }),
      handler
    ));
    expect(platformTokens.save).toHaveBeenCalledWith('P1');
    expect((response as HttpResponse<any>).body).toBe(body);
  });

  it('does not capture unrelated responses containing a platform_token field', async () => {
    const handler = { handle: () => of(new HttpResponse({ body: { platform_token: 'not-a-login' } })) } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'consumer/profile'), handler));
    expect(platformTokens.save).not.toHaveBeenCalled();
  });

  it('captures the camel-case platformToken login response variant', async () => {
    const handler = { handle: () => of(new HttpResponse({ body: { platformToken: 'P2' } })) } as HttpHandler;
    await firstValueFrom(interceptor.intercept(
      new HttpRequest('POST', 'consumer/login', { loginId: '1' }),
      handler
    ));
    expect(platformTokens.save).toHaveBeenCalledWith('P2');
  });

  it('keeps session Authorization normally and uses device identity for logout', async () => {
    values.set('c_authorizationToken', 'SESSION');
    values.set('appId', 'APP');
    values.set('installId', 'INSTALL');
    values.set('googleToken', 'GOOGLE');
    let captured: HttpRequest<any> | undefined;
    const handler = {
      handle: (request: HttpRequest<any>) => {
        captured = request;
        return of(new HttpResponse({ body: true }));
      }
    } as HttpHandler;

    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'consumer/profile'), handler));
    expect(captured!.headers.get('Authorization')).toBe('SESSION');

    await firstValueFrom(interceptor.intercept(
      new HttpRequest('DELETE', 'consumer/login', null, { headers: captured!.headers }),
      handler
    ));
    expect(captured!.headers.get('Authorization')).toBe('APP-INSTALL');
    expect(captured!.headers.has('AuthToken')).toBeFalse();
    expect(captured!.headers.has('SameSite')).toBeFalse();
    expect(logout.clearProviderState).toHaveBeenCalled();
  });

  it('uses the current session for logout when no device identity exists', async () => {
    values.set('c_authorizationToken', 'SESSION');
    let captured: HttpRequest<any> | undefined;
    const handler = {
      handle: (request: HttpRequest<any>) => {
        captured = request;
        return of(new HttpResponse({ body: true }));
      }
    } as HttpHandler;

    await firstValueFrom(interceptor.intercept(new HttpRequest('DELETE', 'consumer/login'), handler));
    expect(captured!.headers.get('Authorization')).toBe('SESSION');
    // Header construction must not mutate auth before the server responds.
    expect(values.get('c_authorizationToken')).toBe('SESSION');
  });

  it('uses the refresh token only for a session refresh request', async () => {
    values.set('c_authorizationToken', 'SESSION');
    values.set('refreshToken', 'REFRESH');
    let captured: HttpRequest<any> | undefined;
    const handler = {
      handle: (request: HttpRequest<any>) => {
        captured = request;
        return of(new HttpResponse({ body: { token: 'NEW_SESSION' } }));
      }
    } as HttpHandler;

    await firstValueFrom(interceptor.intercept(
      new HttpRequest('POST', 'consumer/oauth/token/refresh', null),
      handler
    ));
    expect(captured!.headers.get('Authorization')).toBe('REFRESH');
    expect(captured!.headers.has('AuthToken')).toBeFalse();
  });

  it('does not let a leftover logout flag delete a newly switched token', async () => {
    values.set('logout', true);
    values.set('c_authorizationToken', 'TARGET');
    const handler = { handle: (request: HttpRequest<any>) => {
      expect(request.headers.get('Authorization')).toBe('TARGET');
      return of(new HttpResponse({ body: true }));
    } } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'consumer/cart', {}), handler));
    expect(values.get('c_authorizationToken')).toBe('TARGET');
  });

  it('does not send a stale Google login token on cart requests', async () => {
    values.set('googleToken', 'GOOGLE');
    values.set('c_authorizationToken', 'TARGET');
    const handler = { handle: (request: HttpRequest<any>) => {
      expect(request.headers.has('AuthToken')).toBeFalse();
      expect(request.headers.get('Authorization')).toBe('TARGET');
      return of(new HttpResponse({ body: true }));
    } } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'consumer/cart', {}), handler));
  });

  it('clears Google and logout flags after successful normal login', async () => {
    values.set('googleToken', 'GOOGLE');
    values.set('logout', true);
    const handler = { handle: (request: HttpRequest<any>) => {
      expect(request.headers.get('AuthToken')).toBe('GOOGLE');
      return of(new HttpResponse({ body: { platform_token: 'P1' } }));
    } } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'consumer/login', {}), handler));
    expect(values.has('googleToken')).toBeFalse();
    expect(values.has('logout')).toBeFalse();
  });

  it('handles absolute API URLs and leaves external responses alone', async () => {
    values.set('c_authorizationToken', 'SESSION');
    const handler = { handle: (request: HttpRequest<any>) => {
      expect(request.headers.get('Authorization')).toBe('SESSION');
      return of(new HttpResponse({ body: true }));
    } } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'https://api.example/v1/rest/spconsumer'), handler));
    const external = { handle: (request: HttpRequest<any>) => {
      expect(request.headers.has('Authorization')).toBeFalse();
      return of(new HttpResponse({ body: { platform_token: 'EXTERNAL' } }));
    } } as HttpHandler;
    await firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'https://other.example/consumer/login', {}), external));
    expect(platformTokens.save).not.toHaveBeenCalled();
  });

  function expiredHandler(): HttpHandler {
    return { handle: () => throwError(() => new HttpErrorResponse({ status: 419 })) } as HttpHandler;
  }

  it('retries concurrent cart requests after one refresh without duplicating location', async () => {
    values.set('c_authorizationToken', 'OLD');
    values.set('c-location', 42);
    const refresh = new Subject<any>();
    auth.refreshLogin.and.returnValue(refresh);
    const handler = { handle: (request: HttpRequest<any>) => {
      if (request.headers.get('Authorization') === 'OLD') return throwError(() => new HttpErrorResponse({ status: 419 }));
      expect(request.headers.get('Authorization')).toBe('NEW');
      expect(request.params.getAll('location')).toEqual(['42']);
      return of(new HttpResponse({ body: true }));
    } } as HttpHandler;
    const first = firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'consumer/cart', {}), handler));
    const second = firstValueFrom(interceptor.intercept(new HttpRequest('POST', 'consumer/cart', {}), handler));
    expect(auth.refreshLogin).toHaveBeenCalledTimes(1);
    refresh.next({ token: 'NEW', refreshToken: 'NEW_REFRESH' });
    refresh.complete();
    await Promise.all([first, second]);
    expect(values.get('refreshToken')).toBe('NEW_REFRESH');
  });

  it('rejects all refresh waiters on failure and allows a later retry', async () => {
    const refresh = new Subject<any>();
    auth.refreshLogin.and.returnValue(refresh);
    const first = firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'spconsumer'), expiredHandler())).catch(e => e);
    const second = firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'consumer/cart'), expiredHandler())).catch(e => e);
    refresh.error(new HttpErrorResponse({ status: 503 }));
    expect((await first).status).toBe(503);
    expect((await second).status).toBe(503);
    expect(logout.clearProviderAuthentication).not.toHaveBeenCalled();
    auth.refreshLogin.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401 })));
    await firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'spconsumer'), expiredHandler())).catch(() => undefined);
    expect(auth.refreshLogin).toHaveBeenCalledTimes(2);
    expect(logout.clearProviderAuthentication).toHaveBeenCalledTimes(1);
    expect(auth.doLogout).not.toHaveBeenCalled();
  });

  it('does not overwrite a newly switched session with a late refresh response', async () => {
    values.set('c_authorizationToken', 'SOURCE');
    const refresh = new Subject<any>();
    auth.refreshLogin.and.returnValue(refresh);
    const result = firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'spconsumer'), expiredHandler())).catch(e => e);
    values.set('c_authorizationToken', 'TARGET');
    values.set('refreshToken', 'TARGET_REFRESH');
    refresh.next({ token: 'LATE_SOURCE', refreshToken: 'LATE_REFRESH' });
    refresh.complete();
    expect((await result).message).toBe('Session changed during refresh');
    expect(values.get('c_authorizationToken')).toBe('TARGET');
    expect(values.get('refreshToken')).toBe('TARGET_REFRESH');
    expect(logout.clearProviderAuthentication).not.toHaveBeenCalled();
  });

  it('does not invalidate the target after a late source-account 419', async () => {
    values.set('c_authorizationToken', 'SOURCE');
    const pending = new Subject<any>();
    const result = firstValueFrom(interceptor.intercept(new HttpRequest('GET', 'spconsumer'),
      { handle: () => pending } as HttpHandler)).catch(e => e);
    values.set('c_authorizationToken', 'TARGET');
    pending.error(new HttpErrorResponse({ status: 419 }));
    expect((await result).status).toBe(419);
    expect(auth.refreshLogin).not.toHaveBeenCalled();
    expect(logout.clearProviderAuthentication).not.toHaveBeenCalled();
  });

});
