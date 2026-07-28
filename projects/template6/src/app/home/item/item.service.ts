import { Injectable } from '@angular/core';
import { ServiceMeta } from 'jconsumer-shared';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(
    private servicemeta: ServiceMeta,
  ) { }

  getAttributeItemsById(spCode,data) {
    const url = 'consumer/so/catalog/item/attributes/' + spCode;
    return this.servicemeta.httpPut(url, data);
  }

  checkAvailabilityByPincode(itemId, filter = {}) {
    const url = 'consumer/sorder/item/' + itemId + '/estimatedDeliveryDays';
    return this.servicemeta.httpGet(url, null, filter);
  }

  getJsonsbyTypes(accountUniqueId: any) {
    const path = 'provider/account/settings/config/' + accountUniqueId + '/settings,shipmentSettings';
    return this.servicemeta.httpGet(path);
  }
   clearCart(cartId) {
    const url = 'consumer/cart/'+ cartId + '/removeitems';
    return this.servicemeta.httpDelete(url,null);
  }
}
