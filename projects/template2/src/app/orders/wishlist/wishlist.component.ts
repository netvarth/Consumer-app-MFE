import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MatDialog } from '@angular/material/dialog';
import { AuthService, ConfirmBoxComponent, ConsumerService, ErrorMessagingService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { FillQnrComponent } from '../../home/fill-qnr/fill-qnr.component';
import { DeliverySelectionComponent } from '../../home/items/delivery-selection/delivery-selection.component';
import { WishlistService } from '../../shared/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.scss', './wishlist_p.component.scss']
})
export class WishlistComponent implements OnInit, OnDestroy {
  loggedIn: boolean = true;
  loading: boolean = true;
  itemsLoading: boolean = false;
  items: any[] = [];
  itemsCount: number = 0;
  rows: number = 10;
  currentPage: number = 0;
  quantity: number = 1;
  account: any;
  accountId: any;
  accountProfile: any;
  storeEncId: any;
  storeId: any;
  config: any;
  theme: any;
  loggedUser: any;
  selectedItem: any;
  itemOptionsRef: DynamicDialogRef;
  questionAnswers: any;
  itemDeliveryType: string;
  isLogin: boolean;
  isSessionCart: any;
  hidePrices: boolean = false;
  cartDisabled: boolean = false;
  cdnPath: string = '';

  sortOptions = [
    { label: 'Recommended', value: 'recommended' },
    { label: 'Name: A-Z', value: 'a_z' },
    { label: 'Name: Z-A', value: 'z_a' },
    { label: 'Price: Low to High', value: 'price_low' },
    { label: 'Price: High to Low', value: 'price_high' }
  ];
  selectedSort = 'recommended';

  private subscriptions = new Subscription();

