import { Injectable } from "@angular/core";
import { LocalStorageService, ServiceMeta } from "jconsumer-shared";
import { projectConstants } from "../environment";

@Injectable({
  providedIn: 'root'
})
export class VersionService {
  constructor(
    private servicemeta: ServiceMeta,
    private lStorageService: LocalStorageService) { }

  getVersion() {
    const url = projectConstants.S3ENDPOINT + 'JALDEE/c_version.json?dt=' + new Date();
    return this.servicemeta.httpGet(url);
  }

  getUIVersion() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.getVersion().subscribe((version: any) => {
        resolve(version.ui);
      }, () => {
        if (_this.lStorageService.getitemfromLocalStorage('c_sversion')) {
          resolve(_this.lStorageService.getitemfromLocalStorage('c_sversion'));
        }
      })
    })
  }
}