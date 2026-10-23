import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
// import { SharedService } from 'jconsumer-shared';
import { ErrorMessagingService, GroupStorageService, LocalStorageService, SharedService, ToastService } from 'jconsumer-shared';
import { WishlistService } from '../../shared/wishlist.service';

@Component({
  selector: 'app-items-card',
  templateUrl: './items-card.component.html',
  styleUrls: ['./items-card.component.scss']
})
export class ItemsCardComponent implements OnInit, OnChanges {
  @Input() themes: any;
  @Input() items: any;
  @Input() cartDisabled: any;
  // @Input() storeEncId?: string;
  @Output() actionPerformed = new EventEmitter<any>();
  theme: any;
  cdnPath: string = '';
  loggedUser: any;
  constructor(
    private sharedService: SharedService,
    private wishlistService: WishlistService,
    private groupService: GroupStorageService,
    private lStorageService: LocalStorageService,
    private router: Router,
    private toastService: ToastService,
    private errorService: ErrorMessagingService,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
   }

  ngOnInit(): void {
    this.theme = this.themes
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['themes']) {
      this.theme = this.themes;
    }
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

  isWishlisted(item: any): boolean {
    return this.wishlistService.isWishlisted(item?.encId);
  }

  onWishlist(item: any, event: any) {
    if (event) {
      event.stopPropagation();
    }
    if (!item?.encId) {
      return;
    }
    if (this.isWishlisted(item)) {
      const providerConsumerId = this.loggedUser?.providerConsumer;
      this.wishlistService.deleteWishlistItemByItemEncId(item.encId, providerConsumerId).subscribe(
        () => {
          this.wishlistService.removeFromWishlist(item.encId);
          this.toastService.showSuccess('Removed from wishlist');
        },
        (error) => {
          const errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
      return;
    }
    if (!this.loggedUser?.providerConsumer) {
      const target = this.router.url || (this.sharedService.getRouteID() + '/items');
      this.lStorageService.setitemonLocalStorage('target', target);
      this.router.navigate([this.sharedService.getRouteID(), 'login']);
      return;
    }
    const storeEncId =
      // this.storeEncId ||
      this.lStorageService.getitemfromLocalStorage('storeEncId') ||
      item?.store?.encId;
    if (!storeEncId) {
      this.toastService.showError('Store not available');
      return;
    }
    const payload = {
      store: {
        encId: storeEncId
      },
      providerConsumer: {
        id: this.loggedUser.providerConsumer
      },
      deliveryType: this.resolveWishlistDeliveryType(item),
      items: [
        {
          catalogItem: {
            encId: item.encId
          },
          quantity: 1
        }
      ],
      orderCategory: 'SALES_ORDER',
      orderSource: 'PROVIDER_CONSUMER'
    };
    this.wishlistService.addToWishlist(payload).subscribe(
      (response: any) => {
        this.wishlistService.add(item);
        const wishlistUid = response?.id || response?.items?.[0]?.id;
        if (wishlistUid) {
          this.wishlistService.setWishlistItemUid(item.encId, wishlistUid);
        }
        this.toastService.showSuccess('Added to wishlist');
      },
      (error) => {
        const errorObj = this.errorService.getApiError(error);
        const message = errorObj?.error || errorObj?.message || errorObj?.msg || '';
        if (typeof message === 'string' && message.toLowerCase().includes('already added to wishlist')) {
          this.wishlistService.add(item);
          return;
        }
        this.toastService.showError(errorObj);
      }
    );
  }

  private resolveWishlistDeliveryType(item: any): 'HOME_DELIVERY' | 'STORE_PICKUP' {
    const homeDelivery =
      item?.homeDelivery ??
      item?.spItemDto?.homeDelivery ??
      item?.spItem?.homeDelivery ??
      item?.catalogItem?.homeDelivery ??
      item?.catalogItem?.spItemDto?.homeDelivery;
    return homeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
  }

}
