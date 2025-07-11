import { Injectable } from '@angular/core';
import { ServiceMeta, SharedService } from 'jconsumer-shared';
import { projectConstants } from '../environment';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  APIEndPoint = projectConstants.APIENDPOINT;
  S3EndPoint = projectConstants.S3ENDPOINT;
  UniqueID = projectConstants.UNIQUEID;
  SAPath = projectConstants.SAPATH;
  i8nPath = projectConstants.I8NPATH;
  UIPath = projectConstants.ROOTUIPATH;
  accountInfo: any;

  constructor(
    private sharedService: SharedService,
    private serviceMeta: ServiceMeta
  ) {

    console.log("Account Service Constructor");

    this.sharedService.setAPIEndPoint(this.APIEndPoint);
    this.sharedService.setConfigPath(this.S3EndPoint);
    this.sharedService.setSAPath(this.SAPath);
    this.sharedService.setUniqueID(this.UniqueID);
    this.sharedService.setI8nPath(this.i8nPath);
    this.sharedService.setUIPath(this.UIPath);
  }

  getUniqueID(idParam: any) {
    const _this = this;
    console.log(idParam);
    return new Promise(function (resolve, reject) {
      _this.sharedService.setUniqueID(_this.UniqueID);
      resolve(_this.UniqueID);
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
