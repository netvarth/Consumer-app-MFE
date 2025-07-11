import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { TemplateService } from './template.service';
import { Injectable } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Injectable({
  providedIn: 'root'
})

export class TemplateResolver implements Resolve<any>{
  constructor(private templateService: TemplateService, private sharedService: SharedService) { 
    console.log("TemplateResolver Constructor");
  }
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.sharedService.isTemplateLoaded()) {
      return null;
    }
    return this.templateService.loadTemplateJSON();
  }
}