import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AccountService, ConsumerService, GroupStorageService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { PlatformTokenStore } from '@consumer/cross-tenant';
import { AccountStateCoordinator } from './account-state-coordinator.service';
import { CrossTenantSsoService } from './cross-tenant-sso.service';

describe('CrossTenantSsoService', () => {
  const api = 'https://api.example/v1/rest/';
  const browserToken = btoa(JSON.stringify({
    acc: '128621', app: 'browser', isl: 'TEST_BROWSER_SESSION', dev: 'browser', typ: 'authn'
  }));
  let service: CrossTenantSsoService;
  let http: HttpTestingController;
  let state: AccountStateCoordinator;
  let platform: PlatformTokenStore;
  let groups: GroupStorageService;
  let storage: LocalStorageService;

  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: SharedService, useValue: { getAPIEndPoint: () => api } },
      { provide: AccountService, useValue: jasmine.createSpyObj('AccountService',
        ['setActiveStore', 'setStores', 'setActiveLocation', 'setAccountLocations']) },
      { provide: ConsumerService, useValue: jasmine.createSpyObj('ConsumerService', ['setOrderDetails']) }
    ] });
    service = TestBed.inject(CrossTenantSsoService);
    http = TestBed.inject(HttpTestingController);
    state = TestBed.inject(AccountStateCoordinator);
    platform = TestBed.inject(PlatformTokenStore);
    groups = TestBed.inject(GroupStorageService);
    storage = TestBed.inject(LocalStorageService);
    platform.save('P1');
  });
  afterEach(() => { http.verify(); localStorage.clear(); sessionStorage.clear(); });

  function seedSession(accountId: string, token: string | null = 'OLD_SESSION'): void {
    state.setActiveAccount(accountId);
    storage.setitemonLocalStorage('ynw-credentials', JSON.stringify({ accountId, loginId: 'old-login' }));
    groups.setitemToGroupStorage('jld_scon', { id: 100, providerConsumer: 101, firstName: 'Source' });
    if (token) storage.setitemonLocalStorage('c_authorizationToken', token);
  }
  function flushSwitch(): void {
    http.expectOne(api + 'consumer/login/switch').flush({
      token: 'TARGET_SESSION', refreshToken: 'TARGET_REFRESH', status: 'signed_in', id: 200
    });
    flushMicrotasks();
    const profile = http.expectOne(api + 'spconsumer');
    expect(profile.request.headers.get('Authorization')).toBe('TARGET_SESSION');
    expect(profile.request.headers.has('AuthToken')).toBeFalse();
    profile.flush({ id: 201, firstName: 'Target', lastName: 'Customer' });
    flushMicrotasks();
  }

  it('sends only platform AuthToken and accountId to switch', fakeAsync(() => {
    service.switchAccount(22);
    const request = http.expectOne(api + 'consumer/login/switch');
    expect(request.request.body).toEqual({ accountId: 22 });
    expect(request.request.headers.get('AuthToken')).toBe('platformToken-P1');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ token: 'TARGET', status: 'signed_in' });
    flushMicrotasks();
  }));

  for (const status of ['signed_in', 'provisioned']) {
    it(`validates the ${status} browser switch using cookies before installing the user`, fakeAsync(() => {
      seedSession('127427');
      storage.setitemonLocalStorage('login', true);
      storage.setitemonLocalStorage('logout', true);
      storage.setitemonLocalStorage('refreshToken', 'SOURCE_REFRESH');
      let ready = false;
      service.prepareForTargetAccount('128621', 'subapp').then(() => ready = true);
      http.expectOne(api + 'consumer/login/switch').flush({
        id: 482, providerConsumer: 219232, userType: 8, accStatus: 'ACTIVE',
        firstName: 'Target', lastName: 'Customer', userName: 'Target Customer',
        token: browserToken, status
      });
      flushMicrotasks();

      const profile = http.expectOne(api + 'spconsumer');
      expect(profile.request.headers.has('Authorization')).toBeFalse();
      expect(profile.request.headers.has('AuthToken')).toBeFalse();
      expect(profile.request.withCredentials).toBeTrue();
      expect(ready).toBeFalse();
      profile.flush({ id: 219232, firstName: 'Target', lastName: 'Customer' });
      flushMicrotasks();
      expect(ready).toBeTrue();
      expect(state.getActiveAccount()).toBe('128621');
      expect(storage.getitemfromLocalStorage('c_authorizationToken')).toBe(browserToken);
      expect(JSON.parse(storage.getitemfromLocalStorage('ynw-credentials'))).toEqual({ accountId: '128621' });
      expect(groups.getitemFromGroupStorage('jld_scon')).toEqual(jasmine.objectContaining({
        id: 482, providerConsumer: 219232, userName: 'Target Customer', token: browserToken, status
      }));
      expect(storage.getitemfromLocalStorage('login')).toBeNull();
      expect(storage.getitemfromLocalStorage('logout')).toBeNull();
      expect(storage.getitemfromLocalStorage('refreshToken')).toBeNull();
      expect(platform.get()).toBe('P1');
    }));
  }

  it('rejects a browser switch when cookies still identify the source customer', fakeAsync(() => {
    seedSession('127427');
    service.prepareForTargetAccount('128621', 'subapp');
    http.expectOne(api + 'consumer/login/switch').flush({
      token: browserToken, status: 'signed_in', providerConsumer: 219232
    });
    flushMicrotasks();
    http.expectOne(api + 'spconsumer').flush({ id: 101, firstName: 'Source' });
    flushMicrotasks();
    expect(storage.getitemfromLocalStorage('ynw-credentials')).toBeNull();
    expect(groups.getitemFromGroupStorage('jld_scon')).toBeUndefined();
    expect(platform.get()).toBe('P1');
  }));

  it('installs a complete customer only after the target profile is available', fakeAsync(() => {
    seedSession('11');
    let ready = false;
    service.prepareForTargetAccount('22', 'provider').then(() => ready = true);
    http.expectOne(api + 'consumer/login/switch').flush({ token: 'TARGET', status: 'provisioned', id: 200 });
    flushMicrotasks();
    expect(ready).toBeFalse();
    expect(state.getActiveAccount()).toBe('11');
    http.expectOne(api + 'spconsumer').flush({ id: 201, firstName: 'Target', lastName: 'Customer' });
    flushMicrotasks();
    expect(ready).toBeTrue();
    expect(state.getActiveAccount()).toBe('22');
    expect(groups.getitemFromGroupStorage('jld_scon')).toEqual(jasmine.objectContaining({
      id: 200, providerConsumer: 201, userName: 'Target Customer', token: 'TARGET'
    }));
    const credentials = JSON.parse(storage.getitemfromLocalStorage('ynw-credentials'));
    expect(credentials.accountId).toBe('22');
    expect(credentials.loginId).toBeUndefined();
  }));

  it('isolates carts through A -> B -> A with the real shared storage services', fakeAsync(() => {
    seedSession('11');
    storage.setitemonLocalStorage('cartData', { owner: '11' });
    storage.setitemonLocalStorage('storeEncId', 'STORE_11');
    service.prepareForTargetAccount('22', 'provider');
    flushSwitch();
    expect(storage.getitemfromLocalStorage('cartData')).toBeNull();
    expect(storage.getitemfromLocalStorage('storeEncId')).toBeNull();
    storage.setitemonLocalStorage('cartData', { owner: '22' });
    service.prepareForTargetAccount('11', 'hub');
    flushSwitch();
    expect(storage.getitemfromLocalStorage('cartData')).toEqual({ owner: '11' });
    expect(platform.get()).toBe('P1');
  }));

  it('clears credentials, user and token on a failed switch', fakeAsync(() => {
    seedSession('11');
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'consumer/login/switch').flush('Invalid switch', { status: 422, statusText: 'Rejected' });
    flushMicrotasks();
    expect(state.getActiveAccount()).toBe('22');
    expect(storage.getitemfromLocalStorage('ynw-credentials')).toBeNull();
    expect(groups.getitemFromGroupStorage('jld_scon')).toBeUndefined();
    expect(storage.getitemfromLocalStorage('c_authorizationToken')).toBeNull();
    expect(platform.get()).toBe('P1');
  }));

  it('clears failed recovery even when the target is already active', fakeAsync(() => {
    seedSession('22');
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'spconsumer').flush(null, { status: 419, statusText: 'Expired' });
    flushMicrotasks();
    http.expectOne(api + 'consumer/login/switch').flush(null, { status: 422, statusText: 'Rejected' });
    flushMicrotasks();
    expect(storage.getitemfromLocalStorage('ynw-credentials')).toBeNull();
    expect(storage.getitemfromLocalStorage('c_authorizationToken')).toBeNull();
    expect(groups.getitemFromGroupStorage('jld_scon')).toBeUndefined();
  }));

  it('preserves platform identity on a target-specific 401', fakeAsync(() => {
    seedSession('11');
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'consumer/login/switch').flush('NOT_REGISTERED_CUSTOMER', { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();
    expect(platform.get()).toBe('P1');
  }));

  it('does not install a browser switch when profile cookie validation fails', fakeAsync(() => {
    seedSession('11');
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'consumer/login/switch').flush({
      token: browserToken, status: 'signed_in', providerConsumer: 219232
    });
    flushMicrotasks();
    http.expectOne(api + 'spconsumer').flush(null, { status: 422, statusText: 'Rejected' });
    flushMicrotasks();
    expect(storage.getitemfromLocalStorage('ynw-credentials')).toBeNull();
    expect(groups.getitemFromGroupStorage('jld_scon')).toBeUndefined();
    expect(platform.get()).toBe('P1');
  }));

  it('validates a normal cookie session without a platform token', fakeAsync(() => {
    platform.clear();
    seedSession('22', null);
    service.prepareForTargetAccount('22', 'provider');
    const request = http.expectOne(api + 'spconsumer');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ id: 101, firstName: 'Current' });
    flushMicrotasks();
    http.expectNone(api + 'consumer/login/switch');
    expect(groups.getitemFromGroupStorage('jld_scon').firstName).toBe('Current');
  }));

  it('validates legacy login ownership before recording the first active account', fakeAsync(() => {
    seedSession('22', null);
    platform.clear();
    localStorage.removeItem('capp:activeAccountId:v1');
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'spconsumer').flush({ id: 101, firstName: 'Current' });
    flushMicrotasks();
    expect(state.getActiveAccount()).toBe('22');
  }));

  it('repairs credentials-only phantom login while retaining the anonymous cart', fakeAsync(() => {
    platform.clear();
    state.setActiveAccount('22');
    storage.setitemonLocalStorage('ynw-credentials', JSON.stringify({ accountId: '22' }));
    storage.setitemonLocalStorage('cartData', { owner: '22' });
    service.prepareForTargetAccount('22', 'provider');
    flushMicrotasks();
    expect(storage.getitemfromLocalStorage('ynw-credentials')).toBeNull();
    expect(storage.getitemfromLocalStorage('cartData')).toEqual({ owner: '22' });
  }));

  it('deduplicates preparations for one target', fakeAsync(() => {
    const first = service.prepareForTargetAccount('22', 'provider');
    expect(service.prepareForTargetAccount('22', 'provider')).toBe(first);
    flushSwitch();
  }));

  it('refreshes an expired platform token and retries once', fakeAsync(() => {
    service.prepareForTargetAccount('22', 'provider');
    http.expectOne(api + 'consumer/login/switch').flush(null, { status: 498, statusText: 'Expired' });
    flushMicrotasks();
    const refresh = http.expectOne(api + 'consumer/oauth/platformtoken/refresh');
    expect(refresh.request.headers.get('AuthToken')).toBe('platformToken-P1');
    expect(refresh.request.headers.has('Authorization')).toBeFalse();
    refresh.flush({ platform_token: 'P2' });
    flushMicrotasks();
    flushSwitch();
    expect(platform.get()).toBe('P2');
  }));

  it('shares platform refresh and accepts its camel-case response', fakeAsync(() => {
    expect(service.refreshPlatformToken()).toBe(service.refreshPlatformToken());
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush({ platformToken: 'P2' });
    flushMicrotasks();
    expect(platform.get()).toBe('P2');
  }));

  it('recognizes expired-token errors from a different federation class copy', fakeAsync(() => {
    const switchRequest = spyOn<any>(service, 'requestSwitch').and.returnValues(
      Promise.reject({ status: 498 }),
      Promise.resolve({ token: 'TARGET', status: 'signed_in' })
    );
    let result: any;
    service.switchAccount('22').then(value => result = value);
    flushMicrotasks();
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush({ platform_token: 'P2' });
    flushMicrotasks();
    expect(switchRequest).toHaveBeenCalledTimes(2);
    expect(result.token).toBe('TARGET');
  }));

  it('clears a definitively rejected platform credential', fakeAsync(() => {
    service.refreshPlatformToken().catch(() => undefined);
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();
    expect(platform.get()).toBeNull();
  }));

  it('does not clear a new login when an older platform refresh is rejected', fakeAsync(() => {
    service.refreshPlatformToken().catch(() => undefined);
    platform.save('NEW_LOGIN');
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush(null, { status: 401, statusText: 'Unauthorized' });
    flushMicrotasks();
    expect(platform.get()).toBe('NEW_LOGIN');
  }));

  it('keeps platform refresh retryable after an outage', fakeAsync(() => {
    service.refreshPlatformToken().catch(() => undefined);
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush(null, { status: 503, statusText: 'Unavailable' });
    flushMicrotasks();
    expect(platform.get()).toBe('P1');
    service.refreshPlatformToken();
    http.expectOne(api + 'consumer/oauth/platformtoken/refresh').flush({ platform_token: 'P2' });
    flushMicrotasks();
    expect(platform.get()).toBe('P2');
  }));
});
