import { Injectable } from '@angular/core';
import { ServiceMeta } from 'jaldee-framework/service-meta';

@Injectable()

export class InboxServices {

    constructor(private servicemeta: ServiceMeta) { }

    getInbox(usertype) {
        return this.servicemeta.httpGet(usertype + '/communications');
    }

    readProviderMessages(providerId, messageIds, accountId) {
        const url = 'consumer/communications/readMessages/' + providerId + '/' + messageIds + '?account=' + accountId;
        return this.servicemeta.httpPut(url);
    }
}

