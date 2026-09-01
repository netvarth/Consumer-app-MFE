import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { SharedService } from 'jconsumer-shared';
import { CrossTenantJourneyService, PlatformTokenStore } from '@consumer/cross-tenant';
import { AccountStateCoordinator } from './account-state-coordinator.service';
import { CrossTenantSsoService } from './cross-tenant-sso.service';

describe('CrossTenantSsoService', () => {
  let service: CrossTenantSsoService;
  let http: HttpTestingController;
  let currentToken: string | null;
  const platformTokens = jasmine.createSpyObj<PlatformTokenStore>('PlatformTokenStore', ['get', 'save', 'update', 'clear']);

  beforeEach(() => {
    currentToken = 'P1';
    platformTokens.get.and.callFake(() => currentToken);
    platformTokens.update.and.callFake((token: string) => currentToken = token);
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        CrossTenantSsoService,
        { provide: SharedService, useValue: { getAPIEndPoint: () => 'https://api.example/v1/rest/' } },
        { provide: PlatformTokenStore, useValue: platformTokens },
        { provide: CrossTenantJourneyService, useValue: jasmine.createSpyObj('journey', ['get', 'clear']) },
        { provide: AccountStateCoordinator, useValue: jasmine.createSpyObj('accountState', ['transitionTo', 'setActiveAccount', 'clearActiveAuthentication']) }
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
});
