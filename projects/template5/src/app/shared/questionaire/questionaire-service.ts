import { Injectable } from "@angular/core";
import { ServiceMeta } from "jconsumer-shared";
import { Observable, Subject } from "rxjs";

@Injectable({
    providedIn: 'root'
})

/**
 * Class which handle Questionaire
 */
export class QuestionaireService {

    private subject = new Subject<any>();

    getMessage(): Observable<any> {
        return this.subject.asObservable();
    }

    sendMessage(message: any) {
        this.subject.next(message);
    }

    constructor(private servicemeta: ServiceMeta) {

    }
    validateConsumerQuestionnaire(body, accountId) {
        const url = 'consumer/questionnaire/validate' + '?account=' + accountId;
        return this.servicemeta.httpPut(url, body);
    }

    validateConsumerQuestionnaireResbumit(body, accountId) {
        const url = 'consumer/questionnaire/resubmit/validate' + '?account=' + accountId;
        return this.servicemeta.httpPut(url, body);
    }
    validateProviderQuestionnaireResbmit(body) {
        const url = 'provider/questionnaire/resubmit/validate';
        return this.servicemeta.httpPut(url, body);
    }
    providerApptQnrUploadStatusUpdate(uid, data) {
        const url = 'provider/appointment/questionnaire/upload/status/' + uid;
        return this.servicemeta.httpPut(url, data);
    }
    providerLeadQnrUploadStatusUpdate(uid, data) {
        const url = 'provider/lead/questionnaire/upload/status/' + uid;
        return this.servicemeta.httpPut(url, data);
    }
    providerLeadQnrafterUploadStatusUpdate(uid, data) {
        const url = 'provider/lead/questionnaire/upload/status/' + uid;
        return this.servicemeta.httpPut(url, data);
    }
    consumerOrderQnrUploadStatusUpdate(uid, account, data) {
        const url = 'consumer/orders/questionnaire/upload/status/' + uid + '?account=' + account;
        return this.servicemeta.httpPut(url, data);
    }
    consumerDonationQnrUploadStatusUpdate(uid, account, data) {
        const url = 'consumer/donation/questionnaire/upload/status/' + uid + '?account=' + account;
        return this.servicemeta.httpPut(url, data);
    }
    providerWaitlistQnrUploadStatusUpdate(uid, data) {
        const url = 'provider/waitlist/questionnaire/upload/status/' + uid;
        return this.servicemeta.httpPut(url, data);
    }
    providerOrderQnrUploadStatusUpdate(uid, data) {
        const url = 'provider/orders/questionnaire/upload/status/' + uid;
        return this.servicemeta.httpPut(url, data);
    }
    consumerApptQnrUploadStatusUpdate(uid, account, data) {
        const url = 'consumer/appointment/questionnaire/upload/status/' + uid + '?account=' + account;
        return this.servicemeta.httpPut(url, data);
    }
    consumerWaitlistQnrUploadStatusUpdate(uid, account, data) {
        const url = 'consumer/waitlist/questionnaire/upload/status/' + uid + '?account=' + account;
        return this.servicemeta.httpPut(url, data);
    }
    videoaudioS3Upload(file, url) {
        return this.servicemeta.httpPut(url, file);
    }
    resubmitProviderCustomerQuestionnaire(id, body) {
        const url = 'provider/customers/questionnaire/resubmit/' + id;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitConsumerWaitlistQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/waitlist/questionnaire/resubmit/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    submitConsumerWaitlistQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/waitlist/questionnaire/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitConsumerDonationQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/donation/questionnaire/resubmit/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitConsumerApptQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/appointment/questionnaire/resubmit/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    submitConsumerApptQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/appointment/questionnaire/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitConsumerOrderQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/orders/questionnaire/resubmit/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    submitConsumerOrderQuestionnaire(body, uuid, accountId) {
        const url = 'consumer/orders/questionnaire/' + uuid + '?account=' + accountId;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitProviderWaitlistQuestionnaire(body, uuid) {
        const url = 'provider/waitlist/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    submitProviderWaitlistQuestionnaire(body, uuid) {
        const url = 'provider/waitlist/questionnaire/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitProviderLeadQuestionnaire(body, uuid) {
        const url = 'provider/lead/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    submitProviderLeadQuestionnaire(body, uuid) {
        const url = 'provider/lead/questionnaire/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    validateConsumerIvrQuestionnaire(body,id) {
        const url = 'consumer/ivr/questionnaire/submit/' + id;
        return this.servicemeta.httpPost(url, body);
      }
    resubmitProviderLeadafterQuestionnaire(body, uuid) {
        const url = 'provider/lead/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    submitProviderLeadafterQuestionnaire(body, uuid) {
        const url = 'provider/lead/questionnaire/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitProviderApptQuestionnaire(body, uuid) {
        const url = 'provider/appointment/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    submitProviderApptQuestionnaire(body, uuid) {
        const url = 'provider/appointment/questionnaire/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitProviderOrderQuestionnaire(body, uuid) {
        const url = 'provider/orders/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    submitDonationQuestionnaire(uuid, body, account_id) {
        const url = 'consumer/donation/questionnaire/submit/' + uuid + '?account=' + account_id;
        return this.servicemeta.httpPost(url, body);
    }
    submitProviderOrderQuestionnaire(body, uuid) {
        const url = 'provider/orders/questionnaire/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    resubmitProviderDonationQuestionnaire(uuid, body) {
        const url = 'provider/donation/questionnaire/resubmit/' + uuid;
        return this.servicemeta.httpPost(url, body);
    }
    getProviderQuestionnaire(serviceId, consumerId, channel) {
        const url = 'provider/questionnaire/service/' + serviceId + '/' + channel + '/consumer/' + consumerId;
        return this.servicemeta.httpGet(url);
    }
}