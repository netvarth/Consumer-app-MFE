import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-items-card',
  templateUrl: './items-card.component.html',
  styleUrls: ['./items-card.component.scss']
})
export class ItemsCardComponent implements OnInit {
  @Input() themes: any;
  @Input() items: any;
  @Output() actionPerformed = new EventEmitter<any>();
  responsiveOptions = {
    items: 5,
    loop: true,
    navSpeed: 10000,
    autoplay: true,
    dots: false,
    responsive: {
      0: {
        items: 2
      },
      768: {
        items: 3
      },
      1000: {
        items: 4
      },
      1200: {
        items: 5
      }
    }
  }
  theme: any;
  cdnPath: string = '';
  constructor(private sharedService: SharedService) {
    this.cdnPath = this.sharedService.getCDNPath();
   }

  ngOnInit(): void {
    this.theme = this.themes
  }

  viewItems(item: any) {
    let input = {action:'viewItem', value: item};
    this.actionPerformed.emit(input);
  }

  // addToCart(item: any, $event: any) {
  //   $event.preventDefault();
  //   $event.stopPropagation();
  //   let input = {action:'addToCart', value: item};
  //   this.actionPerformed.emit(input);
  // }
  
  getItemUnitItems(item: any): any[] {
    if (!item) {
      return [];
    }

    // 1. Direct unitItems on item or its wrappers (if non-empty)
    const directUnits = item?.unitItems
      || item?.catalogItem?.unitItems
      || item?.spItem?.unitItems
      || item?.spItemDto?.unitItems
      || item?.catalogItem?.spItemDto?.unitItems;
    if (Array.isArray(directUnits) && directUnits.length > 0) {
      return directUnits;
    }

    // 2. Unit items inside singleItems
    const singleItems = item?.singleItems
      || item?.catalogItem?.singleItems
      || item?.spItemDto?.singleItems;
    if (Array.isArray(singleItems) && singleItems.length > 0) {
      const collectedUnits: any[] = [];
      singleItems.forEach((si: any) => {
        if (Array.isArray(si?.unitItems) && si.unitItems.length > 0) {
          collectedUnits.push(...si.unitItems);
        } else if (si) {
          collectedUnits.push(si);
        }
      });
      if (collectedUnits.length > 0) {
        return collectedUnits;
      }
    }

    // 3. Fallback to sellingUnits / units
    const fallbackUnits = item?.sellingUnits
      || item?.catalogItem?.sellingUnits
      || item?.spItemDto?.sellingUnits
      || item?.units;
    if (Array.isArray(fallbackUnits) && fallbackUnits.length > 0) {
      return fallbackUnits;
    }

    return [];
  }

  hasMultipleSellingUnits(item: any): boolean {
    const unitItems = this.getItemUnitItems(item);
    return unitItems.length > 1;
  }

  shouldRedirectToDetails(item: any): boolean {
    if (!item) {
      return false;
    }
    const unitItems = this.getItemUnitItems(item);
    if (unitItems.length > 1) {
      return true;
    }
    const attrs = item?.itemAttributes
      || item?.spItemDto?.itemAttributes
      || item?.catalogItem?.itemAttributes
      || [];
    if (Array.isArray(attrs) && attrs.length > 0) {
      const hasOptions = attrs.some((a: any) =>
        (Array.isArray(a?.values) && a.values.length > 1) ||
        (Array.isArray(a?.attributeValues) && a.attributeValues.length > 1)
      );
      if (hasOptions) {
        return true;
      }
    }
    return false;
  }

  addToCart(item, $event) {
    if ($event) {
      $event.preventDefault();
      $event.stopPropagation();
    }
    if (this.shouldRedirectToDetails(item)) {
      let input = {action:'viewItem', value: item};
      this.actionPerformed.emit(input);
    } else {
      const unitItems = this.getItemUnitItems(item);
      const singleUnit = unitItems.length === 1 ? unitItems[0] : null;
      const targetItem = singleUnit
        ? {
            ...item,
            ...singleUnit,
            encId: singleUnit.encId || item.encId,
            price: (singleUnit.price !== undefined && singleUnit.price !== null && singleUnit.price !== 0) ? singleUnit.price : (item.price || singleUnit.price),
            mrp: (singleUnit.mrp !== undefined && singleUnit.mrp !== null && singleUnit.mrp !== 0) ? singleUnit.mrp : (item.mrp || singleUnit.mrp),
            taxableAmount: (singleUnit.taxableAmount !== undefined && singleUnit.taxableAmount !== null && singleUnit.taxableAmount !== 0) ? singleUnit.taxableAmount : (item.taxableAmount || singleUnit.taxableAmount),
            taxAmount: singleUnit.taxAmount ?? item.taxAmount,
            homeDelivery: singleUnit.homeDelivery ?? item.homeDelivery,
            storePickup: singleUnit.storePickup ?? item.storePickup
          }
        : item;
      let input = {action:'addToCart', value: targetItem};
      this.actionPerformed.emit(input);
    }
  }

}
