import { ErrorHandler, Injector, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService, ServiceMeta } from 'jconsumer-shared';

@Injectable(
    {
        providedIn: 'root'
    }
)
export class GlobalErrorHandler implements ErrorHandler {
    userData: any;
    constructor(private servicemeta: ServiceMeta,
        private lStorageService: LocalStorageService,
        private injector: Injector) {

    }

    callHealth(message) {
        const url = 'health/browser';
        return this.servicemeta.httpPost(url, message);
    }

    handleError(error: any): void {
        const router = this.injector.get(Router);
        const userData = this.lStorageService.getitemfromLocalStorage('jld_scon');
        const deviceInfo = this.lStorageService.getitemfromLocalStorage('deviceInfo');
        const mailError = {};
        const userInfo: any = {};
        if (userData) {
            if (userData.userName) {
                userInfo['name'] = userData.userName;
            }
            if (userData.id) {
                userInfo.id = userData.id;
            }
            if (userData.primaryPhoneNumber) {
                userInfo.phonenumber = userData.primaryPhoneNumber;
            }
            if (userData.sector) {
                userInfo.sector = userData.sector;
            }
            if (userData.subSector) {
                userInfo.subsector = userData.subSector;
            }
            userInfo.type = 'provider-consumer';
        }
        mailError['userInfo'] = userInfo;
        mailError['url'] = router.url;
        mailError['source'] = "Jaldee-Provider-Consumer-Site";
        mailError['errorName'] = error.name;
        mailError['errorMessage'] = error.message;
        mailError['errorStack'] = error.stack;
        mailError['deviceInfo'] = deviceInfo;
        mailError['requestFrom'] = this.lStorageService.getitemfromLocalStorage('reqFrom') + '- GlobalErrorHandler';
        console.log(error.message);
        if (error.status !== 419 && error.status !== 403 && error.status !== 0 && error.status !== 422 && error.status !== 405
            && (error.message && error.message.indexOf('ExpressionChangedAfterItHasBeenCheckedError') == -1)) {
            this.callHealth(JSON.stringify(mailError)).subscribe();
        }
        const chunkFailedMessage = /Loading chunk [\d]+ failed/;
        if (chunkFailedMessage.test(error.message)) {
            // if(confirm("New version available. Load New Version?")) {
            window.location.reload();
            //   }
        }
    }
}
