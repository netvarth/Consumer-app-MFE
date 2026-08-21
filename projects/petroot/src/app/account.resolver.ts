import { Injectable } from '@angular/core';
import { AccountService } from './account.service';

@Injectable({
  providedIn: 'root'
})

/**
 * Account Resolver Resolves the Account ID. No Rest Calls in Between if not QR Code
 */

export class AccountResolver {
  constructor(private accountService: AccountService) { 
    console.log("Root Account Resolver Constructor");
  }

  fetchUniqueID(id: string): Promise<any> {
    console.log("Fetch Unique Id:", id);
    return this.accountService.getUniqueID(id);
  }

}