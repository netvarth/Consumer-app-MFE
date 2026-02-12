import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  AccountService,
  AuthService,
  ConsumerService,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  OrderService,
  SharedService,
  SubscriptionService,
  ToastService
} from 'jconsumer-shared';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FillQnrComponent } from '../fill-qnr/fill-qnr.component';
import { ItemService } from './item.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrl: './item.component.scss'
})
export class ItemComponent implements OnInit, OnDestroy {
  loggedIn: boolean = true;
  isLogin: boolean = false;
  quantity: number = 1; // Initial quantity
  sizes = [
    {
      size: '160 g',
    },
    {
      size: 'Pack of 2 (160 g each)',
    },
    {
      size: 'Pack of 3 (160 g each)',
    }
  ]
  selectedSize: any;
  item: any;
  orderItem: any = [];
  cartId: any;
  loading: any = true;
  loggedUser: any;
  account: any;
  accountProfile: any;
  accountId: any;
  itemEncid: any;
  storeEncId: any;
  items: any = [];
  itemsCount: any = [];
  action!: string;
  selectedItemImage: any;
  config: any;
  theme: any;
  isCartCreated: boolean = false;
  prevItem: any;
  questionnaireList: any;
  itemId: any;
  itemOptionsRef!: DynamicDialogRef;
  questionAnswers: any;
  spItemCategoryId: any;
  safeHtml: any;
  readMore = false;
  showFullContent = false;
  badges: any;
  isSessionCart: any;
  orderList: any = [];
  deliveryType: any;
  tempOrderList: any;
  cdnPath: string = '';
  selectedValues: { [key: string]: string } = {};
  itemAttributes: any;
  virtualItem = false;
  private subscriptions: Subscription = new Subscription();
    deliveryOptions = [
  {
    label: 'Home Delivery',
    value: 'HOME_DELIVERY',
    icon: 'assets/images/homed.svg'
  },
  {
    label: 'Store Pickup',
    value: 'STORE_PICKUP',
    icon: 'assets/images/storep.svg'
  }
];
  itemDeliveryType: any;
  constructor(
    private sharedService: SharedService,
    private orderService: OrderService,
    private itemService: ItemService,
    private subscriptionService: SubscriptionService,
    private groupService: GroupStorageService,
    private router: Router,
    private accountService: AccountService,
    private authService: AuthService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private lStorageService: LocalStorageService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer,
    private errorService: ErrorMessagingService,
    private consumerService: ConsumerService,

  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.accountId = this.sharedService.getAccountID();
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 500);
  }
  itemActionPerformed(itemID: any) {
    this.getSoCatalogItemById(itemID);
    this.quantity = 1;
    this.isCartCreated = false;
    this.scrollToElement('itemContainer');
  }
  cartModalActionPerformed(event: any) {
    if (event) {
      this.isCartCreated = false;
    }
  }
  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    let subs = this.activatedRoute.params.subscribe((params: any) => {
      if (params && params['id']) {
        if (this.prevItem != params['id']) {
          this.itemEncid = params['id']
          this.virtualItem = false;
          this.getSoCatalogItemById(this.itemEncid);
          this.prevItem = this.itemEncid;
          this.scrollToElement('itemContainer');
        }
      }
      this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
      setTimeout(() => {
        this.storeEncId = this.accountService.getActiveStore();
        if (this.storeEncId) {
          this.getSoCatalogItems()
        }
        this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
      }, 200);
    })
    this.subscriptions.add(subs);

  }
  setHtmlContent(content: any) {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(content);
  }
  selectSize(size: number) {
    this.selectedSize = size;
  }
  goBack() {
    this.location.back();
  }
  getSoCatalogItems() {
    this.loading = true;
    let filter: any = {};
    filter['accountId-eq'] = this.accountId;
    filter['storeEncId-eq'] = this.storeEncId;
    filter['from'] = 0;
    filter['count'] = 25;
    if (this.spItemCategoryId) {
      filter['spItemCategoryId-eq'] = this.spItemCategoryId;
    }
    filter['parentItemId-eq'] = 0;
    let sub1 = this.orderService.getStoreCatalogItems(filter).subscribe((items: any) => {
      this.items = items;
      this.loading = false;
    }, (error: any) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub1);
    let sub2 = this.orderService.getStoreCatalogItemsCount(filter).subscribe((count: any) => {
      this.itemsCount = count;
      this.loading = false;
    }, (error: any) => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub2);
  }

  viewAll() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        accountId: this.accountId,
        storeEncId: this.storeEncId,
        target: 'itemDetails'
      }
    }
    this.router.navigate([this.sharedService.getRouteID(), 'items'], navigationExtras)
  }

  getSoCatalogItemById(itemID: any) {
    this.loading = true;
    let sub = this.orderService.getSoCatalogItemById(this.accountId, itemID).subscribe((itemData: any) => {
      if (itemData) {
        this.item = itemData;
        if (itemData && itemData.spItemDto && itemData.spItemDto.id) {
          this.itemId = itemData.spItemDto.id;
        } 
        if (itemData?.spItemDto?.itemCategory?.id) {
          this.spItemCategoryId = itemData.spItemDto.itemCategory.id;
        }
        if (itemData && itemData.spItemDto && itemData.spItemDto.attachments && itemData.spItemDto.attachments.length > 0) {
          this.selectedItemImage = itemData.spItemDto.attachments[0];
        } else {
          this.selectedItemImage = { s3path: (this.cdnPath + 'assets/images/rx-order/items/Items.svg') }
        }
        if (itemData && itemData.spItemDto && itemData.spItemDto.badges && itemData.spItemDto.badges.length > 0) {
          this.badges = itemData.spItemDto.badges;
        }
        if (this.item && this.item.itemAttributes && this.item.itemAttributes.length > 0) {
          this.initializeSelectedValues();
        } else{
        if (itemData && itemData.homeDelivery && this.itemDeliveryType != 'STORE_PICKUP') {
          this.itemDeliveryType = 'HOME_DELIVERY'
        } else{
          this.itemDeliveryType = 'STORE_PICKUP'
        }
        }
         console.log('itemData1',this.item)
        this.loading = false;
        this.setHtmlContent(this.item.spItemDto.internalDesc);
      }
    }, (error: any) => {
      this.loading = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    })
    this.subscriptions.add(sub);
  }
  actionPerformed(event: any) {
    this.addToCart(this.action);
  }
  setSelectedItemImage(item: any) {
    this.selectedItemImage = item;
  }
  addToCart(param?: string | null) {
    const _this = this;
    this.loading = true;
    const requiresOtpForCart = this.isSessionCart === true || this.isSessionCart === 'true';
    let item = this.item
    if (this.virtualItem == true) {
      item = this.itemAttributes;
    } else {
      item = this.item;
    }

    if (!requiresOtpForCart && !param) {
      const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
        HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
        STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
      };
      const deliveryType = this.itemDeliveryType == 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
      const targetCart = cartData[deliveryType];
      const orderList = targetCart.items;
      const existingItem = orderList.find((orderItem: any) => orderItem.encId === item.encId);
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

      this.toastService.showSuccess("Item added to cart");
      this.setAnalytics('addToCart');
      this.loggedIn = true;
      this.loading = false;
      return;
    }

    this.authService.goThroughLogin().then((status: any) => {
      const currentUser = _this.groupService.getitemFromGroupStorage('jld_scon');
      const hasAuthToken = !!_this.lStorageService.getitemfromLocalStorage('c_authorizationToken') ||
        !!_this.lStorageService.getitemfromLocalStorage('refreshToken');
      const canUseServerCart = !!requiresOtpForCart && !!status && !!currentUser?.providerConsumer && hasAuthToken;

      if (canUseServerCart) {
        _this.loggedIn = true;
        _this.loggedUser = currentUser;
        _this.isLogin = false;
        let subs = this.orderService.getQnrOrder(this.itemId).subscribe(
          (data: any) => {
            if (data) {
              this.questionnaireList = data;
              const navigationExtras: NavigationExtras = {
                queryParams: {
                  deliveryType: this.itemDeliveryType
                }
              }
              console.log(this.questionnaireList)
              if (this.questionnaireList && this.questionnaireList.questionnaireId) {
                this.itemOptionsRef = this.dialogService.open(FillQnrComponent, {
                  width: '90%',
                  contentStyle: { "max-height": "500px", "overflow": "auto" },
                  baseZIndex: 10000,
                  data: this.questionnaireList
                });
                this.itemOptionsRef.onClose.subscribe((result: any) => {
                  console.log(result)
                  if (result !== undefined) {
                    this.questionAnswers = result
                    if (this.questionAnswers.answers.answerLine && this.questionAnswers.answers.answerLine.length > 0) {
                      this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.questionAnswers);
                      _this.createCart().then(data => {
                        _this.cartId = data;
                        if (param) {
                          _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                        } else {
                          _this.loggedIn = true;
                          _this.loading = false;
                          _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                          _this.toastService.showSuccess("Item added to cart");
                          this.setAnalytics('addToCart')
                        }
                      })
                    }
                  } else {
                    _this.createCart().then(data => {
                      _this.cartId = data;
                      if (param) {
                        _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                        _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                      } else {
                        _this.loggedIn = true;
                        _this.loading = false;
                        _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                        _this.toastService.showSuccess("Item added to cart");
                        this.setAnalytics('addToCart')
                      }
                    })
                  }
                });
              }
              else {
                _this.createCart().then(data => {
                  _this.cartId = data;
                  if (param) {
                    _this.router.navigate([_this.sharedService.getRouteID(), 'order', 'checkout'], navigationExtras)
                    _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                      _this.lStorageService.removeitemfromLocalStorage('cartData')
                        _this.lStorageService.removeitemfromLocalStorage('deliveryType')
                  } else {
                    _this.loggedIn = true;
                    _this.loading = false;
                    _this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                    _this.toastService.showSuccess("Item added to cart");
                    this.setAnalytics('addToCart')
                  }
                })
              }
            }
          }, (error: any) => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
          });
        this.subscriptions.add(subs);
      } else {
        this.loggedIn = false;
        this.loading = false;
        this.isLogin = true;
      }
    }
    )
  }

  capitalizeFirst(str) {
    return str
      .toLowerCase()
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }

  byNow() {
    this.action = "checkout";
    this.setAnalytics('checkOut');
    this.addToCart(this.action);
  }
  setAnalytics(source?) {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      metricId: 548,
      storeId: this.lStorageService.getitemfromLocalStorage('storeId')
    }
    if (source == 'addToCart') {
      analytics['metricId'] = 550
    } else if (source == 'checkOut') {
      analytics['metricId'] = 553
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }
  
  // createCart() {
  //   console.log('this.itemDeliveryType',this.itemDeliveryType)
  //   let cartInfo: any = {
  //     store: {
  //       encId: this.storeEncId
  //     },
  //     providerConsumer: {
  //       id: this.loggedUser.providerConsumer
  //     }
  //   };
  //   let item = this.item
  //   if (this.virtualItem == true) {
  //     item = this.itemAttributes;
  //   } else {
  //     item = this.item;
  //   }
  //   const savedCartData = this.lStorageService.getitemfromLocalStorage('cartData');
  //   const savedDeliveryType = this.lStorageService.getitemfromLocalStorage('deliveryType');
  //   const calculatedDeliveryType = this.itemDeliveryType
     
  //   if (savedCartData && savedDeliveryType === calculatedDeliveryType) {
  //     this.tempOrderList = savedCartData.items;
  //     let itemExists = false;
  //     this.tempOrderList = this.tempOrderList.map((cartItem) => {
  //       if (cartItem.encId === item.encId) {
  //         itemExists = true;
  //         return {
  //           ...cartItem,  
  //           quantity: cartItem.quantity + this.quantity
  //         };
  //       }
  //       return cartItem;
  //     });
  //     if (!itemExists) {
  //       this.tempOrderList.push({
  //         encId: item.encId,
  //         quantity: this.quantity
  //       });
  //     }
  //     cartInfo.deliveryType = savedDeliveryType;
  //     cartInfo.items = this.tempOrderList.map((item) => ({
  //       catalogItem: { encId: item.encId },
  //       quantity: item.quantity,
  //       deliveryType:this.itemDeliveryType
  //     }));
  //   } else {
  //     cartInfo.deliveryType = calculatedDeliveryType;
  //     cartInfo.items = [
  //       {
  //         catalogItem: { encId: item.encId },
  //         quantity: this.quantity
  //       }
  //     ];
  //   }
  //   cartInfo['orderCategory'] = 'SALES_ORDER';
  //   cartInfo['orderSource'] = 'PROVIDER_CONSUMER';
  //   return new Promise((resolve, reject) => {
  //     this.orderService.createCart(cartInfo).subscribe((data: any) => {
  //       resolve(data);
  //     }, (error: any) => {
  //       resolve(false);
  //       let errorObj = this.errorService.getApiError(error);
  //       this.toastService.showError(errorObj);
  //     }
  //     );
  //   });
  // }
