import { Component, OnInit, ChangeDetectorRef, ViewChild, NgZone } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { DatePipe } from '@angular/common';
import { ConsumerService, DateFormatPipe, ErrorMessagingService, GroupStorageService, Messages, PaytmService, RazorpayService, SharedService, ToastService, WordProcessor } from 'jconsumer-shared';
import { BookingService } from '../../booking/booking.service';

@Component({
  'selector': 'app-payment-link',
  'templateUrl': './payment-link-new.component.html',
  'styleUrls': ['./payment-link-new.component.scss']
})

export class PaymentLinkComponent implements OnInit {
  tooltipcls = '';
  api_loading = false;
  genid;
  isCheckin;
  netRate: any;
  location: any;
  new_cap = Messages.NEW_CAP;
  bill_cap = Messages.BILL_CAPTION;
  date_cap = Messages.DATE_CAP;
  time_cap = Messages.TIME_CAP;
  bill_no_cap = Messages.BILL_NO_CAP;
  gstin_cap = Messages.GSTIN_CAP;
  ad_ser_item_cap = Messages.ADD_SER_ITEM_CAP;
  available_cap = Messages.AVAILABLE_CAP;
  qty_cap = Messages.QTY_CAPITAL_CAP;
  add_btn_cap = Messages.ADD_BTN;
  cancel_btn_cap = Messages.CANCEL_BTN;
  qnty_cap = Messages.QTY_CAP;
  select_discount_cap = Messages.SEL_DISC_CAP;
  select_coupon_cap = Messages.SEL_COUPON_CAP;
  done_btn_cap = Messages.DONE_BTN;
  discount_cap = Messages.DISCOUNT_CAP;
  coupon_cap = Messages.COUPON_CAP;
  sub_tot_cap = Messages.SUB_TOT_CAP;
  dis_coupons_cap = Messages.DISCOUNTS_COUPONS_CAP;
  delete_btn_cap = Messages.DELETE_BTN;
  gross_amnt_cap = Messages.GROSS_AMNT_CAP;
  bill_disc_cap = Messages.BILL_DISCOUNT_CAP;
  tax_cap = Messages.TAX_CAP;
  amount_paid_cap = Messages.AMNT_PAID_CAP;
  amount_to_pay_cap = Messages.AMNT_TO_PAY_CAP;
  back_to_bill_cap = Messages.BACK_TO_BILL_CAP;
  payment_logs_cap = Messages.PAY_LOGS_CAP;
  amount_cap = Messages.AMOUNT_CAP;
  refundable_cap = Messages.REFUNDABLE_CAP;
  status_cap = Messages.PAY_STATUS;
  mode_cap = Messages.MODE_CAP;
  refunds_cap = Messages.REFUNDS_CAP;
  api_error = null;
  api_success = null;
  checkin = null;
  bill_data = null;
  message = '';
  items: any = [];
  pre_payment_log: any = [];
  payment_options: any = [];
  close_msg = 'close';
  bname = '';
  billdate = '';
  billtime = '';
  gstnumber = '';
  billnumber = '';
  bill_load_complete = 0;
  item_service_tax: any = 0;
  uuid;
  gateway_redirection = false;
  payModesExists = false;
  payModesQueried = false;
  payment_popup = null;
  showPaidlist = false;
  showJCouponSection = false;
  jCoupon = '';
  couponList: any = [];
  refund_value;
  discountDisplayNotes = false;
  billNoteExists = false;
  showBillNotes = false;
  paytmEnabled = false;
  type;
  pGateway: any;
  orderid: any;
  razorpayid: any;
  amount: any;
  status_check: any;
  firstname: any;
  phoneno: any;
  consumeremail: any;
  consumerphonenumnber: any;
  consumername: any;
  statuscheck = true;
  showbill = false;
  billPaymentStatus: any;
  amountDue: any;
  origin: string;
  checkIn_type: string;
  accountId: any;
  countryCode: any;
  data: any;
  razorpayDetails: any = [];
  order_id: any;
  payment_id: any;
  razorpay_signature: any;
  paidStatus = 'false';
  providername: any;
  description: any;
  businessname: any;
  username: any;
  provider_label: any;
  customer: any;
  loadingPaytm = false;
  isClickedOnce = false;
  paymentmodes: any;
  paymode = false;
  @ViewChild('consumer_paylink') paytmview;
  razorpayEnabled = false;
  interNatioanalPaid = false;
  serviceId: any;
  shownonIndianModes: boolean;
  isInternational: boolean;
  // paymentMode: any;
  isPayment: boolean;
  indian_payment_modes: any = []
  non_indian_modes: any = [];
  businessLogo: any;
  blogo = false;
  isInvoiceView = false;
  custId: any;
  invoiceId: any;
  dueDate: any;
  invoicePurpose: any;
  title: any;
  showNotes: any = [];
  convenientPaymentModes: any;
  convenientFeeObj: any;
  gatewayFee: any;
  convenientFee: any;
  convenientFeeTax: any;
  amountWithAllCharges: any;
  loadedConvenientfee: boolean;
  paymentMode: null;
  interNationalPaid: boolean;
  paymentProfileId: any;
  paymentTime: any;
  paymentMethode: void;
  paymentTimes: string;
  lastName: any;
  subscriptionUid: any;
  cdnPath: string;
  invoiceItems: any;
  serviceItems: any;
  roomRentItems: any;
  pharmacyItems: any;
  constructor(
    public translate: TranslateService,
    private activated_route: ActivatedRoute,
    private razorpayService: RazorpayService,
    private paytmService: PaytmService,
    private wordProcessor: WordProcessor,
    private toastService: ToastService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private consumerService: ConsumerService,
    public dateformat: DateFormatPipe,
    private errorService: ErrorMessagingService,
    private bookingService: BookingService,
    private groupService: GroupStorageService,
    private sharedService: SharedService,
    private datePipe: DatePipe) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.activated_route.params.subscribe(
      qparams => {
        if (qparams['id'] !== 'new') {
          this.genid = qparams['id'];
        }
      });
  }
  ngOnInit() {
    this.isCheckin = this.groupService.getitemFromGroupStorage('isCheckin');
    const bdetails = this.groupService.getitemFromGroupStorage('ynwbp');
    if (bdetails) {
      this.bname = bdetails.bn || '';
    }
    this.getuuid();
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
  }
  getuuid() {
    this.consumerService.Paymentlinkcheck(this.genid)
      .subscribe(
        data => {
          this.bill_data = data;
          console.log(this.bill_data, 'uiui')
          this.custId = this.bill_data.billFor.id;
          this.invoiceId = this.bill_data.uuid;
          if (this.bill_data.accountProfile && this.bill_data.accountProfile.businessLogo && this.bill_data.accountProfile.businessLogo.length > 0) {
            if (this.bill_data.accountProfile.businessLogo[0].s3path) {
              this.businessLogo = this.bill_data.accountProfile.businessLogo[0].s3path;
            }
          }
          if (this.bill_data.isInvoice && this.bill_data.purpose == 'financeInvoicePayment') {
            this.isInvoiceView = true;
            this.invoicePurpose = this.bill_data.purpose;
            this.getInvoiceDetailsById(this.bill_data.accountId, this.bill_data.uuid)
          } else if (this.bill_data.isInvoice && this.bill_data.purpose == 'salesOrderInvoice') {
            this.isInvoiceView = true;
            this.invoicePurpose = this.bill_data.purpose;
            this.getSoInvoiceDetailsById(this.bill_data.accountId, this.bill_data.uuid)
          }
          else if (this.bill_data.isInvoice && this.bill_data.purpose == 'memberSubscription') {
            this.isInvoiceView = true;
            this.invoicePurpose = this.bill_data.purpose;
            this.getmembershipInvocieDetailsById(this.bill_data.uuid, this.bill_data.accountId)
            
          }
          else if (this.bill_data.isInvoice && this.bill_data.purpose == 'ipInvoice') {
            this.isInvoiceView = true;
            this.invoicePurpose = this.bill_data.purpose;
            this.getIpInvoiceDetailsById(this.bill_data.accountId,this.bill_data.uuid)
          }
          else {
            this.isInvoiceView = false;
          }
          if (this.bill_data) {
            this.accountId = this.bill_data.accountId;
            this.businessname = this.bill_data.accountProfile.businessName;
            this.firstname = this.bill_data.billFor.firstName;
            this.lastName = this.bill_data?.billFor?.lastName;
            this.title = this.bill_data.billFor.title;
            this.netRate = this.bill_data.netRate;
            if (this.bill_data.amountDue) {
              this.amountDue = this.bill_data.amountDue;
              this.getPaymentModes();
            }
            this.getPaymentModes();
            this.location = this.bill_data.accountProfile.location.place;
            this.billPaymentStatus = this.bill_data.billPaymentStatus;
            this.uuid = this.bill_data.uuid;

            this.countryCode = this.bill_data.billFor.countryCode;
            if (this.bill_data.service && this.bill_data.service.length > 0) {
              this.serviceId = this.bill_data.service[0].serviceId;
            }


          }

          if (this.bill_data && this.bill_data.accountId === 0) {
            this.razorpayEnabled = true;
          }

          if (this.bill_data.accountProfile.providerBusinessName) {
            this.username = this.bill_data.accountProfile.providerBusinessName;
          }
          if (this.bill_data.accountProfile.domain && this.bill_data.accountProfile.subDomain) {
            const domain = this.bill_data.accountProfile.domain || null;
            const sub_domain = this.bill_data.accountProfile.subDomain || null;
            this.consumerService.getIdTerminologies(domain, sub_domain)
              .subscribe((data: any) => {
                this.customer = data.customer;
              },
                error => {
                  this.api_error = this.wordProcessor.getProjectErrorMesssages(error), { 'panelClass': 'snackbarerror' };
                }
              );
          }
          if (this.bill_data && this.bill_data.discount) {
            for (let i = 0; i < this.bill_data.discount.length; i++) {
              if (this.bill_data.discount[i].displayNote) {
                this.discountDisplayNotes = true;
              }
            }
          }

          if (this.bill_data.displayNotes || this.discountDisplayNotes) {
            this.billNoteExists = true;
          }
          if (this.bill_data.amountDue < 0) {
            this.refund_value = Math.abs(this.bill_data.amountDue);
          }
          this.getBillDateandTime();

        },
        error => {
        },
        () => {
        }
      );
  }
  getSoInvoiceDetailsById(accId, invId) {
    this.consumerService.getSoInvoiceDetailsById(accId, invId).subscribe(invoiceInfo => {
      this.bill_data = invoiceInfo;
      console.log(this.bill_data, 'uuuuuuuuuuuuuuuu')
      if (this.bill_data.amountDue) {
        this.amountDue = this.bill_data.amountDue;
        // this.setConvenientFee();
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.businessName) {
        this.businessname = this.bill_data.accountProfile.businessName;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.location && this.bill_data.accountProfile.location.place) {
        this.location = this.bill_data.accountProfile.location.place;
      }
      this.getBillDateandTime();
    });
  }
  getmembershipInvocieDetailsById(invId, accId) {
    this.consumerService.getmembershipInvocieDetailsById(invId, accId).subscribe(invoiceInfo => {
      this.bill_data = invoiceInfo;
      if (this.bill_data.uid) {
        this.subscriptionUid = this.bill_data.uid;
      }
      console.log(this.bill_data, 'uuuuuuuuuuuuuuuu')
      if (this.bill_data.subscriptionAmountDue) {
        this.amountDue = this.bill_data.subscriptionAmountDue;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.businessName) {
        this.businessname = this.bill_data.accountProfile.businessName;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.location && this.bill_data.accountProfile.location.place) {
        this.location = this.bill_data.accountProfile.location.place;
      }
      this.getBillDateandTime();
    });
  }
  getInvoiceDetailsById(accId, invId) {
    this.consumerService.getInvoiceDetailsById(accId, invId).subscribe(invoiceInfo => {
      this.bill_data = invoiceInfo;
      console.log(this.bill_data, 'uuuuuuuuuuuuuuuu')
      if (this.bill_data.amountDue) {
        this.amountDue = this.bill_data.amountDue;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.businessName) {
        this.businessname = this.bill_data.accountProfile.businessName;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.location && this.bill_data.accountProfile.location.place) {
        this.location = this.bill_data.accountProfile.location.place;
      }
      this.getBillDateandTime();
      if (this.bill_data && this.bill_data.discounts) {
        for (let i = 0; i < this.bill_data.discounts.length; i++) {
          if (this.bill_data.discounts[i].displayNote) {
            this.discountDisplayNotes = true;
          }
        }
      }
      if (this.bill_data.displayNotes || this.discountDisplayNotes) {
        this.billNoteExists = true;
      }

    });
  }
  getBillDateandTime() {
    if (this.bill_data.hasOwnProperty('createdDate')) {
      this.billdate = this.bill_data.createdDate;
      const datearr = this.bill_data.createdDate.split(' ');
      const billdatearr = datearr[0].split('-');
      this.billtime = datearr[1] + ' ' + datearr[2];
      this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
    }
    if (this.isInvoiceView) {
      if (this.bill_data.hasOwnProperty('invoiceDate')) {
        this.billdate = this.bill_data.invoiceDate;
        const datearr = this.bill_data.invoiceDate.split(' ');
        const billdatearr = datearr[0].split('-');
        this.billtime = datearr[1] + ' ' + datearr[2];
        this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
      }
      if (this.bill_data.hasOwnProperty('dueDate')) {
        this.dueDate = this.bill_data.dueDate;
      }
    }
    if (this.bill_data.hasOwnProperty('gstNumber')) {
      this.gstnumber = this.bill_data.gstNumber;
    }
    if (this.bill_data.hasOwnProperty('billId')) {
      this.billnumber = this.bill_data.billId;
    }
  }

  resetApiErrors() {
    this.api_error = null;
    this.api_success = null;
  }
  showJCWorkbench() {
    this.showJCouponSection = true;
  }
  billNotesClicked() {
    if (!this.showBillNotes) {
      this.showBillNotes = true;
    } else {
      this.showBillNotes = false;
    }
  }
  togglepaymentMode() {
    this.shownonIndianModes = !this.shownonIndianModes;
    this.isInternational = this.shownonIndianModes;
    this.loadedConvenientfee = false;
    this.paymentMode = null;
    this.setConvenientFee();
  }
  indian_payment_mode_onchange(event) {
    this.paymentMode = event.value;
    this.paymentMethode = this.indian_payment_modes.filter(payment => payment.mode === this.paymentMode);
    this.paymentMethode = this.paymentMethode[0].modeDisplayName;
    this.isInternational = false;
    this.setConvenientFee();
  }
  non_indian_modes_onchange(event) {
    this.paymentMode = event.value;
    this.paymentMethode = this.non_indian_modes.filter(payment => payment.mode === this.paymentMode);
    this.paymentMethode = this.paymentMethode[0].modeDisplayName;
    this.isInternational = true;
    this.setConvenientFee();
  }
  setTotalAmountWithConvenientFee() {
    console.log(this.convenientPaymentModes);
    this.convenientPaymentModes.map((res: any) => {
      this.convenientFeeObj = {}
      if (res.isInternational === this.shownonIndianModes) {
        if (this.paymentMode === res.mode) {
          this.convenientFeeObj = res;
          console.log("Convenient:", this.convenientFeeObj);
          this.gatewayFee = this.convenientFeeObj.totalGatewayFee;
          this.convenientFeeTax = this.convenientFeeObj.consumerGatewayFeeTax;
          this.convenientFee = this.convenientFeeObj.convenienceFee;
          this.amountWithAllCharges = this.convenientFeeObj.amountWithAllCharges;
          console.log("Convenient feea:", this.convenientFeeObj.amountWithAllCharges);
          console.log("gatewayFee for  non-indian:", this.gatewayFee, res.mode)
        }
      }
    })
  }

  setConvenientFee() {
    const _this = this;
    let convienientPaymentObj = {}
    if (this.invoicePurpose === 'memberSubscription') {
      convienientPaymentObj = {
        "profileId": _this.paymentProfileId,
        "amount": _this.bill_data.subscriptionAmountDue
      }
    } else {
      convienientPaymentObj = {
        "profileId": _this.paymentProfileId,
        "amount": _this.bill_data.amountDue
      }
    }

    _this.consumerService.getConvenientFeeOfProvider(_this.accountId, convienientPaymentObj).subscribe((data: any) => {
      _this.convenientPaymentModes = data;
      console.log("Hererr:", _this.convenientPaymentModes);
      if (!_this.paymentMode) {
        if (_this.shownonIndianModes) {
          let paymentModes = _this.convenientPaymentModes.filter(paymentModeObj => paymentModeObj.isInternational === true);
          _this.paymentMode = paymentModes[0].mode;
        } else {
          let paymentModes = _this.convenientPaymentModes.filter(paymentModeObj => paymentModeObj.isInternational === false);
          _this.paymentMode = paymentModes[0].mode;
        }
        _this.loadedConvenientfee = true;
      }
      console.log("_this.paymentMode", _this.paymentMode)
      _this.setTotalAmountWithConvenientFee();
    });
  }

  getIpInvoiceDetailsById(accId, invId) {
    this.bookingService.getIpInvoiceDetailsById(accId, invId).subscribe(invoiceInfo => {
      this.bill_data = invoiceInfo;
      this.invoiceItems = this.bill_data.itemList.filter(item => item.itemType === 'ADHOC_ITEM');
      this.serviceItems = this.bill_data.itemList.filter(item => item.itemType === 'SERVICE_CONSUMPTION');
      this.roomRentItems = this.bill_data.itemList.filter(item => item.itemType === 'ROOM_RENT');
      this.pharmacyItems = this.bill_data.itemList.filter(item => item.itemType === 'SORDER_ITEM');
      if (this.bill_data.amountDue) {
        this.amountDue = this.bill_data.amountDue;
        // this.setConvenientFee();
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.businessName) {
        this.businessname = this.bill_data.accountProfile.businessName;
      }
      if (this.bill_data.accountProfile && this.bill_data.accountProfile.location && this.bill_data.accountProfile.location.place) {
        this.location = this.bill_data.accountProfile.location.place;
      }
      this.getBillDateandTime();
    });
  }

  getPaymentModes() {
    const _this = this;
    _this.paytmEnabled = false;
    _this.razorpayEnabled = false;
    _this.interNationalPaid = false;
    _this.consumerService.getPaymentModesofProvider(_this.accountId, 0, 'prePayment')
      .subscribe(
        data => {
          _this.paymentmodes = data[0];
          console.log("paymentmodes", _this.paymentmodes)
          _this.isPayment = true;
          _this.paymentProfileId = _this.paymentmodes.profileId;
          if (_this.paymentmodes && _this.paymentmodes.indiaPay) {
            _this.indian_payment_modes = _this.paymentmodes.indiaBankInfo;
          }
          if (_this.paymentmodes && _this.paymentmodes.internationalPay) {
            _this.non_indian_modes = _this.paymentmodes.internationalBankInfo;
          }
          if (_this.paymentmodes && !_this.paymentmodes.indiaPay && _this.paymentmodes.internationalPay) {
            _this.shownonIndianModes = true;
          } else {
            _this.shownonIndianModes = false;
          }
          _this.setConvenientFee();
          _this.api_loading = true
        },
        error => {
          _this.isPayment = false;
        }
      );
  }
  goToGateway() {
    if (this.isInvoiceView && this.invoicePurpose == 'financeInvoicePayment') {
      this.isClickedOnce = true;
      if (!this.paymentMode) {
        this.toastService.showError('Please select a payment mode');
        this.isClickedOnce = false;
        return false;
      }
      const postdata = {
        'uuid': this.invoiceId,
        'amount': this.amountDue,
        'convenientFee': this.gatewayFee || 0,
        'convenientFeeTax': this.convenientFeeTax || 0,
        'jaldeeConvenienceFee': this.convenientFee || 0,
        'purpose': 'financeInvoicePayment',
        'source': 'Desktop',
        'accountId': this.accountId,
        'paymentMode': this.paymentMode,
        'isInternational': this.isInternational,
        'serviceId': 0,
        'custId': this.custId
      };
      this.consumerService.linkPayment_invoic(postdata)
        .subscribe((data: any) => {
          console.log("Response Data:");
          console.log("Response Data:", JSON.stringify(data));
          this.checkIn_type = 'payment_link';
          this.origin = 'consumer';
          this.pGateway = data.paymentGateway || 'PAYTM';
          if (this.pGateway === 'RAZORPAY') {
            this.paywithRazorpay(data);
          } else {
            this.payWithPayTM(data, this.accountId);
          }
        },
          error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
    } else if (this.isInvoiceView && this.invoicePurpose == 'salesOrderInvoice') {
      this.isClickedOnce = true;
      if (!this.paymentMode) {
        this.toastService.showError('Please select a payment mode');
        this.isClickedOnce = false;
        return false;
      }
      const postdata = {
        'uuid': this.invoiceId,
        'amount': this.amountDue,
        'convenientFee': this.gatewayFee || 0,
        'convenientFeeTax': this.convenientFeeTax || 0,
        'jaldeeConvenienceFee': this.convenientFee || 0,
        'purpose': 'salesOrderInvoice',
        'source': 'Desktop',
        'accountId': this.accountId,
        'paymentMode': this.paymentMode,
        'isInternational': this.isInternational,
        // 'serviceId': 0,
        // 'custId': this.custId,

      };
      this.consumerService.linkSoPayment_invoic(postdata)
        .subscribe((data: any) => {
          console.log("Response Data:");
          console.log(JSON.stringify(data));
          this.checkIn_type = 'payment_link';
          this.origin = 'consumer';
          this.pGateway = data.paymentGateway || 'PAYTM';
          if (this.pGateway === 'RAZORPAY') {
            this.paywithRazorpay(data);
          } else {
            this.payWithPayTM(data, this.accountId);
          }
        },
          error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
    } else if (this.isInvoiceView && this.invoicePurpose == 'memberSubscription') {
      this.isClickedOnce = true;
      if (!this.paymentMode) {
        this.toastService.showError('Please select a payment mode');
        this.isClickedOnce = false;
        return false;
      }
      const postdata = {

        'uuid': this.subscriptionUid,
        'amount': this.amountDue,
        'convenientFee': this.gatewayFee || 0,
        'convenientFeeTax': this.convenientFeeTax || 0,
        'jaldeeConvenienceFee': this.convenientFee || 0,
        'purpose': 'memberSubscription',
        'source': 'Desktop',
        'accountId': this.accountId,
        'paymentMode': this.paymentMode,
        'isInternational': this.isInternational,
        'serviceId': 0,
        'custId': this.custId,

      };
      this.consumerService.linkMembershipPayment_invoic(postdata)
        .subscribe((data: any) => {
          console.log("Response Data:");
          console.log(JSON.stringify(data));
          this.checkIn_type = 'payment_link';
          this.origin = 'consumer';
          this.pGateway = data.paymentGateway || 'PAYTM';
          if (this.pGateway === 'RAZORPAY') {
            this.paywithRazorpay(data);
          } else {
            this.payWithPayTM(data, this.accountId);
          }
        },
          error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
    } 
    else if (this.isInvoiceView && this.invoicePurpose == 'ipInvoice') {
      this.isClickedOnce = true;
      if (!this.paymentMode) {
        this.toastService.showError('Please select a payment mode');
        this.isClickedOnce = false;
        return false;
      }
      const postdata = {

        'uuid': this.invoiceId,
        'amount': this.amountDue,
        'convenientFee': this.gatewayFee || 0,
        'convenientFeeTax': this.convenientFeeTax || 0,
        'jaldeeConvenienceFee': this.convenientFee || 0,
        'purpose': 'ipInvoice',
        'source': 'Desktop',
        'accountId': this.accountId,
        'paymentMode': this.paymentMode,
        'isInternational': this.isInternational,
        'serviceId': 0,
        'custId': this.custId,

      };
      this.bookingService.linkIpPayment_invoic(postdata)
        .subscribe((data: any) => {
          console.log("Response Data:");
          console.log(JSON.stringify(data));
          this.checkIn_type = 'payment_link';
          this.origin = 'consumer';
          this.pGateway = data.paymentGateway || 'PAYTM';
          if (this.pGateway === 'RAZORPAY') {
            this.paywithRazorpay(data);
          } else {
            this.payWithPayTM(data, this.accountId);
          }
        },
          error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
    }
    else {
      this.isClickedOnce = true;
      if (!this.paymentMode) {
        this.toastService.showError('Please select a payment mode');
        this.isClickedOnce = false;
        return false;
      }
      const postdata = {
        'uuid': this.genid,
        'amount': this.amountDue,
        'convenientFee': this.gatewayFee || 0,
        'convenientFeeTax': this.convenientFeeTax || 0,
        'jaldeeConvenienceFee': this.convenientFee || 0,
        'purpose': 'billPayment',
        'source': 'Desktop',
        'accountId': this.accountId,
        'paymentMode': this.paymentMode,
        'isInternational': this.isInternational,
        'serviceId': 0
      };
      this.consumerService.linkPayment(postdata)
        .subscribe((data: any) => {
          console.log("Response Data:");
          console.log(JSON.stringify(data));
          this.checkIn_type = 'payment_link';
          this.origin = 'consumer';
          this.pGateway = data.paymentGateway || 'PAYTM';
          if (this.pGateway === 'RAZORPAY') {
            this.paywithRazorpay(data);
          } else {
            this.payWithPayTM(data, this.accountId);
          }
        },
          error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
    }
    return true;
  }
  paywithRazorpay(pData: any) {
    this.isClickedOnce = false;
    pData.paymentMode = this.paymentMode;
    console.log("pData&accountId1link", pData, this.accountId)
    this.razorpayService.initializePayment(pData, this.accountId, this);
  }
  payWithPayTM(pData: any, accountId: any) {
    this.isClickedOnce = true;
    this.loadingPaytm = true;
    pData.paymentMode = this.paymentMode;
    this.paytmService.initializePayment(pData, accountId, this);
  }
  formatDate(timestamp: string): string {
    const date = new Date(timestamp);
    // Round to nearest minute
    date.setSeconds(date.getSeconds() >= 30 ? 0 : 0); // Replace seconds with 0
    date.setMinutes(date.getMinutes() + (date.getSeconds() >= 30 ? 1 : 0)); // Round up if seconds >= 30
    return this.datePipe.transform(date, 'MMM dd, y h:mm a') || '';
  }
  transactionCompleted(response, payload, accountId) {
    console.log('response', response)
    if (response?.TXNDATE) {
      this.paymentTime = this.formatDate(response?.TXNDATE);
    }
    if (response.SRC) {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.razorpayService.updateRazorPay(payload, accountId)
          .then((data) => {
            if (data) {
              this.paymentCompleted(true, payload);
            }
          },
            error => {
              this.toastService.showError('Transaction failed');
            })
      } else if (response.STATUS == 'TXN_FAILURE') {
        if (response.error && response.error.description) {
          this.toastService.showError(response.error.description);
        }
        this.paymentCompleted(false);
      }
    } else {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.paytmService.updatePaytmPay(payload, accountId)
          .then((data) => {
            if (data) {
              this.paymentCompleted(true, payload);
            }
          })
      } else if (response.STATUS == 'TXN_FAILURE') {
        this.toastService.showError(response.RESPMSG);
        this.paymentCompleted(false);
      }
    }
  }
  paymentCompleted(status, response?) {
    console.log('response', response)
    if (status) {
      this.paidStatus = 'true';
      if (response) {
        this.order_id = response.orderId;
        this.payment_id = response.paymentId;
      }
      this.loadingPaytm = false;
      this.cdRef.detectChanges();
      this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
      this.ngZone.run(() => console.log('Transaction success'));
    } else {
      this.closeloading();
    }
  }
  closeloading() {
    this.isClickedOnce = false;
    this.loadingPaytm = false;
    this.cdRef.detectChanges();
    this.toastService.showError('Your payment attempt was cancelled.');
    this.ngZone.run(() => console.log('cancelled'));
  }
  billview() {
    this.showbill = !this.showbill;
  }
  getImageSrc(mode) {
    return (this.cdnPath + 'assets/images/payment-modes/' + mode + '.png');
  }
  couponView(index: number) {
    (this.showNotes[index]) ? this.showNotes[index] = false : this.showNotes[index] = true;
    console.log(this.showNotes[index])
  }
}
