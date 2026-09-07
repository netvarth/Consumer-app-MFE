import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { AccountService as SharedAccountService, AuthService, ConsumerService, GroupStorageService, LocalStorageService, OrderService, SharedService } from 'jconsumer-shared';
import { PlatformTokenStore } from '@consumer/cross-tenant';
import { CrossTenantSsoService } from '../../../home/src/app/cross-tenant/cross-tenant-sso.service';
import { AccountStateCoordinator } from '../../../home/src/app/cross-tenant/account-state-coordinator.service';
import { AccountService } from './account.service';
import { appConfig } from './app.config';
import { ConsumerAuthService } from './consumer-auth.service';

describe('Shell login -> switch -> cart -> logout integration', () => {
  const api = 'https://api.example/v1/rest/';

  afterEach(() => { localStorage.clear(); sessionStorage.clear(); });

  it('uses the configured auth adapter and the target customer/session throughout', fakeAsync(() => {
    localStorage.clear();
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [
      ...appConfig.providers,
      provideHttpClientTesting(),
      { provide: AccountService, useValue: {} },
      { provide: SharedAccountService, useValue: jasmine.createSpyObj('AccountService',
        ['setActiveStore', 'setStores', 'setActiveLocation', 'setAccountLocations']) },
      { provide: ConsumerService, useValue: jasmine.createSpyObj('ConsumerService', ['setOrderDetails']) }
    ] });
    TestBed.inject(SharedService).setAPIEndPoint(api);
    const http = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);
    const groups = TestBed.inject(GroupStorageService);
    const storage = TestBed.inject(LocalStorageService);
    const state = TestBed.inject(AccountStateCoordinator);
    expect(auth instanceof ConsumerAuthService).toBeTrue();

    state.setActiveAccount('11');
    auth.consumerLogin({ accountId: '11', loginId: 'test-customer' });
    http.expectOne(api + 'consumer/login').flush({ providerConsumer: 101, platform_token: 'PLATFORM' });
    flushMicrotasks();
    expect(auth.isLoggedIn()).toBeTrue();
    storage.setitemonLocalStorage('cartData', { owner: '11' });
    storage.setitemonLocalStorage('c_authorizationToken', 'SOURCE_SESSION');

    TestBed.inject(CrossTenantSsoService).prepareForTargetAccount('22', 'provider');
    const switching = http.expectOne(api + 'consumer/login/switch');
    expect(switching.request.headers.get('AuthToken')).toBe('platformToken-PLATFORM');
    expect(switching.request.headers.has('Authorization')).toBeFalse();
    switching.flush({ token: 'TARGET_SESSION', status: 'signed_in' });
    flushMicrotasks();
    const profile = http.expectOne(api + 'spconsumer');
    expect(profile.request.headers.get('Authorization')).toBe('TARGET_SESSION');
    profile.flush({ id: 201, firstName: 'Target', lastName: 'Customer' });
    flushMicrotasks();

    auth.goThroughLogin().then(loggedIn => expect(loggedIn).toBeTrue());
    flushMicrotasks();
    const user = groups.getitemFromGroupStorage('jld_scon');
    TestBed.inject(OrderService).createCart({
      providerConsumer: { id: user.providerConsumer },
      store: { encId: 'TARGET_STORE' },
      items: [{ catalogItem: { encId: 'TARGET_ITEM' }, quantity: 1 }]
    }).subscribe();
    const cart = http.expectOne(api + 'consumer/cart');
    expect(cart.request.body.providerConsumer.id).toBe(201);
    expect(cart.request.headers.get('Authorization')).toBe('TARGET_SESSION');
    expect(cart.request.headers.has('AuthToken')).toBeFalse();
    cart.flush({ uid: 'TARGET_CART' });

    auth.doLogout();
    http.expectOne(api + 'consumer/login').flush(true);
    flushMicrotasks();
    expect(auth.isLoggedIn()).toBeFalse();
    expect(TestBed.inject(PlatformTokenStore).get()).toBe('PLATFORM');
    expect(localStorage.getItem('capp:tenant-state:v1:11')).toContain('cartData');
    http.verify();
  }));
});
