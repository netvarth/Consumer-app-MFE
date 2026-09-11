import { HttpErrorResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { GroupStorageService, LocalStorageService, SessionStorageService } from 'jconsumer-shared';
import { CrossTenantLogoutService, PlatformTokenStore } from '@consumer/cross-tenant';
import { ConsumerAuthService } from './consumer-auth.service';

describe('ConsumerAuthService shared library integration', () => {
  let auth: ConsumerAuthService;
  let storage: LocalStorageService;
  let groups: GroupStorageService;
  let api: any;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    storage = new LocalStorageService();
    const session = new SessionStorageService();
    groups = new GroupStorageService(session, storage);
    api = { httpDelete: jasmine.createSpy().and.returnValue(of(true)), httpPost: jasmine.createSpy() };
    const platformTokens = new PlatformTokenStore();
    auth = new ConsumerAuthService(api, storage, session, groups, new CrossTenantLogoutService(platformTokens), platformTokens);
  });
  afterEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('saves the login platform identity before login subscribers run', async () => {
    api.httpPost.and.returnValue(of({ providerConsumer: 201, platform_token: 'platformToken-P1' }));
    await auth.consumerLogin({ accountId: 22 });
    expect(localStorage.getItem('platform_token')).toBe('P1');
    expect(auth.isLoggedIn()).toBeTrue();
  });

  it('captures platform identity when embedded authentication installs login data directly', () => {
    auth.setLoginData({ providerConsumer: 201, platformToken: 'P1' }, { accountId: 22 });
    expect(localStorage.getItem('platform_token')).toBe('P1');
    expect(auth.isLoggedIn()).toBeTrue();
  });

  it('captures OTP identity and preserves it when the subsequent login has only a session token', async () => {
    api.httpPost.and.returnValue(of({ platformToken: 'P1', token: 'OTP_SESSION' }));
    auth.verifyConsumerOTP('login', '123456').subscribe(() => {
      expect(localStorage.getItem('platform_token')).toBe('P1');
    });
    api.httpPost.and.returnValue(of({ providerConsumer: 201, token: 'PROVIDER_SESSION' }));
    await auth.consumerLogin({ accountId: 22 });
    expect(localStorage.getItem('platform_token')).toBe('P1');
  });

  it('captures platform rotation from a successful refresh only', async () => {
    localStorage.setItem('platform_token', 'P1');
    api.httpPost.and.returnValue(throwError(() => new HttpErrorResponse({ status: 401, error: { platform_token: 'BAD' } })));
    await expectAsync(auth.refreshToken()).toBeRejected();
    expect(localStorage.getItem('platform_token')).toBe('P1');
    api.httpPost.and.returnValue(of({ platform_token: 'P2', token: 'SESSION' }));
    await auth.refreshToken();
    expect(localStorage.getItem('platform_token')).toBe('P2');
  });

  it('rejects credentials without a provider customer', async () => {
    storage.setitemonLocalStorage('ynw-credentials', JSON.stringify({ accountId: 22 }));
    expect(auth.isLoggedIn()).toBeFalse();
    expect(await auth.goThroughLogin()).toBeFalse();
  });

  it('supports a complete cookie login without an explicit authorization token', async () => {
    storage.setitemonLocalStorage('ynw-credentials', JSON.stringify({ accountId: 22 }));
    groups.setitemToGroupStorage('jld_scon', { providerConsumer: 201 });
    expect(auth.isLoggedIn()).toBeTrue();
    expect(await auth.goThroughLogin()).toBeTrue();
  });

  it('preserves platform identity and other carts through the actual AuthService logout API', async () => {
    localStorage.setItem('platform_token', 'P1');
    localStorage.setItem('capp:activeAccountId:v1', '22');
    localStorage.setItem('capp:tenant-state:v1:11', 'OTHER_CART');
    localStorage.setItem('capp:tenant-state:v1:22', 'OLD_CURRENT_CART');
    storage.setitemonLocalStorage('ynw-credentials', '{}');
    groups.setitemToGroupStorage('jld_scon', { providerConsumer: 201 });
    spyOn(storage, 'clearLocalstorage').and.callThrough();
    await auth.doLogout();
    expect(api.httpDelete).toHaveBeenCalledWith('consumer/login');
    expect(storage.clearLocalstorage).not.toHaveBeenCalled();
    expect(localStorage.getItem('platform_token')).toBe('P1');
    expect(localStorage.getItem('capp:tenant-state:v1:11')).toBe('OTHER_CART');
    expect(localStorage.getItem('capp:tenant-state:v1:22')).toBeNull();
    expect(auth.isLoggedIn()).toBeFalse();
  });

  it('finishes local logout when the server rejects or cannot receive it', async () => {
    api.httpDelete.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    storage.setitemonLocalStorage('ynw-credentials', '{}');
    groups.setitemToGroupStorage('jld_scon', { providerConsumer: 201 });
    await auth.doLogout();
    expect(auth.isLoggedIn()).toBeFalse();
  });
});
