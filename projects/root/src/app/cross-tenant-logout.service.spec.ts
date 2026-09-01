import { CrossTenantLogoutService, PlatformTokenStore } from '@consumer/cross-tenant';

describe('CrossTenantLogoutService', () => {
  it('clears person/account state while preserving global device values', () => {
    localStorage.clear();
    sessionStorage.clear();
    const platformTokens = jasmine.createSpyObj<PlatformTokenStore>('PlatformTokenStore', ['clear']);
    const service = new CrossTenantLogoutService(platformTokens);
    localStorage.setItem('capp:activeAccountId:v1', '22');
    localStorage.setItem('capp:tenant-state:v1:22', '{}');
    localStorage.setItem('capp:tenant-state-registry:v1', '{}');
    localStorage.setItem('c_authorizationToken', 'T22');
    localStorage.setItem('ynw-credentials', '{}');
    localStorage.setItem('chosenDateTime', '{}');
    localStorage.setItem('installId', 'device-install');
    sessionStorage.setItem('capp:crossTenantSsoSession:v1', '{}');

    service.clearPersonState();

    expect(platformTokens.clear).toHaveBeenCalled();
    expect(localStorage.getItem('capp:activeAccountId:v1')).toBeNull();
    expect(localStorage.getItem('capp:tenant-state:v1:22')).toBeNull();
    expect(localStorage.getItem('c_authorizationToken')).toBeNull();
    expect(localStorage.getItem('ynw-credentials')).toBeNull();
    expect(localStorage.getItem('chosenDateTime')).toBeNull();
    expect(sessionStorage.getItem('capp:crossTenantSsoSession:v1')).toBeNull();
    expect(localStorage.getItem('installId')).toBe('device-install');
  });
});
