import { Injectable } from '@angular/core';
import { CanLoad, Route } from '@angular/router';
import { AccountService, SharedService } from 'jconsumer-shared';
import { CrossTenantSsoService } from './cross-tenant-sso.service';

@Injectable({ providedIn: 'root' })
export class CrossTenantGuard implements CanLoad {
  constructor(
    private readonly sharedService: SharedService,
    private readonly accountService: AccountService,
    private readonly sso: CrossTenantSsoService
  ) {}

  async canLoad(_route: Route): Promise<boolean> {
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
      // Silent SSO must never prevent the provider's existing login flow from loading.
    }
    return true;
  }
}
