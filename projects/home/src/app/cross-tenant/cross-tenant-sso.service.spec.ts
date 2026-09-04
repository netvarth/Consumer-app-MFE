import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AccountService, ConsumerService, SharedService } from 'jconsumer-shared';
import { CrossTenantJourneyService, PlatformTokenStore } from '@consumer/cross-tenant';
import { AccountStateCoordinator } from './account-state-coordinator.service';
import { CrossTenantSsoService } from './cross-tenant-sso.service';

describe('CrossTenantSsoService', () => {
  let service: CrossTenantSsoService;
  let http: HttpTestingController;
  let currentToken: string | null;
  let journey: jasmine.SpyObj<CrossTenantJourneyService>;
  let accountState: jasmine.SpyObj<AccountStateCoordinator>;
  let sharedAccountService: jasmine.SpyObj<AccountService>;
  let consumerService: jasmine.SpyObj<ConsumerService>;
  const platformTokens = jasmine.createSpyObj<PlatformTokenStore>('PlatformTokenStore', ['get', 'save', 'update', 'clear']);

  beforeEach(() => {
    currentToken = 'P1';
    localStorage.clear();
    sessionStorage.clear();
    platformTokens.get.and.callFake(() => currentToken);
    platformTokens.update.and.callFake((token: string) => currentToken = token);
    journey = jasmine.createSpyObj<CrossTenantJourneyService>('journey', ['get', 'clear']);
    accountState = jasmine.createSpyObj<AccountStateCoordinator>(
      'accountState',
      ['transitionTo', 'setActiveAccount', 'getActiveAccount', 'clearActiveAuthentication']
    );
    accountState.getActiveAccount.and.returnValue(null);
    sharedAccountService = jasmine.createSpyObj<AccountService>(
      'sharedAccountService',
      ['setActiveStore', 'setStores', 'setActiveLocation', 'setAccountLocations']
    );
    consumerService = jasmine.createSpyObj<ConsumerService>('consumerService', ['setOrderDetails']);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CrossTenantSsoService,
        { provide: SharedService, useValue: { getAPIEndPoint: () => 'https://api.example/v1/rest/' } },
        { provide: PlatformTokenStore, useValue: platformTokens },
        { provide: CrossTenantJourneyService, useValue: journey },
        { provide: AccountStateCoordinator, useValue: accountState },
        { provide: AccountService, useValue: sharedAccountService },
        { provide: ConsumerService, useValue: consumerService }
      ]
    });
    service = TestBed.inject(CrossTenantSsoService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends AuthToken only and preserves the accountId-only switch body', async () => {
    const result = service.switchAccount(22);
    const request = http.expectOne('https://api.example/v1/rest/consumer/login/switch');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ accountId: 22 });
    expect(request.request.headers.get('AuthToken')).toBe('platformToken-P1');
    expect(request.request.headers.has('Authorization')).toBeFalse();
    request.flush({ token: 'T22', status: 'signed_in' });
    expect((await result).token).toBe('T22');
  });

  it('refreshes a 498 platform token and retries switch exactly once', async () => {
    const result = service.switchAccount('22');
    http.expectOne('https://api.example/v1/rest/consumer/login/switch').flush(null, { status: 498, statusText: 'Expired' });
    const refresh = http.expectOne('https://api.example/v1/rest/consumer/oauth/platformtoken/refresh');
    expect(refresh.request.headers.get('AuthToken')).toBe('platformToken-P1');
    expect(refresh.request.headers.has('Authorization')).toBeFalse();
    refresh.flush({ platform_token: 'P2' });
    const retry = http.expectOne('https://api.example/v1/rest/consumer/login/switch');
    expect(retry.request.headers.get('AuthToken')).toBe('platformToken-P2');
    retry.flush({ token: 'T22', status: 'provisioned' });
    expect((await result).status).toBe('provisioned');
    expect(platformTokens.update).toHaveBeenCalledWith('P2');
  });

  it('switches and installs the target session when returning to the Chotaboss hub', async () => {
    journey.get.and.returnValue({
      enabled: true,
      hubCustomId: 'chotaboss',
      returnTo: '/capp/chotaboss',
      startedAt: Date.now(),
      lastProviderUrl: 'https://provider.example/capp/provider'
    });

    const result = service.prepareForTargetAccount('11', 'chotaboss');
    const request = http.expectOne('https://api.example/v1/rest/consumer/login/switch');
    expect(request.request.body).toEqual({ accountId: '11' });
    request.flush({
      token: 'CHOTABOSS_SESSION',
      refreshToken: 'CHOTABOSS_REFRESH',
      status: 'signed_in',
      id: 101,
      phoneNumber: '9999999999'
    });
    await result;

    expect(accountState.transitionTo).toHaveBeenCalledWith('11');
    expect(sharedAccountService.setActiveStore).toHaveBeenCalledWith(null);
    expect(sharedAccountService.setStores).toHaveBeenCalledWith([]);
    expect(sharedAccountService.setActiveLocation).toHaveBeenCalledWith(null);
    expect(sharedAccountService.setAccountLocations).toHaveBeenCalledWith([]);
    expect(consumerService.setOrderDetails).toHaveBeenCalledWith(null);
    expect(accountState.clearActiveAuthentication).not.toHaveBeenCalled();
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('11');
    expect(journey.clear).toHaveBeenCalled();
    expect(JSON.parse(localStorage.getItem('c_authorizationToken')!)).toBe('CHOTABOSS_SESSION');
    expect(JSON.parse(localStorage.getItem('refreshToken')!)).toBe('CHOTABOSS_REFRESH');
    expect(JSON.parse(JSON.parse(localStorage.getItem('ynw-credentials')!))).toEqual(jasmine.objectContaining({
      accountId: '11',
      phoneNumber: '9999999999'
    }));
    expect(JSON.parse(JSON.parse(localStorage.getItem('0')!)).jld_scon.token).toBe('CHOTABOSS_SESSION');
  });

  it('switches when the account changes even if the marketplace journey marker is missing', async () => {
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue('11');

    const result = service.prepareForTargetAccount('22', 'order-account');
    const request = http.expectOne('https://api.example/v1/rest/consumer/login/switch');
    expect(request.request.body).toEqual({ accountId: '22' });
    request.flush({ token: 'ORDER_SESSION', status: 'signed_in' });
    await result;

    expect(accountState.transitionTo).toHaveBeenCalledWith('22');
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('22');
  });

  it('retries an anonymous target when a platform identity is still available', async () => {
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue('22');

    const result = service.prepareForTargetAccount('22', 'order-account');
    http.expectOne('https://api.example/v1/rest/consumer/login/switch')
      .flush({ token: 'ORDER_SESSION', status: 'signed_in' });
    await result;

    expect(accountState.transitionTo).toHaveBeenCalledWith('22');
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('22');
  });

  it('does not repeat a switch for an already active account session', async () => {
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue('22');
    localStorage.setItem('c_authorizationToken', JSON.stringify('ORDER_SESSION'));

    await service.prepareForTargetAccount('22', 'order-account');

    http.expectNone('https://api.example/v1/rest/consumer/login/switch');
  });

  it('records the anonymous boot account without attempting a switch', async () => {
    currentToken = null;
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue(null);

    await service.prepareForTargetAccount('11', 'chotaboss');

    http.expectNone('https://api.example/v1/rest/consumer/login/switch');
    expect(accountState.transitionTo).not.toHaveBeenCalled();
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('11');
  });

  it('isolates account state when an anonymous user moves to another account', async () => {
    currentToken = null;
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue('11');

    await service.prepareForTargetAccount('22', 'order-account');

    http.expectNone('https://api.example/v1/rest/consumer/login/switch');
    expect(accountState.transitionTo).toHaveBeenCalledWith('22');
    expect(sharedAccountService.setActiveStore).toHaveBeenCalledWith(null);
    expect(sharedAccountService.setStores).toHaveBeenCalledWith([]);
    expect(sharedAccountService.setActiveLocation).toHaveBeenCalledWith(null);
    expect(sharedAccountService.setAccountLocations).toHaveBeenCalledWith([]);
    expect(consumerService.setOrderDetails).toHaveBeenCalledWith(null);
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('22');
  });

  it('falls back to an isolated anonymous target when its switch fails', async () => {
    journey.get.and.returnValue(null);
    accountState.getActiveAccount.and.returnValue('11');

    const result = service.prepareForTargetAccount('22', 'order-account');
    http.expectOne('https://api.example/v1/rest/consumer/login/switch')
      .flush('Invalid switch', { status: 422, statusText: 'Unprocessable Entity' });
    await result;

    expect(accountState.setActiveAccount).toHaveBeenCalledWith('22');
    expect(accountState.transitionTo).toHaveBeenCalledWith('22');
    expect(sharedAccountService.setActiveStore).toHaveBeenCalledWith(null);
    expect(consumerService.setOrderDetails).toHaveBeenCalledWith(null);
    expect(accountState.clearActiveAuthentication).not.toHaveBeenCalled();
    expect(journey.clear).toHaveBeenCalled();
  });

  it('installs a switched session over the shared library double-encoded storage format', async () => {
    journey.get.and.returnValue({
      enabled: true,
      hubCustomId: 'chotaboss',
      returnTo: '/capp/chotaboss',
      startedAt: Date.now(),
      lastProviderUrl: 'https://provider.example/capp/provider'
    });
    localStorage.setItem('ynw-credentials', JSON.stringify(JSON.stringify({
      accountId: '10',
      loginId: '9999999999'
    })));
    localStorage.setItem('0', JSON.stringify(JSON.stringify({
      jld_scon: { token: 'OLD_SESSION', providerConsumer: 10 }
    })));

    const result = service.prepareForTargetAccount('22', 'order-account');
    http.expectOne('https://api.example/v1/rest/consumer/login/switch').flush({
      token: 'ORDER_SESSION',
      refreshToken: 'ORDER_REFRESH',
      status: 'signed_in',
      providerConsumer: 22
    });
    await result;

    expect(JSON.parse(localStorage.getItem('c_authorizationToken')!)).toBe('ORDER_SESSION');
    expect(JSON.parse(JSON.parse(localStorage.getItem('ynw-credentials')!))).toEqual(jasmine.objectContaining({
      accountId: '22',
      loginId: '9999999999'
    }));
    expect(JSON.parse(JSON.parse(localStorage.getItem('0')!)).jld_scon).toEqual(jasmine.objectContaining({
      token: 'ORDER_SESSION',
      providerConsumer: 22
    }));
    expect(accountState.clearActiveAuthentication).not.toHaveBeenCalled();
  });

});
