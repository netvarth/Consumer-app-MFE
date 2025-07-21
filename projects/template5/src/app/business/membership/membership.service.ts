import { Injectable } from '@angular/core';
import { ServiceMeta } from 'jaldee-framework/service-meta';

@Injectable({
  providedIn: 'root'
})
export class MembershipService {
  
  

  constructor(
    private servicemeta: ServiceMeta
  ) { }

  getMemberServices(accountId) {
    const url='consumer/membership/services?account=' + accountId;
    return this.servicemeta.httpGet(url);
  }

  getMemberServiceQuestionaire(serviceId, channel, accountId) {
    const url='consumer/questionnaire/memberservice/' + serviceId + '/' + channel + "?account="+ accountId;
    return this.servicemeta.httpGet(url);
  }
  
  register(body) {
    const url='consumer/membership';
    return this.servicemeta.httpPost(url, body);
  }

  submitQuestionnaire(body, uuid, accountId) {
    const url = 'consumer/membership/questionnaire/submit/' + uuid + '?account=' + accountId;
    return this.servicemeta.httpPost(url, body);
  }

  videoaudioS3Upload(file, url) {
    return this.servicemeta.httpPut(url, file);
  }
}
