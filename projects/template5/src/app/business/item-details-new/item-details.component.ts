import { AfterViewInit, Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { Location } from '@angular/common';
import { SubSink } from 'subsink';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';
import { FillQnrComponent } from '../fill-qnr/fill-qnr.component';
import { DomSanitizer } from '@angular/platform-browser';
import { ConsumerService } from '../../services/consumer-service';
import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';
import { OrderService } from '../../services/order.service';

import { Subscription } from 'rxjs';
import { SubscriptionService } from 'jaldee-framework/subscription';
import { OrderTemplatesComponent } from '../order-templates/order-templates.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-item-details',
  templateUrl: './item-details.component.html',
  styleUrls: ['./item-details.component.scss']
})
export class ItemDetailsComponent implements OnInit, AfterViewInit {
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
  selectedSize;
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
  action;
  selectedItemImage: any;
  config: any;
  theme: any;
  isCartCreated: boolean = false;
  prevItem: any;
  private subs = new SubSink();
  questionnaireList: any;
  itemId: any;
  itemOptionsRef: DynamicDialogRef;
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
  cartCount: any;
  footerCartSubscription: Subscription;
  selectedValues: { [key: string]: string } = {};
  itemAttributes: any;
  virtualItem = false;
  isPartnerLogin: any;
  itemDeliveryType: any;
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
  constructor(
    private orderService: OrderService,
    private groupService: GroupStorageService,
    private router: Router,
    private accountService: AccountService,
    private authService: AuthService,
    private location: Location,
    private activatedRoute: ActivatedRoute,
    private snackbarService: SnackbarService,
    private lStorageService: LocalStorageService,
    private toastService: ToastService,
    private dialogService: DialogService,
    private sanitizer: DomSanitizer,
    private consumerService: ConsumerService,
    private subscriptionService: SubscriptionService
  ) {
    this.loggedUser = this.groupService.getitemFromGroupStorage('ynw-user');
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.activatedRoute.queryParams.subscribe(qParams => {
      console.log("qParams", qParams)
      if (qParams && qParams['itemEncid']) {
        if (this.prevItem != qParams['itemEncid']) {
          this.itemEncid = qParams['itemEncid']
          this.getSoCatalogItemById(this.itemEncid);
          this.prevItem = this.itemEncid;
          // this.scrollToElement('itemContainer');
        }
      }
    })
    if (this.lStorageService.getitemfromLocalStorage('partner')) {
      this.isPartnerLogin = this.lStorageService.getitemfromLocalStorage('partner')
    }
    this.isSessionCart = this.lStorageService.getitemfromLocalStorage('isSessionCart')
    this.subscriptionService.getMessage().subscribe(
      (message) => {
        console.log("message", message)
        switch (message.ttype) {
          case 'cartCount':
            this.cartCount = message.value;
            // this.cartCountForSessionCart = message.value;
            break;
            case 'cartChanged':
            this.cartCount = message.value;
            break;
        }
      }
    )
    setTimeout(() => {
      if (this.isPartnerLogin) {
        this.storeEncId = this.lStorageService.getitemfromLocalStorage('storeEncId')
      } else {
        this.storeEncId = this.accountService.getActiveStore()['encId'];
      }
      if (this.storeEncId) {
        this.getSoCatalogItems()
      }
      this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
    }, 200);
  }
  ngAfterViewInit(): void {
    this.setAnalytics();
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
 
  scrollToElement(elementId: string): void {
    setTimeout(() => {
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
        setTimeout(() => {
          const currentScrollPosition = window.scrollY || document.documentElement.scrollTop;
          const elementRect = element.getBoundingClientRect();
          const scrollPosition = currentScrollPosition + elementRect.top - 50;
          window.scrollTo({ top: scrollPosition, behavior: 'smooth' });
        }, 500);
      }
    }, 500);
  }
  itemActionPerformed(itemID) {
    this.getSoCatalogItemById(itemID);
    this.quantity = 1;
    this.isCartCreated = false;
    this.scrollToElement('itemContainer');
  }
  cartModalActionPerformed(event) {
    if (event) {
      this.isCartCreated = false;
    }
  }
  ngOnInit(): void {
    this.config = this.accountService.getTemplateJson();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
     if(!this.loggedUser){
    this.setCartCountWithoutLogin();
    }
  }

