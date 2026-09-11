import { Injectable } from '@angular/core';
import { CanLoad, Route } from '@angular/router';
import { AccountService, SharedService } from 'jconsumer-shared';
import { CrossTenantSsoService } from './cross-tenant-sso.service';
import { DeviceIdentityService } from '../../../../cross-tenant/helpers/device-identity.service';

@Injectable({ providedIn: 'root' })
export class CrossTenantGuard implements CanLoad {
  constructor(
    private readonly sharedService: SharedService,
    private readonly accountService: AccountService,
    private readonly sso: CrossTenantSsoService,
    private readonly deviceIdentity: DeviceIdentityService
  ) {}

  async canLoad(_route: Route): Promise<boolean> {
    this.deviceIdentity.bootstrapFromCurrentUrl();
    try {
      const accountInfo = await this.accountService.getAccountInfoById();
      if (!accountInfo) return false;
    } catch {
      return false;
    }

    try {
      await this.sso.prepareForTargetAccount(
        this.sharedService.getAccountID(),
        this.sharedService.getCustomID()
      );
    } catch {
      // Failed target validation leaves source state intact. Never load the target
      // with that identity. Anonymous entry still resolves successfully above.
      return false;
    }
    return true;
  }
}
