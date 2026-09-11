import { Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { tap, timeout } from 'rxjs/operators';
import { AuthService, GroupStorageService, LocalStorageService, ServiceMeta, SessionStorageService } from 'jconsumer-shared';
import { CrossTenantLogoutService, PlatformTokenStore } from '@consumer/cross-tenant';

/** Compatibility adapter until the shared library supports provider-scoped logout. */
@Injectable()
export class ConsumerAuthService extends AuthService {
  constructor(
    serviceMeta: ServiceMeta,
    private readonly storage: LocalStorageService,
    sessionStorage: SessionStorageService,
    private readonly groups: GroupStorageService,
    private readonly tenantLogout: CrossTenantLogoutService,
    private readonly platformTokens: PlatformTokenStore
  ) {
    super(serviceMeta, storage, sessionStorage, groups);
  }

  override setLoginData(data: any, credentials: any): void {
    this.savePlatformToken(data);
    super.setLoginData(data, credentials);
  }

  override verifyConsumerOTP(purpose: any, otp: any) {
    return super.verifyConsumerOTP(purpose, otp).pipe(tap(response => this.savePlatformToken(response)));
  }

  override refreshLogin() {
    return super.refreshLogin().pipe(tap(response => this.savePlatformToken(response)));
  }

  private savePlatformToken(response: unknown): void {
    if (!response || typeof response !== 'object') return;
    const data = response as Record<string, unknown>;
    const token = data['platform_token'] ?? data['platformToken'];
    // Provider/session tokens must never replace the platform identity.
    if (typeof token === 'string') this.platformTokens.save(token);
  }

  override isLoggedIn(): boolean {
    try {
      const credentials = this.storage.getitemfromLocalStorage('ynw-credentials');
      const user = this.groups.getitemFromGroupStorage('jld_scon');
      // Normal OTP login also supports HttpOnly cookie sessions, so an explicit
      // authorization token is optional. Credentials without a user are not a session.
      return !!credentials && !!(user?.providerConsumer ?? user?.id);
    } catch {
      return false;
    }
  }

  override goThroughLogin(): Promise<boolean> {
    return Promise.resolve(this.isLoggedIn());
  }

  override async doLogout(): Promise<void> {
    try {
      await firstValueFrom(this.consumerLogout().pipe(timeout(10000)));
    } catch {
      // Local sign-out must finish even when the server is unavailable.
    } finally {
      // AuthService.doLogout() calls clearLocalstorage(), which erases the
      // platform identity and every other provider's saved cart.
      this.tenantLogout.clearProviderState();
      this.sendMessage({ ttype: 'refresh', action: false });
    }
  }
}
