import { Injectable } from '@angular/core';
import { ServiceMeta } from 'jconsumer-shared';

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(
    private servicemeta: ServiceMeta
  ) { }

  getAttributeItemsById(spCode,data) {
    const url = 'consumer/so/catalog/item/attributes/' + spCode;
    return this.servicemeta.httpPut(url, data);
  }
}
