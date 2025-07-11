import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanLoad, Route, RouterStateSnapshot } from "@angular/router";
import { Observable } from "rxjs";
import { TemplateResolver } from "./template.resolver";
import { DateTimeProcessor, LocalStorageService, SharedService } from "jconsumer-shared";

@Injectable({
  providedIn: 'root',
})
export class TemplateGuard implements CanLoad {
  constructor(
    private templateResolver: TemplateResolver,
    private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor,
    private sharedService: SharedService) {}
  
  // The canLoad method checks if the module can be loaded
  canLoad(route: Route): Observable<boolean> | Promise<boolean> | boolean {
    // We need to pass both ActivatedRouteSnapshot and RouterStateSnapshot to resolve
    const activatedRouteSnapshot = route as ActivatedRouteSnapshot;
    const routerStateSnapshot: RouterStateSnapshot = null;  // You'll need to pass the actual state if necessary
    
    if (this.sharedService.isTemplateLoaded()) {
      console.log("Returning cached Template info:", this.sharedService.getTemplateCache());
      return true; // Allow navigation since data is already available
    }
    this.dateTimeProcessor.getSystemDate().subscribe((sysDate) => {
      this.lStorageService.setitemonLocalStorage('sysdate', sysDate);
    })
    // Resolving data using the AccountResolver
    return this.templateResolver.resolve(activatedRouteSnapshot, routerStateSnapshot).then(templateInfo => {
      // Now accountInfo will be available to check if the route should be loaded
      if (templateInfo) {
        this.sharedService.setTemplateCache(templateInfo);
        console.log("Template Info Found:", templateInfo);
        return true;  // Allow loading the route if account info is valid
      } else {
        console.log("Template Info Not Found");
        this.sharedService.setTemplateCache(null);
        return true; // Prevent navigation if no account info is available
      }
    }).catch(error => {
      console.error('Error resolving Template information:', error);
      return false; // Prevent navigation in case of an error
    });
  }
}