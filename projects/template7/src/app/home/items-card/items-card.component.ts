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
  
  addToCart(item, $event) {
    $event.preventDefault();
    $event.stopPropagation();
    if (item &&  item.itemNature =="VIRTUAL_ITEM") {
      let input = {action:'viewItem', value: item};
      this.actionPerformed.emit(input);
    }else{
      let input = {action:'addToCart', value: item};
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
