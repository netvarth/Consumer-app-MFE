import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonsConfig, ButtonsStrategy, ButtonType, Image, ModalGalleryConfig, ModalGalleryRef, ModalGalleryService, ModalLibConfig } from '@ks89/angular-modal-gallery';
import { ConfirmBoxComponent } from 'jaldee-framework/confirm';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { SubSink } from 'subsink';
import { AccountService } from '../../services/account-service';
import { AuthService } from '../../services/auth-service';
import { ConsumerService } from '../../services/consumer-service';

@Component({
  selector: 'app-catalog-landing-page',
  templateUrl: './catalog-landing-page.component.html',
  styleUrls: ['./catalog-landing-page.component.css']
})
export class CatalogLandingPageComponent implements OnInit, OnDestroy {
  catalogimage_list_popup: Image[];
  image_list_popup: Image[];
  catalogImage = '../../../../assets/images/order/catalogueimg.svg';
  accountEncId: any; // Account Enc Id / Custom Business Id
  catalogId: any;
  orderType = '';
  itemId: any;
  private subscriptions = new SubSink();
  bLogo: any;
  bNameStart: any;
  bNameEnd: any;
  orderItems: any = [];
  terminologiesjson: any = null;
  selectedLocation;
  bgCover: any;
  profileSettings: any;
  accountProperties: any;
  loading: boolean = false;
  customButtonsFontAwesomeConfig: ButtonsConfig = {
    visible: true,
    strategy: ButtonsStrategy.CUSTOM,
    buttons: [
      {
        className: 'inside close-image',
        type: ButtonType.CLOSE,
        ariaLabel: 'custom close aria label',
        title: 'Close',
        fontSize: '20px'
      }
    ]
  };
  cartItems: any = [];
  itemQuantity;
  cartItem;
  onlyVirtualItems = false;
  isPrice: boolean;
  isPromotionalpricePertage;
  isPromotionalpriceFixed;
  userType: any;
  from: any;
  activeCatalog: any;
  minQuantity: any;
  maxQuantity: any;
  orderItem: { type: string; minqty: any; maxqty: any; id: any; item: any; showpric: any; };
  businessjson: any = [];
  locationjson: any = [];
  showmoreSpec: any;
  showmoreDesc: any;
  spId_local_id: any;
  order_count: number;
  price: number;
  orderList: any = [];
  advance_amount: any;
  store_pickup: boolean;
  choose_type: string;
  sel_checkindate: any;
  nextAvailableTime: string;
  home_delivery: boolean;
  deliveryCharge: any;
  itemCount: any;
  screenWidth: number;
  small_device_display: boolean;
  homeView: any;
  serverDate: any;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  customId: any;
  constructor(
    private activatedRoute: ActivatedRoute,
    private accountService: AccountService,
    private router: Router,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private consumerService: ConsumerService,
    private modalGalleryService: ModalGalleryService,
    private dialog: MatDialog) {
    this.activatedRoute.paramMap.subscribe(
      (params: any) => {
        this.catalogId = params.get('catalogId');
        this.itemId = params.get('itemId');
      }
    )
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams['src']) {
        this.lStorageService.setitemonLocalStorage('source', qparams['src']);
        this.lStorageService.setitemonLocalStorage('reqFrom', 'CUSTOM_WEBSITE');
      }
    });
    this.image_list_popup = [];
    this.catalogimage_list_popup = [];
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 767) {
    } else {
      this.small_device_display = false;
    }
    if (this.screenWidth <= 1040) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }
  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    this.customId = this.accountService.getCustomId();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    if (this.accountConfig && this.accountConfig['mode']) {
      this.homeView = this.accountConfig['mode'];
      this.setItemDetails(this.catalogId, this.itemId, this.accountProfile.id);
    }
  }
  catlogArry() {
    if (this.lStorageService.getitemfromLocalStorage('order') !== null) {
      this.orderList = this.lStorageService.getitemfromLocalStorage('order');
    }
    this.getTotalItemAndPrice();
  }
  getTotalItemAndPrice() {
    this.price = 0;
    this.order_count = 0;
    for (const itemObj of this.orderList) {
      let item_price = itemObj.item.price;
      if (itemObj.item.showPromotionalPrice) {
        item_price = itemObj.item.promotionalPrice;
      }
      this.price = this.price + item_price;
      this.order_count = this.order_count + 1;
    }
  }
  isPhysicalItemsPresent() {
    let physical_item_present = true;
    const virtualItems = this.activeCatalog.catalogItem.filter(catalogItem => catalogItem.item.itemType === 'VIRTUAL')
    if (virtualItems.length > 0 && this.activeCatalog.catalogItem.length === virtualItems.length) {
      physical_item_present = false;
      this.onlyVirtualItems = true;
    }
    return physical_item_present;
  }
  checkVirtualOrPhysical() {
    // console.log('checkvirtualorphysical');
    let showCatalogItems = false;
    if (this.activeCatalog.nextAvailableDeliveryDetails || this.activeCatalog.nextAvailablePickUpDetails) {
      showCatalogItems = true;
    }

    if (!this.isPhysicalItemsPresent()) {
      showCatalogItems = true;
    }
    return showCatalogItems
  }
  setItemDetails(catalogId, itemId, accountId) {
    this.cartItems = [];
    this.orderItems = [];
    const orderItems = [];
    if (this.lStorageService.getitemfromLocalStorage('order_spId') && this.lStorageService.getitemfromLocalStorage('order_spId') == this.accountProfile.id) {
      this.cartItems = this.lStorageService.getitemfromLocalStorage('order');
    } else {
      this.lStorageService.removeitemfromLocalStorage('order');
      this.lStorageService.removeitemfromLocalStorage('order_sp');
      this.lStorageService.removeitemfromLocalStorage('order_spId');
    }

    this.subscriptions.sink = this.consumerService.getConsumerCatalogs(accountId).subscribe(
      (catalogs: any) => {
        //  console.log("catalogssss :",catalogs)
        if (catalogs.length > 0) {
          this.activeCatalog = catalogs[0];
          this.orderType = this.activeCatalog.orderType;
          if (this.activeCatalog.catalogImages && this.activeCatalog.catalogImages[0]) {
            this.catalogImage = this.activeCatalog.catalogImages[0].url;
            this.catalogimage_list_popup = [];
            const imgobj = new Image(0,
              { // modal
                img: this.activeCatalog.catalogImages[0].url,
                description: ''
              });
            this.catalogimage_list_popup.push(imgobj);
          }
          this.catlogArry();


          this.advance_amount = this.activeCatalog.advanceAmount;
          if (this.activeCatalog.pickUp) {
            if (this.activeCatalog.pickUp.orderPickUp && this.activeCatalog.nextAvailablePickUpDetails) {
              this.store_pickup = true;
              this.choose_type = 'store';
              this.sel_checkindate = this.activeCatalog.nextAvailablePickUpDetails.availableDate;
              this.nextAvailableTime = this.activeCatalog.nextAvailablePickUpDetails.timeSlots[0]['sTime'] + ' - ' + this.activeCatalog.nextAvailablePickUpDetails.timeSlots[0]['eTime'];
            }
          }
          if (this.activeCatalog.homeDelivery) {
            if (this.activeCatalog.homeDelivery.homeDelivery && this.activeCatalog.nextAvailableDeliveryDetails) {
              this.home_delivery = true;

              if (!this.store_pickup) {
                this.choose_type = 'home';
                this.deliveryCharge = this.activeCatalog.homeDelivery.deliveryCharge;
                this.sel_checkindate = this.activeCatalog.nextAvailableDeliveryDetails.availableDate;
                this.nextAvailableTime = this.activeCatalog.nextAvailableDeliveryDetails.timeSlots[0]['sTime'] + ' - ' + this.activeCatalog.nextAvailableDeliveryDetails.timeSlots[0]['eTime'];
              }
            }
          }
          this.consumerService.setOrderDetails(this.activeCatalog);
          if (this.activeCatalog && this.activeCatalog.catalogItem) {
            for (let itemIndex = 0; itemIndex < this.activeCatalog.catalogItem.length; itemIndex++) {
              const catalogItemId = this.activeCatalog.catalogItem[itemIndex].id;
              const minQty = this.activeCatalog.catalogItem[itemIndex].minQuantity;
              const maxQty = this.activeCatalog.catalogItem[itemIndex].maxQuantity;
              const showpric = this.activeCatalog.showPrice;
              if (this.activeCatalog.catalogItem[itemIndex].item.isShowOnLandingpage) {
                orderItems.push({ 'type': 'item', 'minqty': minQty, 'maxqty': maxQty, 'id': catalogItemId, 'item': this.activeCatalog.catalogItem[itemIndex].item, 'showpric': showpric });
                this.itemCount++;
              }
            }
          }
          this.orderItems = orderItems;
        }
        this.activeCatalog = this.consumerService.getCatalogById(catalogs, catalogId);
        let catalogItem = this.consumerService.getCatalogItemById(this.activeCatalog, itemId);
        const showpric = this.activeCatalog.showPrice;
        if (catalogItem && catalogItem.item) {
          this.cartItem = catalogItem.item;
        }
        if (catalogItem && catalogItem.minQuantity) {
          this.minQuantity = catalogItem.minQuantity;
        }
        if (catalogItem && catalogItem.maxQuantity) {
          this.maxQuantity = catalogItem.maxQuantity;
        }
        // this.minQuantity = catalogItem.minQuantity;
        // this.maxQuantity = catalogItem.maxQuantity;
        if (catalogItem && catalogItem.item) {
          this.orderItem = { 'type': 'item', 'minqty': catalogItem.minQuantity, 'maxqty': catalogItem.maxQuantity, 'id': catalogItem.id, 'item': catalogItem.item, 'showpric': showpric };
        }
        const businessObject = {
          'bname': this.accountProfile.businessName,
          'blocation': this.accountProfile.baseLocation.place,
        };
        this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
        this.itemQuantity = this.consumerService.getItemQty(this.cartItems, itemId);
        if (this.cartItem && this.cartItem.showPromotionalPrice) {
          if (this.cartItem.promotionalPriceType === 'FIXED') {
            this.isPromotionalpriceFixed = true;
          } else {
            this.isPromotionalpricePertage = true;
          }
        } else {
          this.isPrice = true;
        }
        if (this.activeCatalog.catalogType == 'submission') {
          this.loading = true;
          if (this.cartItems.length == 0) {
            this.addToCart();
          }
          this.checkout();
        }
      }

    )

  }
  getConfirmation() {
    let can_remove = false;
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'confirmationmainclass'],
      disableClose: true,
      data: {
        'message': '  All added items in your cart for different Provider will be removed ! '
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        can_remove = true;
        this.cartItems = [];
        this.lStorageService.removeitemfromLocalStorage('order_sp');
        this.lStorageService.removeitemfromLocalStorage('chosenDateTime');
        this.lStorageService.removeitemfromLocalStorage('order_spId');
        this.lStorageService.removeitemfromLocalStorage('order');
        return true;
      } else {
        can_remove = false;

      }
    });
    return can_remove;
  }
  // OrderItem add to cart
  addToCart() {
    const spId = this.lStorageService.getitemfromLocalStorage('order_spId');
    if (spId === null) {
      this.lStorageService.setitemonLocalStorage('order_spId', this.accountProfile.id);
      this.cartItems.push(this.orderItem);
      this.lStorageService.setitemonLocalStorage('order', this.cartItems);
      this.itemQuantity = this.consumerService.getItemQty(this.cartItems, this.itemId);

    } else {
      if (this.cartItems !== null && this.cartItems.length !== 0) {
        if (spId !== this.accountProfile.id) {
          if (this.getConfirmation()) {
            this.lStorageService.removeitemfromLocalStorage('order');
          }
        } else {
          this.cartItems.push(this.orderItem);
          this.lStorageService.setitemonLocalStorage('order', this.cartItems);
          this.itemQuantity = this.consumerService.getItemQty(this.cartItems, this.itemId);
        }
      } else {
        this.cartItems.push(this.orderItem);
        this.lStorageService.setitemonLocalStorage('order', this.cartItems);

        this.itemQuantity = this.consumerService.getItemQty(this.cartItems, this.itemId);
      }
    }
  }
  removeFromCart() {
    if (this.cartItems.length > 0) {
      this.cartItems.splice(0, 1);
      this.lStorageService.setitemonLocalStorage('order', this.cartItems);
    }
    this.itemQuantity = this.consumerService.getItemQty(this.cartItems, this.itemId);
  }
  checkoutItems() {
    const _this = this;
    this.userType = '';
    if (this.lStorageService.getitemfromLocalStorage('isBusinessOwner')) {
      this.userType = (this.lStorageService.getitemfromLocalStorage('isBusinessOwner') === 'true') ? 'provider' : 'consumer';
    }
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'blocation': this.accountProfile.baseLocation.place,
      'logo': this.accountProfile.logo.url
    };
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    let cartUrl = this.customId + '/order/shoppingcart';
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.router.navigateByUrl(cartUrl);
        } else {
          _this.lStorageService.setitemonLocalStorage('target', cartUrl);
          _this.router.navigate([_this.customId, 'login']);
        }
      }
    )
  }
  itemDetails(item) {
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'blocation': this.accountProfile.baseLocation.place,
      'logo': this.accountProfile.logo.url
    };
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    this.router.navigate([this.customId, 'catalog', this.catalogId, 'item', item.id]);
  }
  checkout() {
    const _this = this;
    this.userType = '';
    if (!this.itemId) {
      const businessObject = {
        'bname': this.accountProfile.businessName,
        'blocation': this.accountProfile.baseLocation.place,
        'logo': this.accountProfile.logo.url
      };
      this.lStorageService.setitemonLocalStorage('order', this.orderList);
      this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    }
    else {
      this.lStorageService.setitemonLocalStorage('order', this.cartItems);
    }
    let cartUrl = this.customId + '/order/shoppingcart';
    console.log("cartUrl :", cartUrl);
    if (this.activeCatalog.catalogType == 'submission') {
      cartUrl += '?source=paper&catalog_Id=' + this.catalogId;
    }
    console.log("cartUrl :", cartUrl);
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.router.navigateByUrl(cartUrl);
        } else {
          _this.lStorageService.setitemonLocalStorage('target', cartUrl);
          _this.router.navigate([_this.customId, 'login']);
        }
      }
    )
  }
  shoppinglistupload() {
    const _this = this;
    const chosenDateTime = {
      delivery_type: this.choose_type,
      catlog_id: this.activeCatalog.id,
      nextAvailableTime: this.nextAvailableTime,
      order_date: this.sel_checkindate,
      advance_amount: this.advance_amount,
      account_id: this.accountProfile.id
    };
    console.log("shoppinglistupload :", chosenDateTime)
    this.lStorageService.setitemonLocalStorage('chosenDateTime', chosenDateTime);
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'logo': this.accountProfile.logo.url
    };
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    let cartUrl = this.customId + '/order/shoppingcart/checkout';
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.router.navigateByUrl(cartUrl);
        } else {
          _this.lStorageService.setitemonLocalStorage('target', cartUrl);
          _this.router.navigate([_this.customId, 'login']);
        }
      }
    )
  }
  handlesearchClick() {
  }
  showOrderFooter() {
    let showFooter = false;
    this.spId_local_id = this.lStorageService.getitemfromLocalStorage('order_spId');
    if (this.spId_local_id !== null) {
      if (this.orderList !== null && this.orderList.length !== 0) {
        if (this.spId_local_id !== this.accountProfile.id) {
          showFooter = false;
        } else {
          showFooter = true;
        }
      }
    }
    return showFooter;
  }
  cardClicked(actionObj) {
    console.log('entering into business page', actionObj);
    if (actionObj['type'] === 'item') {
      if (actionObj['action'] === 'view') {
        this.itemDetails(actionObj['service']);
      } else if (actionObj['action'] === 'add') {
        this.incrementItem(actionObj['service']);
      } else if (actionObj['action'] === 'remove') {
        this.decrementItem(actionObj['service']);
      }
    }
  }
  addToCartItems(itemObj) {
    //  const item = itemObj.item;
    const spId = this.lStorageService.getitemfromLocalStorage('order_spId');
    if (spId === null) {
      this.orderList = [];
      this.lStorageService.setitemonLocalStorage('order_spId', this.accountProfile.id);
      this.orderList.push(itemObj);
      this.lStorageService.setitemonLocalStorage('order', this.orderList);
      this.getTotalItemAndPrice();
      this.getItemQty(itemObj);
    } else {
      if (this.orderList !== null && this.orderList.length !== 0) {
        if (spId !== this.accountProfile.id) {
          if (this.getConfirmation()) {
            this.lStorageService.removeitemfromLocalStorage('order');
          }
        } else {
          this.orderList.push(itemObj);
          this.lStorageService.setitemonLocalStorage('order', this.orderList);
          this.getTotalItemAndPrice();
          this.getItemQty(itemObj);
        }
      } else {
        this.orderList.push(itemObj);
        this.lStorageService.setitemonLocalStorage('order', this.orderList);
        this.getTotalItemAndPrice();
        this.getItemQty(itemObj);
      }
    }
  }
  incrementItem(item) {
    this.addToCartItems(item);
  }
  decrementItem(item) {
    this.removeFromCartItem(item);
  }
  getItemQty(itemObj) {
    let qty = 0;
    if (this.orderList !== null && this.orderList.filter(i => i.item.itemId === itemObj.item.itemId)) {
      qty = this.orderList.filter(i => i.item.itemId === itemObj.item.itemId).length;
    }
    return qty;
  }
  removeFromCartItem(itemObj) {
    const item = itemObj.item;

    for (const i in this.orderList) {
      if (this.orderList[i].item.itemId === item.itemId) {
        this.orderList.splice(i, 1);
        if (this.orderList.length > 0 && this.orderList !== null) {
          this.lStorageService.setitemonLocalStorage('order', this.orderList);
        } else {
          this.lStorageService.removeitemfromLocalStorage('order_sp');
          this.lStorageService.removeitemfromLocalStorage('chosenDateTime');
          this.lStorageService.removeitemfromLocalStorage('order_spId');
          this.lStorageService.removeitemfromLocalStorage('order');
        }
        break;
      }
    }
    this.getTotalItemAndPrice();
  }
  private getCurrentIndexCustomLayout(image: Image, images: Image[]): number {
    return image ? images.indexOf(image) : -1;
  }
  openImageModalRow(image: Image) {
    const index: number = this.getCurrentIndexCustomLayout(image, this.catalogimage_list_popup);
    this.openModal(1, index, this.customButtonsFontAwesomeConfig);
  }
  openModal(id: number, imageIndex: number, buttonsConfig: ButtonsConfig): void {
    const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
      id: id,
      images: this.catalogimage_list_popup,
      currentImage: this.catalogimage_list_popup[imageIndex],
      libConfig: {
        buttonsConfig: buttonsConfig,
        // 'downloadable: true' is required to enable download button (if visible)
        currentImageConfig: {
          downloadable: true
        }
      } as ModalLibConfig
    } as ModalGalleryConfig) as ModalGalleryRef;
  }
}