  constructor(
    private router: Router,
    private location: Location,
    private sharedService: SharedService,
    private orderService: OrderService,
    private activatedRoute: ActivatedRoute,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private dialogService: DialogService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private subscriptionService: SubscriptionService,
    private errorService: ErrorMessagingService,
    private consumerService: ConsumerService,
    private wishlistService: WishlistService,
  ) {
    this.accountId = this.sharedService.getAccountID();
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    const accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig) {
      this.cartDisabled = accountConfig['cartDisabled'] || false;
      this.hidePrices = accountConfig['hidePrice'] || false;
    }
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart');
    this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config?.theme) {
      this.theme = this.config.theme;
    }
    this.loading = true;
    this.getStores().then(() => {
      this.loadWishlist();
    });
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.itemsCount / this.rows));
  }

  get displayedItems(): any[] {
    const start = this.currentPage * this.rows;
    return this.items.slice(start, start + this.rows);
  }

  goBack() {
    this.location.back();
  }

  goHome() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }

  private getStores() {
    const filter = {
      'accountId-eq': this.accountId,
      'onlineOrder-eq': true,
      'status-eq': 'Active'
    };

    return new Promise((resolve, reject) => {
      this.orderService.getStores(filter).subscribe(
        (stores: any) => {
          const store = stores?.[0];
          if (store) {
            this.storeEncId = store.encId;
            this.storeId = store.id;
            this.lStorageService.setitemonLocalStorage('storeId', store.id);
          }
          resolve(true);
        },
        (error) => {
          this.loading = false;
          reject(error);
        }
      );
    });
  }

  private loadWishlist(): void {
    const providerConsumerId = this.loggedUser?.providerConsumer;
    if (!providerConsumerId || !this.storeId) {
      this.loggedIn = false;
      this.loading = false;
      return;
    }

    this.itemsLoading = true;
    const listSub = this.wishlistService.getallWishlistItems(providerConsumerId).subscribe(
      (wishlistItems: any) => {
        const list = this.extractWishlistItems(wishlistItems);
        const normalized = list.map((wish) => this.normalizeWishlistItem(wish)).filter(Boolean) as any[];
        this.items = normalized;
        this.itemsCount = this.resolveWishlistCount(wishlistItems, normalized.length);
        this.items.forEach((item) => this.wishlistService.add(item));
        this.applySort();
        this.itemsLoading = false;
        this.loading = false;
      },
      () => {
        this.items = [];
        this.itemsCount = 0;
        this.itemsLoading = false;
        this.loading = false;
      }
    );
    this.subscriptions.add(listSub);
  }

  private extractWishlistItems(wishlistItems: any): any[] {
    if (!Array.isArray(wishlistItems)) {
      return [];
    }
    const hasWrappedItems = wishlistItems.some((entry) => Array.isArray(entry?.items));
    if (hasWrappedItems) {
      return wishlistItems.reduce((acc: any[], entry: any) => {
        if (Array.isArray(entry?.items)) {
          acc.push(...entry.items);
        }
        return acc;
      }, []);
    }
    return wishlistItems;
  }

  private resolveWishlistCount(wishlistItems: any, fallbackCount: number): number {
    if (Array.isArray(wishlistItems) && wishlistItems.length > 0) {
      const firstCount = wishlistItems[0]?.itemCount;
      if (typeof firstCount === 'number') {
        return firstCount;
      }
    }
    return fallbackCount;
  }

  private normalizeWishlistItem(wish: any): any | null {
    if (!wish) {
      return null;
    }
    const catalogItem = wish?.catalogItem || {};
    const spItem = wish?.spItem || {};
    const itemEncId = catalogItem?.encId;
    const spCode = spItem?.spCode;
    const mergedItem: any = {
      ...catalogItem,
      encId: catalogItem?.encId || wish?.encId,
      spItem,
      spItemDto: spItem,
      catalogItem,
      attachments: wish?.attachments || spItem?.attachments || catalogItem?.attachments || [],
      wishlistUid: wish?.id,
      deliveryType: wish?.deliveryType
    };
    if (spCode && itemEncId) {
      this.wishlistService.setWishlistItemSpCode(itemEncId, spCode);
    }
    if (mergedItem?.wishlistUid && itemEncId) {
      this.wishlistService.setWishlistItemUid(itemEncId, mergedItem.wishlistUid);
    }
    return mergedItem;
  }

  onSortChange() {
    this.applySort();
  }

  private applySort(): void {
    if (!this.items?.length) {
      return;
    }
    const items = [...this.items];
    const getName = (item: any) => (item?.spItemDto?.name || item?.spItem?.name || '').toLowerCase();
    const getPrice = (item: any) => Number(item?.price || 0);
    switch (this.selectedSort) {
      case 'a_z':
        items.sort((a, b) => getName(a).localeCompare(getName(b)));
        break;
      case 'z_a':
        items.sort((a, b) => getName(b).localeCompare(getName(a)));
        break;
      case 'price_low':
        items.sort((a, b) => getPrice(a) - getPrice(b));
        break;
      case 'price_high':
        items.sort((a, b) => getPrice(b) - getPrice(a));
        break;
      default:
        break;
    }
    this.items = items;
  }

  goToPage(page: number): void {
    const targetPage = Math.max(0, Math.min(page, this.totalPages - 1));
    if (targetPage === this.currentPage) {
      return;
    }
    this.currentPage = targetPage;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getItemImage(item: any) {
    if (item?.spItemDto?.attachments?.length && item.spItemDto.attachments[0]?.s3path) {
      return item.spItemDto.attachments[0].s3path;
    }
    return `${this.cdnPath}assets/images/rx-order/items/Items.svg`;
  }

  isLowStock(item: any): boolean {
    return !!(item?.spItemDto?.lowStock || item?.lowStock || item?.spItemDto?.stockStatus === 'LOW');
  }

  viewItems(item: any, target?: any) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        itemEncid: item.encId
      }
    };
    if (target) {
      this.lStorageService.setitemonLocalStorage('itemTarget', target);
    }
    this.router.navigate([this.sharedService.getRouteID(), 'item', item.encId], navigationExtras);
  }

  addToCart($event?: any, item?: any) {
    if (item && item.itemNature === 'VIRTUAL_ITEM') {
      item.itemNature = 'VIRTUAL_ITEM';
    } else {
      if ($event) {
        $event.preventDefault();
        $event.stopPropagation();
      }
      const _this = this;
      if (item) {
        this.selectedItem = item;
      }
      this.itemDeliveryType =
        this.selectedItem?.deliveryType ||
        (this.selectedItem?.homeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP');
      if (this.selectedItem && !this.selectedItem.deliveryType && this.selectedItem.homeDelivery) {
        const dialogWidth = '500px';
        const deliveryDialogRef = this.dialogService.open(DeliverySelectionComponent, {
          header: 'Select Delivery Type',
          width: dialogWidth,
          contentStyle: { "max-height": "500px", "overflow": "auto" },
          baseZIndex: 10000,
          styleClass: 'custom-dialogs',
          data: {
            theme: this.theme
          }
        });

        deliveryDialogRef.onClose.subscribe((result: any) => {
          if (result) {
            this.itemDeliveryType = result;
            this.proceedWithAddToCart(item);
          }
        });
      } else {
        this.proceedWithAddToCart(item);
      }
    }
  }

  proceedWithAddToCart(item: any) {
    const _this = this;
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.loggedIn = true;
          _this.loggedUser = _this.groupService.getitemFromGroupStorage('jld_scon');
          _this.isLogin = false;
          let iteId: any = null;
          if (this.selectedItem?.spItemDto?.id) {
            iteId = this.selectedItem.spItemDto.id;
          }
          this.orderService.getQnrOrder(iteId).subscribe(
            (data: any) => {
              if (data) {
                if (data?.questionnaireId) {
                  this.itemOptionsRef = this.dialogService.open(FillQnrComponent, {
                    width: '90%',
                    contentStyle: { "max-height": "500px", "overflow": "auto" },
                    baseZIndex: 10000,
                    data: data
                  });
                  this.itemOptionsRef.onClose.subscribe((result: any) => {
                    if (result !== undefined) {
                      this.questionAnswers = result;
                      if (this.questionAnswers?.answers?.answerLine?.length > 0) {
                        this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.questionAnswers);
                        _this.createCart(_this.selectedItem).then((cartData) => {
                          if (cartData) {
                            _this.toastService.showSuccess('Item added to cart');
                            _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                          }
                        });
                      }
                    } else {
                      _this.createCart(_this.selectedItem).then((cartData) => {
                        if (cartData) {
                          _this.toastService.showSuccess('Item added to cart');
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                        }
                      });
                    }
                  });
                } else {
                  _this.createCart(_this.selectedItem).then((cartData) => {
                    if (cartData) {
                      _this.toastService.showSuccess('Item added to cart');
                      _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                    }
                  });
                }
              }
            }, (error: any) => {
              const errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
            });
        } else {
          if (!this.isSessionCart) {
            const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
              HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
              STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
            };
            const deliveryType = this.itemDeliveryType === 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
            const targetCart = cartData[deliveryType];
            const orderList = targetCart.items;

            const existingItem = orderList.find((orderItem: any) => orderItem.spItem.encId === item.spItem.encId);
            if (existingItem) {
              existingItem.quantity = (existingItem.quantity || 1) + this.quantity;
              existingItem.netTotal = existingItem.quantity * (existingItem.taxableAmount || 0);
              existingItem.totalTaxAmount = existingItem.quantity * (existingItem.taxAmount || 0);
              existingItem.netRate = existingItem.quantity * (existingItem.price || 0);
            } else {
              const newItem = {
                ...item,
                quantity: this.quantity,
                price: item.price || 0,
                netTotal: this.quantity * (item.taxableAmount || 0),
                totalTaxAmount: this.quantity * (item.taxAmount || 0),
                netRate: this.quantity * (item.price || 0)
              };
              orderList.push(newItem);
            }
            targetCart.netTotal = orderList.reduce((total, i) => total + i.netTotal, 0);
            targetCart.taxTotal = orderList.reduce((total, i) => total + i.totalTaxAmount, 0);
            targetCart.netRate = orderList.reduce((total, i) => total + i.netRate, 0);

            this.lStorageService.setitemonLocalStorage('cartData', cartData);
            const totalItems = cartData.HOME_DELIVERY.items.length + cartData.STORE_PICKUP.items.length;
            this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: totalItems });
            this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
            this.toastService.showSuccess('Item added to cart');
            this.loggedIn = true;
            this.loading = false;
          } else {
            this.isLogin = true;
            this.loggedIn = false;
            this.loading = false;
          }
        }
      }
    );
  }

  createCart(item: any) {
    const cartInfo: any = {};
    cartInfo['store'] = {
      'encId': this.storeEncId
    };
    cartInfo['providerConsumer'] = {
      'id': this.loggedUser?.providerConsumer
    };
    cartInfo['deliveryType'] = this.itemDeliveryType === 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
    cartInfo['items'] = [
      {
        'catalogItem': {
          'encId': item.encId
        },
        'quantity': this.quantity
      }
    ];
    cartInfo['orderCategory'] = 'SALES_ORDER';
    cartInfo['orderSource'] = 'PROVIDER_CONSUMER';
    return new Promise((resolve) => {
      this.orderService.createCart(cartInfo).subscribe(
        (data: any) => resolve(data),
        (error: any) => {
          resolve(false);
          const errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
    });
  }

  actionPerformed() {
    this.loggedIn = true;
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.loadWishlist();
  }

  onWishlist(item: any, event: any) {
    if (event) {
      event.stopPropagation();
    }
    const itemEncId = item?.spItem?.encId || item?.encId;
    const spCode = item?.spItem?.spCode || item?.spItemDto?.spCode || item?.spCode;
    if (!itemEncId) {
      return;
    }
    if (this.isWishlisted(item)) {
      const dialogRef = this.dialog.open(ConfirmBoxComponent, {
        width: '50%',
        panelClass: ['popup-class', 'commonpopupmainclass', 'confirmationmainclass'],
        disableClose: true,
        data: {
          message: '  Are you sure you want to remove this item?',
          theme: this.theme
        }
      });
      dialogRef.afterClosed().subscribe(result => {
        if (!result) {
          return;
        }
        const providerConsumerId = this.loggedUser?.providerConsumer;
        const removeSub = (spCode
          ? this.wishlistService.deleteWishlistItemBySpCode(spCode)
          : this.wishlistService.deleteWishlistItemByItemEncId(itemEncId, providerConsumerId))
          .subscribe(
            () => {
              this.wishlistService.removeFromWishlist(itemEncId);
              this.items = this.items.filter(existing => ((existing?.spItem?.encId || existing?.encId) !== itemEncId));
              this.itemsCount = Math.max(0, this.itemsCount - 1);
              item.wishlistUid = undefined;
            },
            (error: any) => {
              const errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
            }
          );
        this.subscriptions.add(removeSub);
      });
      return;
    }
    this.wishlistService.add(item);
  }

  isWishlisted(item: any): boolean {
    return this.wishlistService.isWishlisted(item?.spItem?.encId || item?.encId);
  }

  trackByItem(index: number, item: any) {
    return item?.encId || item?.spItemDto?.id || index;
  }
}
