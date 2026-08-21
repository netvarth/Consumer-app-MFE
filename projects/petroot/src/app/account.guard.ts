import { Injectable } from "@angular/core";
import { CanLoad, Route, Router, UrlSegment } from "@angular/router";
import { AccountResolver } from "./account.resolver";
import { Observable } from "rxjs";
import { SharedService } from "jconsumer-shared";

@Injectable({
  providedIn: 'root',
})
export class AccountGuard implements CanLoad {

  constructor(private accountResolver: AccountResolver, private sharedService: SharedService, private router: Router) {
    console.log("Account Guard Constructor");

  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    if (this.sharedService.getAccountCache()) {
      console.log('Returning cached account info:', this.sharedService.getAccountCache());
      return true;
    }
    // With base href /capp/ and route ':id', the first (and only) segment is the id
    const id = segments.length > 0 ? segments[0].path : null;
    if (!id) {
      this.router.navigate(['not-found']);
      return false;
    }
    return this.accountResolver.fetchUniqueID(id)
      .then((accountInfo: any) => {
        this.sharedService.setAccountCache(accountInfo);
        return true;
      })
      .catch(err => {
        console.error('Error resolving account', err);
        this.router.navigate(['not-found']);
        return false;
      });
  }
}
