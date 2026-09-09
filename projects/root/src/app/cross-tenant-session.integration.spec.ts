import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { fakeAsync, flushMicrotasks, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { AccountService as SharedAccountService, AuthService, ConsumerService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService } from 'jconsumer-shared';
import { PlatformTokenStore } from '@consumer/cross-tenant';
import { CrossTenantSsoService } from '../../../home/src/app/cross-tenant/cross-tenant-sso.service';
import { AccountStateCoordinator } from '../../../home/src/app/cross-tenant/account-state-coordinator.service';
import { AccountService } from './account.service';
import { appConfig } from './app.config';
import { ConsumerAuthService } from './consumer-auth.service';
import { HeaderComponent as Template6Header } from '../../../template6/src/app/home/header/header.component';
import { HeaderComponent as Template7Header } from '../../../template7/src/app/home/header/header.component';

describe('Shell login -> switch -> cart -> logout integration', () => {
  const api = 'https://api.example/v1/rest/';
  const browserToken = btoa(JSON.stringify({
    acc: '22', app: 'browser', isl: 'TEST_BROWSER_SESSION', dev: 'browser', typ: 'authn'
  }));

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
    switching.flush({
      id: 200, providerConsumer: 201, firstName: 'Target', lastName: 'Customer',
      userName: 'Target Customer', token: browserToken, status: 'signed_in'
    });
    flushMicrotasks();
    const profile = http.expectOne(api + 'spconsumer');
    expect(profile.request.headers.has('Authorization')).toBeFalse();
    expect(profile.request.withCredentials).toBeTrue();
    profile.flush({ id: 201, firstName: 'Target', lastName: 'Customer' });
    flushMicrotasks();

    // Reopening the target validates the persisted cookie session without
    // attempting a second switch or sending its descriptor as Authorization.
    TestBed.inject(CrossTenantSsoService).prepareForTargetAccount('22', 'provider');
    const restoredProfile = http.expectOne(api + 'spconsumer');
    expect(restoredProfile.request.headers.has('Authorization')).toBeFalse();
    expect(restoredProfile.request.withCredentials).toBeTrue();
    restoredProfile.flush({ id: 201, firstName: 'Target', lastName: 'Customer' });
    flushMicrotasks();
    http.expectNone(api + 'consumer/login/switch');

    auth.goThroughLogin().then(loggedIn => expect(loggedIn).toBeTrue());
    flushMicrotasks();
    const user = groups.getitemFromGroupStorage('jld_scon');
    const shared = TestBed.inject(SharedService);
    shared.setAccountInfo({ businessProfile: JSON.stringify({ id: 22, customId: 'provider' }) });
    shared.setRouteID('provider');
    const router = TestBed.inject(Router);
    const navigate = spyOn(router, 'navigate').and.resolveTo(true);
    const navigateByUrl = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    for (const Header of [Template6Header, Template7Header]) {
      const header = new Header(
        storage, TestBed.inject(SubscriptionService), groups, router, shared, auth,
        { use: () => of({}) } as any, TestBed.inject(OrderService), TestBed.inject(SharedAccountService),
        { getallWishlistItems: () => of([]), clear: () => undefined, getIds: () => [] } as any
      );
      const headerCart = http.expectOne(api + 'consumer/cart/procon/201');
      expect(headerCart.request.headers.has('Authorization')).toBeFalse();
      expect(headerCart.request.withCredentials).toBeTrue();
      headerCart.flush([]);
      expect(header.isLoggedIn).toBeTrue();
      expect(header.loggedUser.providerConsumer).toBe(201);
      header.redirectto('profile');
      expect(navigate).toHaveBeenCalledOnceWith(['provider', 'profile']);
      header.dashboardClicked();
      flushMicrotasks();
      expect(navigateByUrl).toHaveBeenCalledOnceWith('provider/bookings');
      expect(navigate).not.toHaveBeenCalledWith(['provider', 'login']);
      header.ngOnDestroy();
      navigate.calls.reset();
      navigateByUrl.calls.reset();
    }

    TestBed.inject(OrderService).createCart({
      providerConsumer: { id: user.providerConsumer },
      store: { encId: 'TARGET_STORE' },
      items: [{ catalogItem: { encId: 'TARGET_ITEM' }, quantity: 1 }]
    }).subscribe();
    const cart = http.expectOne(api + 'consumer/cart');
    expect(cart.request.body.providerConsumer.id).toBe(201);
    expect(cart.request.headers.has('Authorization')).toBeFalse();
    expect(cart.request.withCredentials).toBeTrue();
    expect(cart.request.headers.has('AuthToken')).toBeFalse();
    cart.flush({ uid: 'TARGET_CART' });

    auth.doLogout();
    const logout = http.expectOne(api + 'consumer/login');
    expect(logout.request.headers.has('Authorization')).toBeFalse();
    expect(logout.request.withCredentials).toBeTrue();
    logout.flush(true);
    flushMicrotasks();
    expect(auth.isLoggedIn()).toBeFalse();
    expect(TestBed.inject(PlatformTokenStore).get()).toBe('PLATFORM');
    expect(localStorage.getItem('capp:tenant-state:v1:11')).toContain('cartData');
    http.verify();
  }));
});