//   createCart() {
//   console.log('this.itemDeliveryType', this.itemDeliveryType);

//   let item = this.virtualItem ? this.itemAttributes : this.item;
//   const deliveryType = this.itemDeliveryType;
//   const quantity = this.quantity;

//   // Get existing cart data or initialize structure
//   const savedCartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
//     HOME_DELIVERY: { items: [] },
//     STORE_PICKUP: { items: [] }
//   };

//   // Ensure current deliveryType exists in savedCartData
//   if (!savedCartData[deliveryType]) {
//     savedCartData[deliveryType] = { items: [] };
//   }

//   // Check if item exists and update quantity
//   let itemExists = false;
//   savedCartData[deliveryType].items = savedCartData[deliveryType].items.map(cartItem => {
//     if (cartItem.encId === item.encId) {
//       itemExists = true;
//       return {
//         ...cartItem,
//         quantity: cartItem.quantity + quantity
//       };
//     }
//     return cartItem;
//   });

//   // If item is new, push it
//   if (!itemExists) {
//     savedCartData[deliveryType].items.push({
//       encId: item.encId,
//       quantity: quantity
//     });
//   }

//   // Store back the updated cart
//   // this.lStorageService.setitemInLocalStorage('cartData', savedCartData);

//   // Build cart request array
//   const cartRequest = Object.keys(savedCartData).map((type) => {
//     const items = savedCartData[type].items;

