import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import {
  AuthService,
  ConfirmBoxComponent,
  ConsumerService,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  OrderService,
  SharedService,
  SubscriptionService,
  ToastService
} from 'jconsumer-shared';
import { CouponsComponent } from '../../shared/coupons/coupons.component';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartId: any;
  cartData: any = [];
  items: any = []
  selectedItems: any = [];
  quantity: any;
  loggedUser: any;
  providerConsumerId: any;
  loading: boolean = true;
  loggedIn: boolean = false;
  accountId: any;
  smallDevice: boolean;
  mediumDevice: boolean;
  config: any;
  theme: any;
  selectedCoupons: any = [];
  s3CouponsList: any = { JC: [], OWN: [] };
  coupondialogRef: any;
  isCouponsAvailable: boolean = false;
  target: any;
  isSessionCart: boolean;
  orderList: any = [];
  storeEncId: any;
  selectedItem: any;
  sessionCart: boolean;
  deliveryType: any;
  cdnPath: string = '';
  account: any;
  accountProfile: any;
  showHomeDelivery = true;
  showStorePickup = false;
  activeTab: any;
  cartTabs: any;
  storeItems: any[];
  cartDataStore: any = [];
  cartDataHome: any = [];
  homeDeliveryCount: any;
  storeItemsCount: any;
  supportAllDelivery: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth < 768) {
      this.smallDevice = true;
      this.mediumDevice = false;
    } else if (window.innerWidth <= 991) {
      this.smallDevice = true;
      this.mediumDevice = true;
    } else {
      this.smallDevice = false;
      this.mediumDevice = false;
    }
  }
  constructor(
    private router: Router,
    private location: Location,
    private subscriptionService: SubscriptionService,
    private orderService: OrderService,
    private groupService: GroupStorageService,
    private toastService: ToastService,
    private authService: AuthService,
    private dialog: MatDialog,
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private errorService: ErrorMessagingService,
    private lStorageService: LocalStorageService,
    private consumerService: ConsumerService,
  ) {
    this.onResize();
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.cdnPath = this.sharedService.getCDNPath();
    this.accountId = this.sharedService.getAccountID();
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['target']) {
        this.target = qparams['target'];
      }
    })
    this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId')
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart');
  }

  initCart() {
    this.authService.goThroughLogin().then((status) => {
      if (status) {
        this.subscriptionService.sendMessage({ ttype: 'refresh' });
        this.sessionCart = true;
        this.loggedIn = true;
        this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
        this.providerConsumerId = this.loggedUser.providerConsumer;
        this.getCart();

      } else {
        if (this.isSessionCart) {
          this.loggedIn = false;
          this.loading = false;
        } else {
          this.items = [];
          let homeDelivery = false;
          let storePickup = false;
          if (this.lStorageService.getitemfromLocalStorage('cartData')) {
            this.cartData = this.lStorageService.getitemfromLocalStorage('cartData');
            if (this.cartData?.HOME_DELIVERY?.items?.length > 0) {
              this.items = this.cartData.HOME_DELIVERY.items;
              this.cartDataHome = this.cartData.HOME_DELIVERY;
              homeDelivery = true;
            }
            if (this.cartData?.STORE_PICKUP?.items?.length > 0) {
              this.storeItems = this.cartData.STORE_PICKUP.items;
              this.cartDataStore = this.cartData.STORE_PICKUP;
              storePickup = true;
            }
            let cartInfo = {}
            cartInfo['items'] = this.items.map((item) => ({
              catalogItem: {
                encId: item.encId,
              },
              quantity: item.quantity,
            }));

            if (storePickup && homeDelivery) {
              this.supportAllDelivery = true;
              this.showHomeDelivery = true;
            } else if (storePickup) {
              this.showStorePickup = true;
              this.showHomeDelivery = false;
            } else {
              this.showHomeDelivery = true;
            }
            this.subscriptionService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
          }
          this.sessionCart = true;
          this.loading = false;
        }
        // this.loggedIn = false;
        // this.loading = false;
      }
      setTimeout(() => {
        this.setTabItems()
      }, 100);
    })

  }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.initCart();
  }
  setTabItems() {
    this.homeDeliveryCount = this.items?.length ? `(${this.items?.length})` : '(' + 0 + ')';
    this.storeItemsCount = this.storeItems?.length ? `(${this.storeItems?.length})` : '(' + 0 + ')';

    this.cartTabs = [
      {
        label: `<span class="material-icons tab-icon">local_shipping</span> Home Delivery` + ' ' + this.homeDeliveryCount,
        id: 'home',
        escape: false
      },
      {
        label: `<span class="material-icons tab-icon">store</span> Store Pickup` + ' ' + this.storeItemsCount,
        id: 'pickup',
        escape: false
      }
    ];
    if (((!this.items || this.items.length === 0) && this.storeItems?.length > 0) || this.showStorePickup) {
      this.activeTab = this.cartTabs[1]; // Set to Store Pickup
    } else {
      this.activeTab = this.cartTabs[0]; // Default to Home Delivery
    }
  }
  onTabChange(tab: any) {
    if (tab?.id === 'home') {
      this.showHomeDelivery = true;
      this.showStorePickup = false;
      this.cartId = this.cartDataHome.uid
    } else if (tab?.id === 'pickup') {
      this.showHomeDelivery = false;
      this.showStorePickup = true;
      this.cartId = this.cartDataStore.uid;
    }
  }
  actionPerformed(event) {
    if (this.isSessionCart) {
      this.initCart();
    } else {
      this.loggedIn = true;
      this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
      this.providerConsumerId = this.loggedUser.providerConsumer;
      this.createCart().then(data => {
        this.cartId = data;
        this.loggedIn = true;
        this.loading = false;
        this.lStorageService.removeitemfromLocalStorage('cartData')
        this.lStorageService.removeitemfromLocalStorage('deliveryType')
        this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
        this.checkout(this.deliveryType);
      })
    }
  }

  async createCart() {
    const deliveryTypes = ['HOME_DELIVERY', 'STORE_PICKUP'];
    const createdCarts = [];

    if (this.showHomeDelivery) {
      this.deliveryType = 'HOME_DELIVERY';
    } else {
      this.deliveryType = 'STORE_PICKUP';
    }
    for (const type of deliveryTypes) {
      const cartSection = this.cartData?.[type];
      if (cartSection?.items?.length > 0) {
        const cartInfo = {
          store: {
            encId: this.storeEncId
          },
          providerConsumer: {
            id: this.loggedUser.providerConsumer
          },
          deliveryType: type,
          items: cartSection.items.map((item) => ({
            catalogItem: { encId: item.encId },
            quantity: item.quantity,
          })),
          orderCategory: 'SALES_ORDER',
          orderSource: 'PROVIDER_CONSUMER'
        };

        try {
          const cartResponse = await new Promise((resolve, reject) => {
            this.orderService.createCart(cartInfo).subscribe(
              (data) => resolve(data),
              (error) => {
                const errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
                resolve(false); // or reject(error) if you want to fail completely
              }
            );
          });
          if (cartResponse) {
            createdCarts.push(cartResponse);
          }
        } catch (err) {
          console.error(`Failed to create cart for ${type}`, err);
        }
      }
    }
    return createdCarts;
  }

  getAmountInDecimalPoints(amount) {
    return parseFloat(amount).toFixed(2);
  }

  goBack() {
    this.location.back();
  }

  getCart() {
    this.orderService.getCart(this.providerConsumerId).subscribe(data => {
      this.cartData = data;
      this.items = [];
      this.storeItems = [];
      let homeDelivery = false;
      let storePickup = false;
      if (this.cartData && this.cartData.length > 0) {
        this.cartData.forEach(async cart => {
          if (cart.items && cart.items.length > 0) {
            await cart.items.forEach(item => {
              if (item && item.catalog && item.catalog.id) {
                let catalogID = item.catalog.id;
                this.getCoupons(catalogID); // Assuming getCoupons applies to both types
              }
              if (cart.deliveryType === 'HOME_DELIVERY') {
                this.items.push(item);
                this.cartDataHome = cart;
                homeDelivery = true;
              }
              else if (cart.deliveryType === 'STORE_PICKUP') {
                this.storeItems.push(item);
                this.cartDataStore = cart;
                storePickup = true;
              }
              if (this.items && this.items.length > 0) {
                this.cartId = this.cartDataHome.uid
              } else {
                this.cartId = this.cartDataStore.uid
              }
              this.setTabItems()
            });
            if (storePickup && homeDelivery) {
              this.supportAllDelivery = true;
              this.showHomeDelivery = true;
            } else if (storePickup) {
              this.showStorePickup = true;
              this.showHomeDelivery = false;
            } else {
              this.showHomeDelivery = true;
            }
          }
        });
      }
      this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: this.items?.length + this.storeItems?.length });
      this.subscriptionService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
      this.setTabItems()
      this.loading = false;
    },
      error => {
        this.loading = false;
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      });
  }
  checkout(type?) {
    if (this.loggedIn) {
      if (this.target) {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            target: this.target,

          }
        }
        this.router.navigate([this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
        this.subscriptionService.sendMessage({ ttype: 'hideItemSearch', value: 0 });
      } else {
        const navigationExtras: NavigationExtras = {
          queryParams: {
            deliveryType: type
          }
        }
        this.router.navigate([this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
        this.subscriptionService.sendMessage({ ttype: 'hideItemSearch', value: 0 });
      }
      this.setAnalytics();
    } else {
      this.loggedIn = false;
      this.sessionCart = false;
    }
  }

  removeItem(item) {
    let itemData;
    if ((this.loggedIn)) {
      itemData = item.uid;
    }
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'confirmationmainclass'],
      disableClose: true,
      data: {
        'message': '  Are you sure you want to remove this item?',
        'theme': this.theme
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (this.loggedIn) {
          this.orderService.removeItemFromCart(itemData).subscribe(data => {
            if (data) {
              this.getCart();
            }
          },
            error => {
              let errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
            })
        } else if (!this.isSessionCart && !this.loggedIn) {
          const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
            HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
            STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
          };

          const deliveryType = this.showHomeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
          const targetCart = cartData[deliveryType];
          const orderList = targetCart.items;
          const itemIndex = orderList.findIndex((orderItem: any) => orderItem.spItem.encId === item.spItem.encId);

          if (itemIndex !== -1) {
            orderList.splice(itemIndex, 1);

            // Recalculate totals for this delivery type
            const totalNetRate = orderList.reduce((total, orderItem) => total + orderItem.netRate, 0);
            const totalNetTotal = orderList.reduce((total, orderItem) => total + orderItem.netTotal, 0);
            const taxTotal = orderList.reduce((total, orderItem) => total + orderItem.totalTaxAmount, 0);

            cartData[deliveryType] = {
              items: orderList,
              netTotal: totalNetTotal,
              taxTotal: taxTotal,
              netRate: totalNetRate
            };

            // Optional: Clear deliveryType if both carts are now empty
            if (cartData?.HOME_DELIVERY?.items?.length === 0 && cartData?.STORE_PICKUP?.items?.length === 0) {
              this.lStorageService.removeitemfromLocalStorage('deliveryType');
            }
            const totalItemCount = cartData?.HOME_DELIVERY?.items?.length + cartData?.STORE_PICKUP?.items?.length;
            this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: totalItemCount });
            this.lStorageService.setitemonLocalStorage('cartData', cartData);
            this.items = cartData?.HOME_DELIVERY?.items;
            this.cartDataHome = cartData?.HOME_DELIVERY;
            this.storeItems = cartData?.STORE_PICKUP?.items;
            this.cartDataStore = cartData?.STORE_PICKUP;
          }
          this.setTabItems()
        }
      }
    });
  }

  onQuantityChange(event, item) {
    if (this.loggedIn) {
      let cartInfo = {}
      cartInfo = [
        {
          'catalogItem': {
            'encId': item.catalogItem.encId
          },
          'quantity': event,
          'uid': item.uid
        }
      ]
      this.orderService.updateCartItems(this.cartId, cartInfo).subscribe(data => {
        if (data) {
          this.getCart()
        }
      },
        error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        })
    } else {
      let cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
        HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
        STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
      };
      // Step 2: Determine delivery type from the item
      const deliveryType = this.showHomeDelivery ? 'HOME_DELIVERY' : 'STORE_PICKUP';
      // Step 3: Access the correct cart group
      const targetCart = cartData[deliveryType];
      const orderList = targetCart.items;
      const existingItem = orderList.find((orderItem: any) => orderItem.spItem.encId === item.spItem.encId);

      if (existingItem) {
        existingItem.quantity = event;  // `event` here is the new quantity
        existingItem.netTotal = existingItem.quantity * (existingItem.taxableAmount || 0);
        existingItem.totalTaxAmount = existingItem.quantity * (existingItem.taxAmount || 0);
        existingItem.netRate = existingItem.quantity * (existingItem.price || 0);
      }
      targetCart.netTotal = orderList.reduce((total, i) => total + i.netTotal, 0);
      targetCart.taxTotal = orderList.reduce((total, i) => total + i.totalTaxAmount, 0);
      targetCart.netRate = orderList.reduce((total, i) => total + i.netRate, 0);
      this.lStorageService.setitemonLocalStorage('cartData', cartData);
      this.items = cartData?.HOME_DELIVERY?.items;
      this.cartDataHome = cartData?.HOME_DELIVERY;
      this.storeItems = cartData?.STORE_PICKUP?.items;
      this.cartDataStore = cartData?.STORE_PICKUP;
    }
  }
  onInputFocus(event: any): void {
    // Blur immediately to prevent keyboard pop-up
    event.target.blur();
  }
  addMore() {
    this.router.navigate([this.sharedService.getRouteID()])
  }

  getCoupons(catalogId) {
    this.orderService.getSoCoupons(catalogId).subscribe(coupons => {
      if (coupons) {
        this.s3CouponsList.OWN = coupons;
        if (this.s3CouponsList.OWN.length > 0) {
          this.isCouponsAvailable = true;
        }
      }
    },
      error => {
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      })
  }

  couponActionPerformed(action) {
    switch (action.ttype) {
      case 'open':
        this.openCoupons();
        break;
      case 'validate':
        this.selectedCoupons = action['value'];
        this.applyCoupon();
        break;
    }
  }

  openCoupons(type?: any) {
    this.coupondialogRef = this.dialog.open(CouponsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass'],
      disableClose: true,
      data: {
        couponsList: this.s3CouponsList,
        type: type,
        theme: this.theme
      }
    });
    this.coupondialogRef.afterClosed().subscribe(() => {
    });
  }

  applyCoupon() {
    let postData = {}
    postData['couponCode'] = this.selectedCoupons;
    this.orderService.applyCoupon(this.cartId, postData).subscribe(couponData => {
      if (couponData) {
        this.toastService.showSuccess('Coupon applied successfully');
        this.selectedCoupons = [];
        this.getCart();
      }
    },
      error => {
        this.loading = false;
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      })
  }

  removeOrderCoupon(coupon) {
    const data = {};
    data['couponCode'] = coupon.couponCode;
    this.orderService.removeCoupon(this.cartId, data)
      .subscribe((data) => {
        this.toastService.showSuccess('Coupon removed successfully');
        this.getCart();
      });
  }
  setAnalytics() {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      metricId: 553,
      storeId: this.lStorageService.getitemfromLocalStorage('storeId')
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }
  getAttributeValues(attributes: any): string[] {
    return Object.values(attributes);
  }
}