  setCartCountWithoutLogin(){
  if (this.lStorageService.getitemfromLocalStorage('cartData')) {
      let cartData = this.lStorageService.getitemfromLocalStorage('cartData');
      this.cartCount = cartData.HOME_DELIVERY.items.length + cartData.STORE_PICKUP.items.length;
      this.subscriptionService.sendMessage({ ttype: 'cartCount', value :  this.cartCount  });
    }
  }
    
  ngOnDestroy(): void {
    // this.footerCartSubscription.unsubscribe();
  }
  setHtmlContent(content) {
    this.safeHtml = this.sanitizer.bypassSecurityTrustHtml(content);
  }
  selectSize(size) {
    this.selectedSize = size;
  }
  goBack() {
    this.location.back();
  }
  getSoCatalogItems() {
    this.loading = true;
    let filter = {};
    filter['accountId-eq'] = this.accountId;
    filter['storeEncId-eq'] = this.storeEncId;
    filter['from'] = 0;
    filter['count'] = 25;
    if (this.spItemCategoryId) {
      filter['spItemCategoryId-eq'] = this.spItemCategoryId;
    }
    filter['parentItemId-eq'] = 0;
    this.orderService.getStoreCatalogItems(filter).subscribe((items) => {
      this.items = items;
      this.loading = false;
    },
      error => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      })
    this.orderService.getStoreCatalogItemsCount(filter).subscribe((count) => {
      this.itemsCount = count;
      this.loading = false;
    },
      error => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      })
  }

  viewAll() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        accountId: this.accountId,
        storeEncId: this.storeEncId,
        target: 'itemDetails'
      }
    }
    this.router.navigate([this.accountService.getCustomId(), 'items'], navigationExtras)
  }

  getSoCatalogItemById(itemID) {
    this.loading = true;
    this.orderService.getSoCatalogItemById(this.accountId, itemID).subscribe((itemData: any) => {
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
          this.selectedItemImage = { s3path: 'assets/images/order/Items.svg' }
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
        this.loading = false;
        this.setHtmlContent(this.item.spItemDto.internalDesc);
      }
    },
      error => {
        this.loading = false;
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      })
  }
  actionPerformed(event) {
    this.addToCart(this.action);
  }
  setSelectedItemImage(item) {
    this.selectedItemImage = item;
  }
  addToCart(param?) {
    const _this = this;
    this.loading = true;
    let item = this.item
    if (this.virtualItem == true) {
      item = this.itemAttributes;
    } else {
      item = this.item;
    }
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
          _this.loggedIn = true;
          _this.loggedUser = _this.groupService.getitemFromGroupStorage('ynw-user');
          _this.isLogin = false;
          this.subs.sink = this.orderService.getQnrOrder(this.itemId).subscribe(
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
                    // header: 'Choose Item Options',
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
                            _this.router.navigate([_this.accountService.getCustomId(), 'checkout'],navigationExtras)
                          } else {
                            _this.loggedIn = true;
                            _this.loading = false;
                            // this.isCartCreated = true;
                            _this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                            this.toastService.showSuccess("Item added to cart");
                            this.setAnalytics('addToCart')
                          }
                        })
                      }
                    } else {
                      _this.createCart().then(data => {
                        _this.cartId = data;
                        if (param) {
                          _this.router.navigate([_this.accountService.getCustomId(), 'checkout'],navigationExtras)
                        } else {
                          _this.loggedIn = true;
                          _this.loading = false;
                          // this.isCartCreated = true;
                          _this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                          this.toastService.showSuccess("Item added to cart");
                          this.setAnalytics('addToCart')
                        }
                      })
                    }

                  });
                  // this.addItemOptions(data, item, true)
                } else if (item?.templateSchemaId?.uid) {
                  let templateId = item?.templateSchemaId?.uid
                  if (templateId) {
                    let discountRef = this.dialogService.open(OrderTemplatesComponent, {
                      header: 'Item Details',
                      width: '100%',
                      contentStyle: { "max-height": "100%", "overflow": "auto" },
                      baseZIndex: 10000,
                      data: {
                        templateId: templateId,
                      },
                    });
                    discountRef.onClose.subscribe((result: any) => {
                      if (result) {
                        console.log("result", result)
                        item['templateSchema'] = result.templateSchema
                        item['templateSchemaValue'] = result.templateSchemaValue
                        _this.createCart(item).then(data => {
                          _this.cartId = data;
                          if (param) {
                            _this.router.navigate([_this.accountService.getCustomId(), 'checkout'],navigationExtras)
                          } else {
                            _this.loggedIn = true;
                            _this.loading = false;
                            // this.isCartCreated = true;
                            _this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                            this.toastService.showSuccess("Item added to cart");
                            this.setAnalytics('addToCart')
                          }
                        })
                      }
                      else {
                        // this.savSelection({ checked: false }, item);
                        this.loading = false;
                      }
                    });
                  }
                }
                else {
                  _this.createCart().then(data => {
                    _this.cartId = data;
                    if (param) {
                      _this.router.navigate([_this.accountService.getCustomId(), 'checkout'],navigationExtras)
                      _this.lStorageService.removeitemfromLocalStorage('cartData')
                        _this.lStorageService.removeitemfromLocalStorage('deliveryType')
                    } else {
                      _this.loggedIn = true;
                      _this.loading = false;
                      // this.isCartCreated = true;
                      _this.accountService.sendMessage({ ttype: 'refresh', value: 'refresh' });
                       this.toastService.showSuccess("Item added to cart");
                      this.setAnalytics('addToCart')
                    }
                  })
                }
              }
            },
            (error) => {
              this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            });
        } else {
          // this.loggedIn = false;
          // this.loading = false;
          // this.isLogin = true;   
         if (!this.isSessionCart && !param) {

          const cartData = this.lStorageService.getitemfromLocalStorage('cartData') || {
            HOME_DELIVERY: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 },
            STORE_PICKUP: { items: [], netTotal: 0, taxTotal: 0, netRate: 0 }
          };
          const deliveryType = this.itemDeliveryType == 'HOME_DELIVERY' ? 'HOME_DELIVERY' : 'STORE_PICKUP';
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
          // Recalculate totals for the current delivery type
          targetCart.netTotal = orderList.reduce((total, i) => total + i.netTotal, 0);
          targetCart.taxTotal = orderList.reduce((total, i) => total + i.totalTaxAmount, 0);
          targetCart.netRate = orderList.reduce((total, i) => total + i.netRate, 0);

          this.lStorageService.setitemonLocalStorage('cartData', cartData);
          const totalItems = cartData.HOME_DELIVERY.items.length + cartData.STORE_PICKUP.items.length;
          this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: totalItems });
          this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
         console.log('added')
          this.toastService.showSuccess("Item added to cart");
          this.setAnalytics('addToCart');
          this.loggedIn = true;
          this.loading = false;
        } else {
            this.loggedIn = false;
            this.loading = false;
            this.isLogin = true;
          }
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

  incrementQuantity() {
    this.quantity++;
  }

  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  // createCart(itemSchema?) {
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
  //        encId: item.encId,
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
  //     if (this.isPartnerLogin) {
  //       if (this.item?.templateSchema) {
  //         cartInfo.items = [
  //           {
  //             catalogItem: { encId: item.encId },
  //             quantity: this.quantity,
  //             templateSchema: itemSchema?.templateSchema,
  //             templateSchemaValue: itemSchema?.templateSchemaValue || {},
  //           }
  //         ];
  //       } else {
  //         cartInfo.items = [
  //           {
  //             catalogItem: { encId: item.encId },
  //             quantity: this.quantity,
  //           }
  //         ];
  //       }
        
  //       cartInfo['partner'] =
  //       {
  //         'id': this.loggedUser?.partner?.id
  //       }
  //       cartInfo['orderCategory'] = 'LAB_SYNC',
  //         cartInfo['orderSource'] = 'PARTNER'
  //     } else {
  //       cartInfo.items = [
  //         {
  //           catalogItem: { encId: item.encId },
  //           quantity: this.quantity,
  //         }
  //       ];
  //       cartInfo['orderCategory'] = 'SALES_ORDER',
  //         cartInfo['orderSource'] = 'PROVIDER_CONSUMER'
  //     }
  //   }
  //   return new Promise((resolve, reject) => {
  //     this.orderService.createCart(cartInfo).subscribe(
  //       (data) => {
  //         resolve(data);
  //       },
  //       (error) => {
  //         resolve(false);
  //         this.snackbarService.openSnackBar(error, { panelClass: 'snackbarerror' });
  //       }
  //     );
  //   });
  // }
  createCart(itemSchema?, deliveryTypeToUse?: 'HOME_DELIVERY' | 'STORE_PICKUP') {
  let cartInfo: any = {
    store: {
      encId: this.storeEncId
    },
    providerConsumer: {
      id: this.loggedUser.providerConsumer
    }
  };

  let item = this.virtualItem ? this.itemAttributes : this.item;

  const savedCartData = this.lStorageService.getitemfromLocalStorage('cartData') || {};
  const deliveryType = deliveryTypeToUse || this.itemDeliveryType;

  this.tempOrderList = savedCartData[deliveryType]?.items || [];

  let itemExists = false;
  this.tempOrderList = this.tempOrderList.map((cartItem) => {
    if (cartItem.encId === item.encId) {
      itemExists = true;
      return {
        ...cartItem,
        quantity: cartItem.quantity + this.quantity
      };
    }
    return cartItem;
  });

  if (!itemExists) {
    this.tempOrderList.push({
      encId: item.encId,
      quantity: this.quantity
    });
  }

  cartInfo.deliveryType = deliveryType;

  cartInfo.items = this.tempOrderList.map((cartItem) => {
    const base = {
      catalogItem: { encId: cartItem.encId },
      quantity: cartItem.quantity,
      deliveryType: deliveryType
    };
    if (this.isPartnerLogin && itemSchema?.templateSchema) {
      base['templateSchema'] = itemSchema.templateSchema;
      base['templateSchemaValue'] = itemSchema.templateSchemaValue || {};
    }
    return base;
  });

  if (this.isPartnerLogin) {
    cartInfo['partner'] = {
      id: this.loggedUser?.partner?.id
    };
    cartInfo['orderCategory'] = 'LAB_SYNC';
    cartInfo['orderSource'] = 'PARTNER';
  } else {
    cartInfo['orderCategory'] = 'SALES_ORDER';
    cartInfo['orderSource'] = 'PROVIDER_CONSUMER';
  }

  return new Promise((resolve, reject) => {
    this.orderService.createCart(cartInfo).subscribe(
      (data) => {
        resolve(data);
      },
      (error) => {
        resolve(false);
        this.snackbarService.openSnackBar(error, { panelClass: 'snackbarerror' });
      }
    );
  });
}

  viewItems(item) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        itemEncid: item.encId
      }
    }
    this.router.navigate([this.accountService.getCustomId(), 'details'], navigationExtras);
    setTimeout(() => {
      this.itemActionPerformed(item.encId);
    }, 100);
  }
  cartActionPerformed(input) {
    if (input.action == 'addToCart') {
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

  // Function to get truncated HTML content
  getTruncatedContent(htmlContent): string {
    const maxLength = 400; // Adjust this value to determine how much content to show

    // Create a temporary element to parse the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Initialize a variable to keep track of the length
    let length = 0;
    const result: string[] = [];

    // Traverse child nodes of the temporary div
    const traverseNodes = (node: Node) => {
      if (length >= maxLength) return; // Stop if the length exceeds maxLength

      if (node.nodeType === Node.TEXT_NODE) {
        // Handle text nodes
        const text = (node as Text).nodeValue || '';
        if (length + text.length > maxLength) {
          result.push(text.substring(0, maxLength - length) + '...');
          length = maxLength; // Stop adding more content
        } else {
          result.push(text);
          length += text.length;
        }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        // Handle element nodes
        const element = node as HTMLElement;
        const clonedElement = element.cloneNode(false) as HTMLElement; // Clone the element without its children

        // Append the cloned element to result
        result.push(clonedElement.outerHTML);
        traverseChildNodes(element.childNodes, clonedElement);
      }
    };

    const traverseChildNodes = (childNodes: NodeList, parent: HTMLElement) => {
      for (let i = 0; i < childNodes.length; i++) {
        if (length >= maxLength) return; // Stop if the length exceeds maxLength
        traverseNodes(childNodes[i]);
      }
    };

    traverseNodes(tempDiv);

    // Join the result and return
    return result.join('');
  }

  actionClicked(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else {

    }
  }
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
    console.log('itemData0', this.selectedValues)
    this.getAttributeItems(this.item)
  }

  getAttributeItems(itemData) {
    let spItemCode = itemData.spItem.spCode
    this.orderService.getAttributeItemsById(spItemCode, this.selectedValues).subscribe((itemData: any) => {
      if (itemData) {
        const validItems = itemData.filter(item => item.stockStatus !== 'OUT_OF_STOCK');
        this.itemAttributes = validItems[0];
        this.setVirtualItemDetails(this.itemAttributes)
      }
    });
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
