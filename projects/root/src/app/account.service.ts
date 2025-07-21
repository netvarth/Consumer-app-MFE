import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { ServiceMeta, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  APIEndPoint = projectConstants.APIENDPOINT;
  S3EndPoint = projectConstants.S3ENDPOINT;
  SAPath = projectConstants.SAPATH;
  i8nPath = projectConstants.I8NPATH;
  UIPath =projectConstants.ROOTUIPATH;
  accountInfo: any;

  constructor(
    private sharedService: SharedService,
    private serviceMeta: ServiceMeta,
    private router: Router
  ) {

    console.log("Account Service Constructor");
    this.sharedService.setAPIEndPoint(this.APIEndPoint);
    this.sharedService.setConfigPath(this.S3EndPoint);
    this.sharedService.setSAPath(this.SAPath);
    this.sharedService.setI8nPath(this.i8nPath);
    this.sharedService.setUIPath(this.UIPath);
  }

  getUniqueID(idParam: any) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (idParam) {
        if (_this.sharedService.getUniqueID()) {
          _this.sharedService.setRouteID('customapp/' + idParam);
          resolve(_this.sharedService.getUniqueID());
        } else {
          _this.getBusinessUniqueId(idParam).subscribe((uniqueId: any) => {
            _this.sharedService.setRouteID('customapp/' + idParam);
            _this.sharedService.setUniqueID(uniqueId);
            resolve(uniqueId);
          }, ()=>{
            _this.router.navigate(['not-found']);
          });
        }
      }   
    });
  }
  /**
  * 
  * @param customId 
  * @returns return the uniqueid which represents S3
  */
  getBusinessUniqueId(customId: any) {
    const url = 'provider/business/' + customId;
    return this.serviceMeta.httpGet(url);
  }

  getSystemDate() {
    return this.serviceMeta.httpGet('provider/server/date');
  }

}