//     // If no items, skip this cart
//     if (!items || items.length === 0) return null;

//     return {
//       store: {
//         encId: this.storeEncId
//       },
//       providerConsumer: {
//         id: this.loggedUser.providerConsumer
//       },
//       deliveryType: type,
//       items: items.map((i: any) => ({
//         catalogItem: { encId: i.encId },
//         quantity: i.quantity
//       })),
//       orderCategory: 'SALES_ORDER',
//       orderSource: 'PROVIDER_CONSUMER'
//     };
//   }).filter(Boolean); // Remove null entries

//   return new Promise((resolve, reject) => {
//     this.itemService.createCart(cartRequest).subscribe(
//       (data: any) => {
//         resolve(data);
//       },
//       (error: any) => {
//         resolve(false);
//         const errorObj = this.errorService.getApiError(error);
//         this.toastService.showError(errorObj);
//       }
//     );
//   });
// }
createCart() {
  console.log('this.itemDeliveryType', this.itemDeliveryType);

  let item = this.virtualItem ? this.itemAttributes : this.item;
  const deliveryType = this.itemDeliveryType;
  const quantity = this.quantity;

  // Fetch or initialize savedCartData structure
  let savedCartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
    HOME_DELIVERY: { items: [] },
    STORE_PICKUP: { items: [] }
  };

  // Ensure current delivery type exists
  if (!savedCartData[deliveryType]) {
    savedCartData[deliveryType] = { items: [] };
  }

  // Update items for selected deliveryType
  let itemExists = false;
  savedCartData[deliveryType].items = savedCartData[deliveryType].items.map(cartItem => {
    if (cartItem.encId === item.encId) {
      itemExists = true;
      return {
        ...cartItem,
        quantity: cartItem.quantity + quantity
      };
    }
    return cartItem;
  });

  if (!itemExists) {
    savedCartData[deliveryType].items.push({
      encId: item.encId,
      quantity: quantity
    });
  }

  // Save updated cart data to localStorage
  // this.lStorageService.setitemInLocalStorage('cartData', savedCartData);

  // Build cart array with both delivery types if items exist
  const cartRequests = ['HOME_DELIVERY', 'STORE_PICKUP'].map((type) => {
    const items = savedCartData[type]?.items;
    if (!items || items.length === 0) return null;

    return {
      store: {
        encId: this.storeEncId
      },
      providerConsumer: {
        id: this.loggedUser.providerConsumer
      },
      deliveryType: type,
      items: items.map(i => ({
        catalogItem: { encId: i.encId },
        quantity: i.quantity
      })),
      orderCategory: 'SALES_ORDER',
      orderSource: 'PROVIDER_CONSUMER'
    };
  }).filter(Boolean); // Remove nulls

  // Create cart for each type and return a combined Promise
  const promises = cartRequests.map((cartInfo) => {
    return new Promise((resolve, reject) => {
      this.orderService.createCart(cartInfo).subscribe(
        (data: any) => resolve(data),
        (error: any) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          resolve(false); // still resolve so Promise.all continues
        }
      );
    });
  });

  return Promise.all(promises);
}

  viewItems(item: any) {
    this.router.navigate([this.sharedService.getRouteID(), 'item', item.encId]);
    setTimeout(() => {
      this.itemActionPerformed(item.encId);
    }, 100);
  }

  cartActionPerformed(input: any) {
    if (input.action == 'addToCart') {
      this.virtualItem = false;
      this.itemDeliveryType = input?.itemDeliveryType;
      this.itemActionPerformed(input.value.encId);
      setTimeout(() => {
        this.addToCart(null);
      }, 200);
    } else {
      this.viewItems(input.value);
    }
  }

  toggleContent() {
    this.showFullContent = !this.showFullContent;
  }

  getTruncatedContent(htmlContent): string {
    const maxLength = 400;
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    let length = 0;
    const result: string[] = [];
    const traverseNodes = (node: Node) => {
      if (length >= maxLength) return;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = (node as Text).nodeValue || '';
        if (length + text.length > maxLength) {
          result.push(text.substring(0, maxLength - length) + '...');
          length = maxLength;
        } else {
          result.push(text);
          length += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const clonedElement = element.cloneNode(false) as HTMLElement;
        result.push(clonedElement.outerHTML);
        traverseChildNodes(element.childNodes, clonedElement);
      }
    };

    const traverseChildNodes = (childNodes: NodeList, parent: HTMLElement) => {
      for (let i = 0; i < childNodes.length; i++) {
        if (length >= maxLength) return;
        traverseNodes(childNodes[i]);
      }
    };

    traverseNodes(tempDiv);
    return result.join('');
  }

  actionClicked(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else {

    }
  }

  // for virtual-item

  initializeSelectedValues() {
    this.item.itemAttributes.forEach(attribute => {
      if (attribute.values && attribute.values.length > 0) {
        this.virtualItem = true;
        this.selectedValues[attribute.attribute] = attribute.values[0]; // Select first value
        this.getAttributeItems(this.item);
      }
    });
  }
  selectValue(attribute: string, value: any) {
    this.selectedValues[attribute] = value;
    this.getAttributeItems(this.item)
    this.quantity = 1;
  }

  getAttributeItems(itemData) {
    let spItemCode = itemData.spItem.spCode
    let sub1 = this.itemService.getAttributeItemsById(spItemCode, this.selectedValues).subscribe((itemData: any) => {
      if (itemData) {
        const validItems = itemData.filter(item => item.stockStatus !== 'OUT_OF_STOCK');
        this.itemAttributes = validItems[0];
        this.setVirtualItemDetails(this.itemAttributes)
      }
    });
    this.subscriptions.add(sub1);
  }
  setVirtualItemDetails(itemData) {
    if (itemData && itemData.homeDelivery && this.itemDeliveryType != 'STORE_PICKUP') {
          this.itemDeliveryType = 'HOME_DELIVERY'
        } else{
          this.itemDeliveryType = 'STORE_PICKUP'
        }
    if (itemData && itemData.spItemDto && itemData.spItemDto.id) {
      this.itemId = itemData.spItemDto.id;
    }
    if (itemData?.spItemDto?.itemCategory?.id) {
      this.spItemCategoryId = itemData.spItemDto.itemCategory.id;
    }
    if (itemData && itemData.spItemDto && itemData.spItemDto.attachments && itemData.spItemDto.attachments.length > 0) {
      this.selectedItemImage = itemData.spItemDto.attachments[0];
    } else {
      this.selectedItemImage = { s3path: 'assets/images/rx-order/items/Items.svg' }
    }
    if (itemData && itemData.spItemDto && itemData.spItemDto.badges && itemData.spItemDto.badges.length > 0) {
      this.badges = itemData.spItemDto.badges;
    }
    this.loading = false;
    this.setHtmlContent(this.item.spItemDto.internalDesc);
  }
  orderDeliveryType(type?){
    if(type == 'homeDelivery'){
    this.itemDeliveryType = 'HOME_DELIVERY'
    }
    else{
    this.itemDeliveryType = 'STORE_PICKUP'
    }

  }
}
