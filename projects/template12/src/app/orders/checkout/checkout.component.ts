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
import { AddressComponent } from './address/address.component';

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
  isProcessing = false;
  isReadyForPayment = false;
  isInvoiceReady = false;
  status: any = false;
  confirmBtn = false;
  loggedUser: any;
  providerConsumerId: any;
  cartData: any = [];
  orderSummary: any = false;
  cartId: any;
  cartNote: string = '';
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
  @ViewChild(AddressComponent) addressComponent?: AddressComponent;
  ispaymentDone = false;
  events: any;
  index: any;
  cartNoteFieldVisible: boolean = false;
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
  showSummaryDetails = false;
  isCartLoading = true;
  get hasCheckoutItems(): boolean {
    return Array.isArray(this.items) && this.items.length > 0;
  }
  get hasDeliveryAddresses(): boolean {
    return !!this.deliveryAddress || !!this.addressComponent?.addedAddresses?.length;
  }
  get canShowPaymentActions(): boolean {
    if (!this.orderSummary) {
      return false;
    }
    return this.getPayableAmount() > 0;
  }
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
    this.loadCartNote();
  }

  ngOnInit(): void {
    this.config = this.sharedService.getTemplateJSON();
    if (this.config?.theme) {
      this.theme = this.config.theme;
      console.log("theme", this.theme)
    }
  }

  loadCartNote() {
    const savedNote = this.lStorageService.getitemfromLocalStorage('cartNote');
    this.cartNote = savedNote || '';
  }

 clearCartNote() {
    this.cartNote = '';
    this.cartNoteFieldVisible = false;
    this.lStorageService.removeitemfromLocalStorage('cartNote');
  }

  saveCartNote(note: string) {
    this.cartNote = note ?? '';
    this.lStorageService.setitemonLocalStorage('cartNote', this.cartNote);
  }

  toggleCartNoteField() {
    if (this.confirmBtn) {
      return;
    }
    this.cartNoteFieldVisible = !this.cartNoteFieldVisible;
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
      return (this.cdnPath + 'assets/images/rx-order/items/success.svg');
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
    this.isReadyForPayment = false;
    this.isInvoiceReady = false;
    this.invId = null;
      this.setTimeline();
    }
  }

  goBackLocation() {
    this.location.back();
  }

  toggleSummaryDetails() {
    this.showSummaryDetails = !this.showSummaryDetails;
  }

  togglepaymentMode() {
    this.shownonIndianModes = !this.shownonIndianModes;
    this.selected_payment_mode = null;
  }

  setPaymentModeToggle(value: boolean) {
    if (this.shownonIndianModes === value) {
      return;
    }
    this.shownonIndianModes = value;
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
    let amount = 0;
    if (this.orderData && this.orderData.amountDue) {
      amount = this.orderData.amountDue;
    } else if (this.orderData && this.orderData.netRate) {
      amount = this.orderData.netRate;
    } else if (this.cartData && (this.cartData.netTotal || this.cartData.netRate)) {
      amount = this.cartData.netTotal || this.cartData.netRate;
    }

    this.consumerService.getPaymentModesofProvider(this.accountId, 0, 'prePayment')
      .subscribe(
        data => {
          if (Array.isArray(data)) {
            this.paymentmodes = data[0];
          } else {
            this.paymentmodes = data;
          }
          this.isPayment = true;
          let convienientPaymentObj = {}
          convienientPaymentObj = {
            "profileId": this.paymentmodes.profileId,
            "amount": amount
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
    this.isCartLoading = true;
    this.orderService.getCart(this.providerConsumerId).subscribe(data => {
      if (data) {
        this.cartData = data;
        console.log('this.cartData1113', this.selectedDeliveryType);
        if (Array.isArray(this.cartData)) {
          if (this.selectedDeliveryType) {
            this.cartData = this.cartData.find(item => item.deliveryType === this.selectedDeliveryType) || null;
          } else {
            this.cartData = this.cartData[0] || null;
          }
        }
        if (!this.cartData) {
          this.cartId = null;
          this.items = [];
          this.deliveryType = null;
          this.orderSummary = false;
          this.setTimeline();
          return;
        }
        this.cartId = this.cartData.uid;
        console.log('this.cartData1112', this.cartData);
        this.items = Array.isArray(this.cartData.items) ? this.cartData.items : [];
        // this.deliveryType = this.cartData.deliveryType;
        this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: this.items.length })
        this.subscriptionService.sendMessage({ ttype: 'hideCartFooter', value: 0 });
        this.deliveryType = this.cartData.deliveryType;
        // Reset payment flow state whenever we (re)load cart data
        this.isReadyForPayment = false;
        this.isInvoiceReady = false;
        this.invId = null;
        this.confirmBtn = false;
        this.orderData = [];
        this.selected_payment_mode = null;
        if (this.items.length > 0) {
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
        this.getPaymentModes();
        // this.deliveryOption = 'homeDelivery';
      }
      this.isCartLoading = false;
    }, error => {
      this.isCartLoading = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    });
  }

  // isPayClicked = false;
confirm() {
  if (this.isProcessing) return;

  // For HOME_DELIVERY, backend requires a valid delivery address.
  if (this.deliveryType === 'HOME_DELIVERY' && !this.deliveryAddress) {
    this.toastService.showError('Please select a delivery address to continue.');
    return;
  }

  this.isProcessing = true;

  const payload: any =
    this.deliveryType === 'HOME_DELIVERY'
      ? { homeDeliveryAddress: this.deliveryAddress }
      : {};
  const trimmedNote = this.cartNote?.trim();
  if (trimmedNote) {
    payload.notesFromCustomer = trimmedNote;
  }

  this.orderService.checkoutCartItems(this.cartId, payload).subscribe({
    next: (checkOut) => {
      this.checkOutId = checkOut;
      this.confirmBtn = true;
      this.cartNoteFieldVisible = false;

      // clear address only after successful checkout creation
      this.lStorageService.removeitemfromLocalStorage('deliveryAddress');

      this.subscriptionService.sendMessage({ ttype: 'cartChanged', value: 0 });

      this.orderService.getOrderByUid(this.checkOutId).subscribe({
        next: (orderInfo) => {
          this.orderData = orderInfo;
          this.getPaymentModes();

          // If not prepayment pending -> navigate to order (no pay step)
          if (this.orderData?.orderStatus !== 'ORDER_PREPAYMENT_PENDING') {
            this.isProcessing = false;
            this.isReadyForPayment = false;

            const navigationExtras: NavigationExtras = { queryParams: { nav: 0 } };
            this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId], navigationExtras);
            return;
          }

          // Pending payment -> fetch invoice (even if invoiceGenerated flag is flaky)
          this.fetchInvoiceAndMarkReady(this.orderData.uid);
        },
        error: (error) => {
          this.isProcessing = false;
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      });
    },
    error: (error) => {
      this.isProcessing = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    }
  });
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
    // 1. If we don't have orderData yet, create it.
    if (!this.orderData || !this.orderData.uid) {
      // this.isPayClicked = true;
      this.confirm(); // trigger order creation
      return;
    }

    // 2. Normal validation checks
    if (!this.orderData.orderStatus) {
      console.error('Order status missing:', this.orderData);
      this.toastService.showError('Order details loading...');
      return;
    }

    if (this.orderData.orderStatus === 'ORDER_PREPAYMENT_PENDING') {
      if (!this.selected_payment_mode) {
        this.toastService.showError('Please select a payment method.');
        return;
      }
      if (!this.invId) {
        // Try to recover if invoice ID is missing but order exists?
        // For now, just show error.
        this.toastService.showError('Invoice not ready yet. Please wait a moment.');
        return;
      }
      this.makePayment();
    } else {
      // Navigate to order details
      const navigationExtras: NavigationExtras = {
        queryParams: {
          nav: 0
        }
      };
      this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId || this.orderData?.uid], navigationExtras)
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
      this.clearCartNote();
      // this.ngZone.run(() => 
      this.router.navigate([this.sharedService.getRouteID(), 'order', this.checkOutId || this.orderData?.uid], navigationExtras)
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
  if (this.isProcessing) return;

  if (!this.selected_payment_mode) {
    this.toastService.showError('Please select a payment method.');
    return;
  }
  if (!this.orderData?.uid || !this.invId) {
    this.toastService.showError('Order/Invoice not ready. Please click Continue first.');
    return;
  }

  this.isProcessing = true;

  this.orderDetails = {
    amount: this.orderData.amountDue,
    paymentMode: this.selected_payment_mode,
    uuid: this.invId,
    convenientFee: this.gatewayFee || 0,
    convenientFeeTax: this.convenientFeeTax || 0,
    jaldeeConvenienceFee: this.convenientFee || 0,
    accountId: this.accountId,
    purpose: 'prePayment',
    mockResponse: true,
    isInternational: this.isInternatonal,
    custId: this.providerConsumerId
  };

  this.ispaymentDone = true;
  this.setTimeline();

  this.orderService.consumerSoPayment(this.orderDetails).subscribe({
    next: (pData: any) => {
      this.isProcessing = false;

      this.pGateway = pData.paymentGateway;
      this.setAnalytics('payment_initiated');

      if (this.pGateway === 'RAZORPAY') {
        this.paywithRazorpay(pData);
      } else {
        if (pData?.response) {
          this.payWithPayTM(pData, this.accountId);
        } else {
          this.toastService.showError(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'));
        }
      }
    },
    error: (error) => {
      this.isProcessing = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    }
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
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
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
        this.toastService.showSuccess("Coupon applied successfully");
        this.getCart();
      }
    },
      error => {
        // this.loading = false;
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(errorObj);
      })
  }

  openCoupons(type?: any) {
    const appliedCoupons = this.getAppliedCoupons();
    this.coupondialogRef = this.dialog.open(CouponsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass'],
      disableClose: true,
      data: {
        couponsList: this.s3CouponsList,
        type: type,
        theme: this.theme,
        appliedCoupons: appliedCoupons
      }
    });
    this.coupondialogRef.afterClosed().subscribe((result) => {
      if (result?.action === 'apply' && result?.code) {
        this.selectedCoupons = result.code;
        this.applyCoupon();
      }
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

  private getAppliedCoupons() {
    const provider = (this.cartData?.providerCoupons || []).map(coupon => coupon.couponCode).filter(code => code);
    const jaldee = (this.cartData?.jaldeeCoupons || []).map(coupon => coupon.couponCode).filter(code => code);
    return { provider, jaldee };
  }
  getAttributeValues(attributes: any): string[] {
    return Object.values(attributes);
  }
  getPrimaryButtonLabel(): string {
  if (this.isProcessing) return 'Please wait...';
  return this.isReadyForPayment ? 'Pay' : 'Continue';
}
  private computeReadyForPayment(): boolean {
    return (
      !!this.orderData?.uid &&
      this.orderData?.orderStatus === 'ORDER_PREPAYMENT_PENDING' &&
      !!this.invId
    );
  }
  primaryAction() {
    if (this.isProcessing) return;
    
    // Step 1: Continue -> create order + invoice
    if (!this.isReadyForPayment) {
      if (this.deliveryType === 'HOME_DELIVERY' && !this.deliveryAddress) {
          this.addressComponent?.proceedToCheckout();
        }
      if (this.isInvoiceReady) {
        this.isReadyForPayment = true;
        return;
      }
      this.confirm();  // confirm() will set isInvoiceReady when invoice is fetched
      return;
    }

  // Step 2: Pay -> require payment mode + invoice id
  if (!this.selected_payment_mode) {
    this.toastService.showError('Please select a payment method.');
    return;
  }
  if (!this.invId) {
    this.toastService.showError('Invoice not ready yet. Please wait a moment.');
    return;
  }

  this.makePayment();
}
  private fetchInvoiceAndMarkReady(orderUid: string) {
  this.orderService.getInvoiceByOrderUid(this.accountId, orderUid).subscribe({
    next: (invoiceInfo) => {
      this.invoiceDetailsById = invoiceInfo;

      this.invId = this.invoiceDetailsById?.[0]?.uid || null;
      this.roundedValue = this.invoiceDetailsById?.[0]?.roundedValue || 0;

      this.isInvoiceReady = this.computeReadyForPayment();
      this.isReadyForPayment = false;
      this.isProcessing = false;

      // Move timeline to payment step (optional; you already do orderSummary earlier)
      this.orderSummary = true;
      this.setTimeline();

      if (!this.invId) {
        this.toastService.showError('Invoice not ready yet. Please click Continue again.');
      }
    },
    error: (error) => {
      this.isProcessing = false;
      let errorObj = this.errorService.getApiError(error);
      this.toastService.showError(errorObj);
    }
  });
  }

  getPayableAmount(): number {
    if (this.amountWithAllCharges && this.amountWithAllCharges > 0 && this.confirmBtn) {
      return this.amountWithAllCharges;
    }
    if (this.orderData?.grossTotal) {
      return this.orderData.grossTotal;
    }
    if (this.orderData?.amountDue) {
      return this.orderData.amountDue;
    }
    if (this.orderData?.netRate) {
      return this.orderData.netRate;
    }
    if (this.cartData?.grossTotal) {
      return this.cartData.grossTotal;
    }
    if (this.cartData?.netRate) {
      return this.cartData.netRate;
    }
    if (this.cartData?.netTotal) {
      return this.cartData.netTotal;
    }
    return 0;
  }

  getDisplayedTotal(): number {
    if (this.selected_payment_mode && this.amountWithAllCharges && this.amountWithAllCharges > 0) {
      return this.amountWithAllCharges;
    }
    if (this.orderData?.amountDue) {
      return this.orderData.amountDue;
    }
    if (this.orderData?.netRate) {
      return this.orderData.netRate;
    }
    if (this.cartData?.netRate) {
      return this.cartData.netRate;
    }
    if (this.cartData?.netTotal) {
      return this.cartData.netTotal;
    }
    return 0;
  }

  getOrderSummaryTotal(): number {
    if (this.cartData?.netTotal) {
      return this.cartData.netTotal;
    }
    if (this.orderData?.netTotal) {
      return this.orderData.netTotal;
    }
    if (this.cartData?.netRate) {
      return this.cartData.netRate;
    }
    if (this.orderData?.netRate) {
      return this.orderData.netRate;
    }
    return 0;
  }
  goBackToCart() {
    // this.router.navigate([this.sharedService.getRouteID(), 'cart']);
  this.location.back();
  }

}
