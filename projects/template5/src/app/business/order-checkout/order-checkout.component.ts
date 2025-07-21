import { ChangeDetectorRef, Component, NgZone, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { ConsumerService } from 'projects/jaldee-provider-consumer-app/src/app/services/consumer-service';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { CouponsComponent } from '../coupons/coupons.component';
import { AccountService } from '../../services/account-service';
import { OrderService } from '../../services/order.service';
import { OrderTemplatesComponent } from '../order-templates/order-templates.component';
import { DialogService } from 'primeng/dynamicdialog';

@Component({
  selector: 'app-order-checkout',
  templateUrl: './order-checkout.component.html',
  styleUrls: ['./order-checkout.component.scss']
})
export class OrderCheckoutComponent implements OnInit {
  selectedCoupons: any = [];
  s3CouponsList: any = { JC: [], OWN: [] };
  coupondialogRef: any;
  isCouponsAvailable: boolean = false;
  deliveryAddress: any;
  selectedDelivery;
  storeTypes: any = [];
  homeDelivery;
  storePickup;
  loadingPaytm = false;
  ingredient!: string;
  status: any = false;
  confirmBtn = false;
  loggedUser: any;
  providerConsumerId: any;
  cartData: any = [];
  orderSummary: any = false;
  cartId: any;
  selected_payment_mode: any;
  isInternatonal: boolean;
  deliveryType: any;
  deliveryOption: any = false;
  storeChecked: any = false;
  items: any = [];
  isInternational: boolean;
  paymentMode: any;
  paytmEnabled: boolean;
  razorpayEnabled: boolean;
  interNationalPaid: boolean;
  convenientPaymentModes: any = [];
  convenientFeeObj: any;
  convenientFee: any;
  gatewayFee: any;
  paymentmodes: any;
  isPayment: boolean;
  indian_payment_modes: any;
  non_indian_modes: any;
  shownonIndianModes: boolean;
  paymentProfileId;
  account: any;
  accountProfile: any;
  accountId: any;
  totalamountPay: any;
  orderData: any = [];
  pGateway: any;
  orderDetails: any = [];
  invoiceDetailsById: any = [];
  checkOutId: any;
  invId: any;
  postData = {}
  selectedCategory: any = null;
  @ViewChild('consumer_order') paytmview;

  ispaymentDone = false;
  events: any;
  index: any;

  type: any;
  config: any;
  theme: any;
  target: any;
  contactData: any;
  storeData: boolean = false;
  questionAnswers: any;
  amountWithAllCharges: any;
  convenientFeeTax: any;
  roundedValue: any = 0;
  isPartnerLogin: boolean;
  selectedDeliveryType: any;

  constructor(

    private router: Router,
    private accountService: AccountService,
    private activatedRoute: ActivatedRoute,
    private groupService: GroupStorageService,
    private orderService: OrderService,
    private cdRef: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private consumerService: ConsumerService,
    private wordProcessor: WordProcessor,
    private razorpayService: RazorpayService,
    private paytmService: PaytmService,
    private location: Location,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private lStorageService: LocalStorageService,
    private dialogService: DialogService
  ) {
    if (this.lStorageService.getitemfromLocalStorage('partner')) {
      this.isPartnerLogin = true;
      console.log("this.isPartnerLogin", this.isPartnerLogin)
    }
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.loggedUser = this.groupService.getitemFromGroupStorage('ynw-user');
    console.log("this.loggedUser", this.loggedUser)
    this.providerConsumerId = this.loggedUser.providerConsumer;
    this.getCart()
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['status']) {
        this.status = true;
      } if (qparams && qparams['target']) {
        this.target = qparams['target']
        if (this.target) {
          let deliveryAddress;
          deliveryAddress = this.lStorageService.getitemfromLocalStorage('deliveryAddress');
          this.deliveryAddress = deliveryAddress;
        }
        this.orderSummary = true;
        this.setTimeline()
      }
      if (qparams && qparams['deliveryType']) {
        this.selectedDeliveryType = qparams['deliveryType'];
      }
    })
    this.setTimeline();
  }

  ngOnInit(): void {
    this.config = this.accountService.getTemplateJson();
    if (this.config.theme) {
      this.theme = this.config.theme;
      console.log("theme", this.theme)
    }
  }

  setTimeline() {
    this.events = [
      { status: this.deliveryType == 'HOME_DELIVERY' ? 'Delivery Address' : 'Contact Details', condition: this.deliveryType },
      { status: 'Order Summary', condition: this.orderSummary },
      { status: 'Payment', condition: this.ispaymentDone }
    ]
  }

  getMarkerImage(event: any): string {
    if (event.condition) {
      return 'assets/images/rx-order/items/success.svg';
    } else {
      return 'assets/images/rx-order/items/pending.svg';
    }
  }
  addressSelected(deliveryAddress) {
    console.log("deliveryAddress", deliveryAddress)
    this.deliveryAddress = deliveryAddress;
    this.lStorageService.setitemonLocalStorage('deliveryAddress', deliveryAddress);
    this.orderSummary = true;
    this.setTimeline();
  }

  goBack() {
    console.log("this.orderSummary", this.orderSummary)
    console.log("this.ispaymentDone", this.ispaymentDone)
    console.log("this.storeData", this.storeData)
    if (!this.orderSummary && !this.ispaymentDone) {
      this.location.back();
    } else if ((this.orderSummary && !this.ispaymentDone && this.deliveryType == 'STORE_PICKUP') || (this.orderSummary && !this.ispaymentDone && this.deliveryType == 'HOME_DELIVERY')) {
      this.location.back();
    } else {
      this.orderSummary = false;
      this.ispaymentDone = false;
      this.setTimeline();
    }
  }

  togglepaymentMode() {
    this.shownonIndianModes = !this.shownonIndianModes;
    this.selected_payment_mode = null;
  }

  indian_payment_mode_onchange(event) {
    this.selected_payment_mode = event.value;
    console.log("this.selected_payment_mode", this.selected_payment_mode)
    this.isInternatonal = false;
    this.convenientPaymentModes.map((res: any) => {
      this.convenientFeeObj = {}
      if (res.isInternational === false) {
        this.convenientFeeObj = res;
        if (this.selected_payment_mode === res.mode) {
          this.gatewayFee = this.convenientFeeObj.totalGatewayFee;
          this.convenientFee = this.convenientFeeObj.convenienceFee;
          this.convenientFeeTax = this.convenientFeeObj.consumerGatewayFeeTax;
          this.amountWithAllCharges = this.convenientFeeObj.amountWithAllCharges;
          console.log("convenientFee for Indian:", this.convenientFee, res.mode, this.gatewayFee)
        }
      }
    })
  }


  non_indian_modes_onchange(event) {
    this.selected_payment_mode = event.value;
    console.log("this.selected_payment_mode", this.selected_payment_mode)
    this.isInternatonal = true;
    this.convenientPaymentModes.map((res: any) => {
      this.convenientFeeObj = {}
      if (res.isInternational === true) {
        this.convenientFeeObj = res;
        if (this.selected_payment_mode === res.mode) {
          this.gatewayFee = this.convenientFeeObj.totalGatewayFee;
          this.convenientFee = this.convenientFeeObj.convenienceFee;
          this.convenientFeeTax = this.convenientFeeObj.consumerGatewayFeeTax;
          this.amountWithAllCharges = this.convenientFeeObj.amountWithAllCharges;
          console.log("convenientFee for Indian:", this.convenientFee, res.mode, this.gatewayFee)
        }
      }
    })
  }

  getPaymentModes() {
    this.consumerService.getPaymentModesofProvider(this.accountId, 0, 'prePayment')
      .subscribe(
        data => {
          this.paymentmodes = data[0];
          this.isPayment = true;
          let convienientPaymentObj = {}
          convienientPaymentObj = {
            "profileId": this.paymentmodes.profileId,
            "amount": this.orderData.netRate
          }
          this.consumerService.getConvenientFeeOfProvider(this.accountId, convienientPaymentObj).subscribe((data: any) => {
            console.log("Convenient response :", data)
            this.convenientPaymentModes = data;
            if (this.convenientPaymentModes) {
              this.convenientPaymentModes.map((res: any) => {
                this.convenientFeeObj = {}
                if (res) {
                  this.convenientFeeObj = res;
                  console.log("payment convenientFee for Indian:", this.convenientFee, res.mode, this.gatewayFee)
                }
              })
            }
          })
          console.log("isConvenienceFee paymentsss:", this.paymentmodes)
          if (this.paymentmodes && this.paymentmodes.indiaPay) {
            this.indian_payment_modes = this.paymentmodes.indiaBankInfo;
          }
          if (this.paymentmodes && this.paymentmodes.internationalPay) {
            this.non_indian_modes = this.paymentmodes.internationalBankInfo;
          }
          if (this.paymentmodes && !this.paymentmodes.indiaPay && this.paymentmodes.internationalPay) {
            this.shownonIndianModes = true;
          } else {
            this.shownonIndianModes = false;
          }
        }, error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }

  getAmountToPay(paymentDetails) {
    this.totalamountPay = paymentDetails.advanceAmount;
    return this.totalamountPay;
  }

  getCart() {
    this.orderService.getCart(this.providerConsumerId).subscribe(data => {
      if (data) {
        this.cartData = data;
        this.cartId = this.cartData.uid;
        console.log('this.cartData1113', this.selectedDeliveryType)
        if (this.selectedDeliveryType) {
          this.cartData = this.cartData.filter(item => item.deliveryType === this.selectedDeliveryType);
          this.cartData = this.cartData[0]
        }
        console.log('this.cartData1112', this.cartData)
        this.items = this.cartData.items;
        this.accountService.sendMessage({ ttype: 'cartChanged', value: this.items?.length })
        this.accountService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
        this.deliveryType = this.cartData.deliveryType;
        if (this.cartData && this.cartData.items && this.cartData.items?.length > 0) {
          this.items = this.cartData.items;
          this.cartId = this.cartData.uid;
          for (let item = 0; item < this.items.length; item++) {
            const currentItem = this.items[item];
            if (currentItem && currentItem.catalog && currentItem.catalog.id) {
              let catalogID = currentItem.catalog.id;
              this.getCoupons(catalogID);
              break;
            }
          }
        }
        if ((this.deliveryType == 'STORE_PICKUP') || (this.deliveryType == 'HOME_DELIVERY' && this.isPartnerLogin)) {
          this.contactData = this.groupService.getitemFromGroupStorage('ynw-user');
          this.storeData = true;
          console.log("this.contactData", this.contactData)
          this.orderSummary = true;
          this.setTimeline();
        }
        this.setTimeline();
        // this.deliveryOption = 'homeDelivery';
      }
    }, error => {
      this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    });
  }

  confirm() {
    console.log("this.contactData", this.contactData)
    if (this.isPartnerLogin && this.deliveryType == 'HOME_DELIVERY') {
      this.deliveryAddress = {
        "phoneNumber": this.contactData.partner.partnerMobile || '',
        "firstName": this.contactData.partner.partnerName || '',
        "lastName": this.contactData.partner.lastName || '',
        "email": this.contactData.partner.email || '',
        "address": this.contactData.partner.partnerAddress || '',
        "city": this.contactData.partner.city || '',
        "state": this.contactData.partner.state || '',
        "country": this.contactData.partner.country || '',
        "postalCode": this.contactData.partner.postalCode || '',
        "landMark": this.contactData.partner.landMark || '',
        "countryCode": this.contactData.partner.countryCode || '',
      };
    }
    let deliveryAddress = {
      "homeDeliveryAddress": this.deliveryAddress
    }
    this.orderService.checkoutCartItems(this.cartId, deliveryAddress).subscribe(checkOut => {
      this.checkOutId = checkOut;
      this.setTimeline();
      if (this.checkOutId) {
        this.questionAnswers = this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
        if (this.questionAnswers && this.questionAnswers.answers) {
          this.submitQnr(this.checkOutId);
        }

        this.lStorageService.removeitemfromLocalStorage('deliveryAddress');

        this.accountService.sendMessage({ ttype: 'cartChanged', value: 0 });
        this.confirmBtn = true;
        this.orderService.getOrderByUid(this.checkOutId).subscribe((orderInfo) => {
          this.orderData = orderInfo;
          if (this.orderData) {
            this.getPaymentModes();
          }
          if (this.orderData.invoiceGenerated && this.orderData.orderStatus == 'ORDER_PREPAYMENT_PENDING') {
            this.orderService.getInvoiceByOrderUid(this.accountId, this.orderData.uid).subscribe(
              (invoiceInfo) => {
                this.invoiceDetailsById = invoiceInfo;
                if (this.invoiceDetailsById && this.invoiceDetailsById[0].uid) {
                  this.invId = this.invoiceDetailsById[0].uid;
                }
                if (this.invoiceDetailsById && this.invoiceDetailsById[0].roundedValue) {
                  this.roundedValue = this.invoiceDetailsById[0].roundedValue;
                }
              }, error => {
                this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
              }
            )
          } else {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                uuid: this.checkOutId,
                nav: 0
              }
            };
            this.router.navigate([this.accountService.getCustomId(), 'orderdetails'], navigationExtras)
          }
        }, (error) => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });

        })
      }
      this.lStorageService.removeitemfromLocalStorage('serviceOPtionInfo');
      this.lStorageService.removeitemfromLocalStorage('cartData')
      this.lStorageService.removeitemfromLocalStorage('deliveryType')
    }, error => {
      this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    })
  }
  submitQnr(uuid) {
    const _this = this;
    // const dataToSend: FormData = new FormData();
    let questionAnswer: any;
    this.questionAnswers = this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
    if (this.questionAnswers && this.questionAnswers.answers) {
      questionAnswer = this.questionAnswers.answers;
    }
    // const blobpost_Data = new Blob([JSON.stringify(questionAnswer)], { type: 'application/json' });
    // dataToSend.append('question', blobpost_Data);
    _this.orderService.submitQnrOrder(questionAnswer, uuid).subscribe((data: any) => {
    }, (error) => {
      _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    });
  }
  pay() {
    if (this.orderData.orderStatus == 'ORDER_PREPAYMENT_PENDING' && this.selected_payment_mode) {
      this.makePayment();
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          uuid: this.checkOutId,
          nav: 0
        }
      };
      this.router.navigate([this.accountService.getCustomId(), 'orderdetails'], navigationExtras)
    }
  }

  finishCheckout(status) {
    console.log("Finish Checkout", status);
    if (status) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          uuid: this.checkOutId,
          nav: 0
        }
      };
      this.accountService.sendMessage({ ttype: 'cartChanged', value: 0 });
      this.ngZone.run(() => this.router.navigate([this.accountService.getCustomId(), 'orderdetails'], navigationExtras));
    } else {
      this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
      this.ngZone.run(() => this.router.navigate([this.accountService.getCustomId(), 'checkout']));

    }
  }

  closeloading() {
    this.loadingPaytm = false;
    this.ispaymentDone = false;
    this.setTimeline();
    this.cdRef.detectChanges();
  }
  transactionCompleted(response, payload, accountId) {
    if (response.SRC) {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.razorpayService.updateRazorPay(payload, accountId).then((data) => {
          if (data) {
            this.setAnalytics('payment_completed');
            this.finishCheckout(true);
          }
        })
      } else if (response.STATUS == 'TXN_FAILURE') {
        if (response.error && response.error.description) {
          this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
        }
        this.finishCheckout(false);
      }
    } else {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.paytmService.updatePaytmPay(payload, accountId).then((data) => {
          if (data) {
            this.setAnalytics('payment_completed');
            this.finishCheckout(true);
          }
        })
      } else if (response.STATUS == 'TXN_FAILURE') {
        this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
        this.finishCheckout(false);
      }
    }
  }
  makePayment() {
    this.orderDetails = {
      'amount': this.orderData.amountDue,
      'paymentMode': this.selected_payment_mode,
      'uuid': this.invId,
      'convenientFee': this.gatewayFee || 0,
      'convenientFeeTax': this.convenientFeeTax || 0,
      'jaldeeConvenienceFee': this.convenientFee || 0,
      'accountId': this.accountId,
      'purpose': 'prePayment',
      'mockResponse': true,
      'isInternational': this.isInternatonal,
      'custId': this.providerConsumerId
    };
    this.ispaymentDone = true;
    this.setTimeline();
    this.orderService.consumerSoPayment(this.orderDetails).subscribe((pData: any) => {
      this.pGateway = pData.paymentGateway;
      this.setAnalytics('payment_initiated');
      if (this.pGateway === 'RAZORPAY') {
        this.paywithRazorpay(pData);
      } else {
        if (pData['response']) {
          this.payWithPayTM(pData, this.accountId);
        } else {
          this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'), { 'panelClass': 'snackbarerror' });
        }
      }
    }, error => {
      this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
    });
  }
  setAnalytics(source?) {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      storeId: this.lStorageService.getitemfromLocalStorage('storeId')
    }
    if (source === 'payment_initiated') {
      analytics['metricId'] = 551;
    } else {
      analytics['metricId'] = 552;
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }
  paywithRazorpay(pData: any) {
    pData.paymentMode = this.selected_payment_mode;
    this.razorpayService.initializePayment(pData, this.accountId, this);
  }

  payWithPayTM(pData: any, accountId: any) {
    this.loadingPaytm = true;
    pData.paymentMode = this.selected_payment_mode;
    this.paytmService.initializePayment(pData, accountId, this);
  }

  editOrder() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        target: 'checkout'
      }
    }
    this.router.navigate([this.accountService.getCustomId(), 'cart'], navigationExtras);
  }

  getCoupons(catalogId) {
    this.orderService.getSoCoupons(catalogId).subscribe(coupons => {
      if (coupons) {
        this.s3CouponsList.OWN = coupons;
        console.log("this.s3CouponsList.OWN", this.s3CouponsList.OWN)
        if (this.s3CouponsList.OWN.length > 0) {
          this.isCouponsAvailable = true;
        }
      }
    },
      error => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      })
  }

  couponActionPerformed(action) {
    console.log("action", action['value'])
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

  applyCoupon() {
    let postData = {}
    postData['couponCode'] = this.selectedCoupons;
    console.log("postData", postData)
    this.orderService.applyCoupon(this.cartId, postData).subscribe(couponData => {
      if (couponData) {
        this.snackbarService.openSnackBar('Coupon applied successfully', { 'panelClass': 'snackbarnormal' });
        this.getCart();
      }
    },
      error => {
        // this.loading = false;
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      })
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

  removeOrderCoupon(coupon) {
    const data = {};
    data['couponCode'] = coupon.couponCode;
    this.orderService.removeCoupon(this.cartId, data)
      .subscribe((data) => {
        this.snackbarService.openSnackBar('Coupon removed successfully', { 'panelClass': 'snackbarnormal' });
        this.getCart();
      });
  }

  getAttributeValues(attributes: any): string[] {
    return Object.values(attributes);
  }


  itemSchemaView(item) {
    let templateId = ''
    // const selectedItem = this.itemList.filter((items) => items.catalogItem.encId === item.catalogItem.encId);
    console.log('item1', item)
    let discountRef = this.dialogService.open(OrderTemplatesComponent, {
      header: 'Item Details',
      width: '100%',
      contentStyle: { overflow: 'auto' },
      baseZIndex: 10000,
      data: {
        templateData: item,
      },
    });
    discountRef.onClose.subscribe((result: any) => {
      if (result) {

      }
    });
  }

  isObjectNotEmpty(obj: any): boolean {
    return obj && Object.keys(obj).length > 0;
  }
}

