import { Location } from '@angular/common';
import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import {
  ConsumerService,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  OrderService,
  PaytmService,
  RazorpayService,
  SharedService,
  SubscriptionService,
  ToastService,
  WordProcessor
} from 'jconsumer-shared';
import { CouponsComponent } from '../../shared/coupons/coupons.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnInit {
  deliveryAddress: any;
  selectedCoupons: any = [];
  s3CouponsList: any = { JC: [], OWN: [] }; 
  coupondialogRef: any;
  isCouponsAvailable: boolean = false;
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
  cdnPath: string = '';
  accountProfile: any;
  account: any;
  roundedValue: any = 0;
  selectedDeliveryType: any;
  constructor(
    private router: Router,
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private groupService: GroupStorageService,
    private orderService: OrderService,
    private cdRef: ChangeDetectorRef,
    private toastService: ToastService,
    private consumerService: ConsumerService,
    private wordProcessor: WordProcessor,
    private razorpayService: RazorpayService,
    private paytmService: PaytmService,
    private location: Location,
    private subscriptionService: SubscriptionService,
    private dialog: MatDialog,
    private lStorageService: LocalStorageService,
    private errorService: ErrorMessagingService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.accountId = this.sharedService.getAccountID();
    this.loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
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
    this.config = this.sharedService.getTemplateJSON();
    if (this.config?.theme) {
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
      return (this.cdnPath +'assets/images/rx-order/items/success.svg');
    } else {
      return (this.cdnPath + 'assets/images/rx-order/items/pending.svg');
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
    } else if (this.orderSummary && !this.ispaymentDone && this.deliveryType == 'STORE_PICKUP') {
      this.location.back();
    }
    else {
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
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
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
         console.log('this.cartData1113',this.selectedDeliveryType)
        if(this.selectedDeliveryType){
           this.cartData = this.cartData.filter(item => item.deliveryType === this.selectedDeliveryType);
          this.cartData =this.cartData[0]
        }
        console.log('this.cartData1112',this.cartData)
        this.items = this.cartData.items;
        this.deliveryType = this.cartData.deliveryType;
        this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: this.items.length })
        this.subscriptionService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
        this.deliveryType = this.cartData.deliveryType;
        if (this.cartData && this.cartData.items && this.cartData.items.length > 0) {
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
        if (this.deliveryType == 'STORE_PICKUP') {
          this.contactData = this.groupService.getitemFromGroupStorage('jld_scon');
          this.storeData = true;
          console.log("this.contactData", this.contactData)
          this.orderSummary = true;
          this.setTimeline();
        }
        this.setTimeline();
        // this.deliveryOption = 'homeDelivery';
      }
    }, error => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    });
  }

  confirm() {
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

        this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: 0 });
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
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
              }
            )
          } else {
            let navigationExtras: NavigationExtras = {
              queryParams: {
                nav: 0
              }
            };
            this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId], navigationExtras)
          }
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        })
      }
      this.lStorageService.removeitemfromLocalStorage('serviceOPtionInfo');
    }, error => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
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
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    });
  }
  pay() {
    if (this.orderData.orderStatus == 'ORDER_PREPAYMENT_PENDING' && this.selected_payment_mode) {
      this.makePayment();
    } else {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          nav: 0
        }
      };
      this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId], navigationExtras)
    }
  }

  finishCheckout(status) {
    console.log("Finish Checkout", status);
    if (status) {
      let navigationExtras: NavigationExtras = {
        queryParams: {
          nav: 0
        }
      };
      this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: 0 });
      // this.ngZone.run(() => 
      this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId], navigationExtras)
      // );
    } else {
      this.toastService.showError("Transaction failed");
      // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
      // this.ngZone.run(() => 
      this.router.navigate([this.sharedService.getRouteID(), 'order', 'checkout'])
      // );

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
          this.toastService.showError(response.error.description);
          // this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
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
        this.toastService.showError(response.RESPMSG);
        // this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
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
          this.toastService.showError(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'));
          // this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'), { 'panelClass': 'snackbarerror' });
        }
      }
    }, error => {
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    });
  }
    setAnalytics(source?) {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id,
      storeId : this.lStorageService.getitemfromLocalStorage('storeId')
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
    this.router.navigate([this.sharedService.getRouteID(), 'order', 'cart'], navigationExtras);
  }

  getCoupons(catalogId) {
    this.orderService.getSoCoupons(catalogId).subscribe(coupons => {
      if (coupons) {
        this.s3CouponsList.OWN = coupons;
        console.log("this.s3CouponsList.OWN",this.s3CouponsList.OWN)
        if (this.s3CouponsList.OWN.length > 0) {
          this.isCouponsAvailable = true;
        }
      }
    },
      error => {
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);    })
  }

  couponActionPerformed(action) {
    console.log("action",action['value'])
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
    console.log("postData",postData)
    this.orderService.applyCoupon(this.cartId,postData).subscribe(couponData =>{
      if(couponData) {
        this.toastService.showSuccess("Coupon applied successfully");
        this.getCart();
      }
    },
    error => {
      // this.loading = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);    })
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
        this.toastService.showSuccess("Coupon removed successfully");
        this.getCart();
      });
  }
  getAttributeValues(attributes: any): string[] {
    return Object.values(attributes);
  }
}
