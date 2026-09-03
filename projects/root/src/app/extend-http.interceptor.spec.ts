import { HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http';
import { firstValueFrom, of } from 'rxjs';
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
  const logout = jasmine.createSpyObj<CrossTenantLogoutService>('CrossTenantLogoutService', ['clearProviderState']);
  let interceptor: ExtendHttpInterceptor;

  beforeEach(() => {
    values.clear();
    platformTokens.save.calls.reset();
    logout.clearProviderState.calls.reset();
    interceptor = new ExtendHttpInterceptor(
      storage as any,
      jasmine.createSpyObj('router', ['navigate']),
      jasmine.createSpyObj('accountService', ['callMaintanance']),
      { getAPIEndPoint: () => 'https://api.example/v1/rest/', getJson: (value: any) => value } as any,
      jasmine.createSpyObj('authService', ['refreshToken', 'refresh', 'doLogout']),
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

  it('keeps session Authorization normally but sends logout without credentials', async () => {
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
    expect(captured!.headers.has('Authorization')).toBeFalse();
    expect(captured!.headers.has('AuthToken')).toBeFalse();
    expect(captured!.headers.has('SameSite')).toBeFalse();
    expect(logout.clearProviderState).toHaveBeenCalled();
  });

});
