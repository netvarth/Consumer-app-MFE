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
      ['transitionTo', 'setActiveAccount', 'clearActiveAuthentication']
    );
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
    expect(accountState.clearActiveAuthentication).toHaveBeenCalled();
    expect(accountState.setActiveAccount).toHaveBeenCalledWith('11');
    expect(JSON.parse(localStorage.getItem('c_authorizationToken')!)).toBe('CHOTABOSS_SESSION');
    expect(JSON.parse(localStorage.getItem('refreshToken')!)).toBe('CHOTABOSS_REFRESH');
    expect(JSON.parse(JSON.parse(localStorage.getItem('ynw-credentials')!))).toEqual(jasmine.objectContaining({
      accountId: '11',
      phoneNumber: '9999999999'
    }));
    expect(JSON.parse(JSON.parse(localStorage.getItem('0')!)).jld_scon.token).toBe('CHOTABOSS_SESSION');
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
    expect(accountState.clearActiveAuthentication).toHaveBeenCalledTimes(1);
  });
});
