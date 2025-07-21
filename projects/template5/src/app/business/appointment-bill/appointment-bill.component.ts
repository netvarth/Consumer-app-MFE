import { Component, OnInit, ViewChild, Inject, ChangeDetectorRef, OnDestroy, NgZone, HostListener } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { DOCUMENT, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { JcCouponNoteComponent } from 'jaldee-framework/jc-coupon-note';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { DateFormatPipe } from 'jaldee-framework/pipes/date-format';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { InvoiceListComponent } from '../invoice-list/invoice-list.component';

@Component({
    selector: 'app-consumer-appointment-bill',
    templateUrl: './appointment-bill.component.html',
    styleUrls: ['./appointment-bill.component.scss']
})
export class ConsumerAppointmentBillComponent implements OnInit, OnDestroy {

    @ViewChild('itemservicesearch') item_service_search;
    tooltipcls = '';
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
    coupon_notes = projectConstantsLocal.COUPON_NOTES;
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
    dueDate= '';
    billtime = '';
    gstnumber = '';
    billnumber = '';
    bill_load_complete = 0;
    item_service_tax: any = 0;
    uuid;
    gateway_redirection = false;
    payModesExists = false;
    payModesQueried = false;
    pay_data: any = {};
    payment_popup = null;
    showPaidlist = false;
    showJCouponSection = false;
    jCoupon = '';
    couponList: any = {
        JC: [], OWN: []
    };

    refund_value;
    discountDisplayNotes = false;
    billNoteExists = false;
    showBillNotes = false;
    paytmEnabled = false;
    type;
    accountId;
    logo;
    pid;
    source;
    pGateway: any;
    razorModel: any;
    origin: string;
    paidStatus = 'false';
    checkIn_type: any;
    razorpay_order_id: any;
    razorpay_payment_id: any;
    razorpayDetails: any = [];
    provider_label = '';
    newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_HH_MM_A_FORMAT;
    newDateFormat_date = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
    retval;
    s3url;
    terminologiesjson;
    provider_id;
    private subs = new SubSink();
    splocation: any;
    checkJcash = false;
    checkJcredit = false;
    jaldeecash: any;
    jcashamount: any;
    jcreditamount: any;
    remainingadvanceamount;
    wallet: any;
    loadingPaytm = false;
    isClickedOnce = false;
    razorpayEnabled = false;
    interNatioanalPaid = false;
    @ViewChild('consumer_appointmentbill') paytmview;
    paymentmodes: any;
    paymode = false;
    customer_countrycode: any;
    selected_payment_mode: any;
    isInternatonal: boolean;
    shownonIndianModes: boolean;
    isPayment: boolean;
    indian_payment_modes: any;
    non_indian_modes: any;
    customId: any;
    account: any;
    accountConfig: any;
    theme: any;
    accountProfile: any;
    invoiceInfo;
    invoiceDetails: any;
    invoiceDetailsById: any;
    allInvocies: any;
    addnotedialogRef;
    invoiceId: any;
    smallmobileDevice = false;
    tabDeviceDisplay = false;
    desktopDeviceDisplay = false;
    constructor(
        private accountService: AccountService,
        private consumerService: ConsumerService,
        public _sanitizer: DomSanitizer,
        private activated_route: ActivatedRoute,
        private dialog: MatDialog,
        @Inject(DOCUMENT) public document,
        public razorpayService: RazorpayService,
        private cdRef: ChangeDetectorRef,
        private location: Location,
        private wordProcessor: WordProcessor,
        private snackbarService: SnackbarService,
        public dateformat: DateFormatPipe,
        public router: Router,
        private ngZone: NgZone,
        private paytmService: PaytmService,
        private lStorageService: LocalStorageService,
    ) {
        this.onResize();
        this.subs.sink = this.activated_route.queryParams.subscribe(
            params => {
                if (params['paidStatus']) {
                    this.paidStatus = params['paidStatus'];
                }
                if (params['uuid']) {
                    this.uuid = params['uuid'];
                }
                if (params['source']) {
                    this.source = params['source'];
                }
                if (params['type']) {
                    this.checkIn_type = params['type'];
                }
                if (this.source === 'history') {
                    this.checkIn_type = 'appt_historybill';
                }
                if (params['invoiceInfo']) {
                    this.invoiceInfo = params['invoiceInfo'];
                    console.log(this.invoiceInfo, 'this.invoiceInfo')
                }
                if (params['invoiceId']) {
                    this.invoiceId = params['invoiceId'];
                    console.log(this.invoiceInfo, 'this.invoiceInfo')
                }
                if (params['details']) {
                    this.razorpayDetails = JSON.parse(params['details']);
                    this.razorpay_order_id = this.razorpayDetails.razorpay_order_id;
                    this.razorpay_payment_id = this.razorpayDetails.razorpay_payment_id;
                    this.cdRef.detectChanges();
                }
            });
        this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    }
    goBack() {
        this.location.back();
    }
    ngOnInit() {
        this.account = this.accountService.getAccountInfo();
        this.accountConfig = this.accountService.getAccountConfig();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }
        this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
        console.log("acntpro", this.accountProfile);
        this.accountId = this.accountProfile.id;
        if (this.accountProfile && this.accountProfile.businessLogo && this.accountProfile.businessLogo.length > 0) {
            this.logo = this.accountProfile.businessLogo[0].s3path;
            console.log("logo1", this.logo);
        }
        // if (this.accountProfile.location && this.accountProfile.location.place) {
        //     this.splocation = this.accountProfile.location.place;
        // }
        this.getAppointment();
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
        if (this.accountService.getJson(this.account['coupon'])) {
            this.couponList.JC = this.accountService.getJson(this.account['coupon']);
        }
        if (this.accountService.getJson(this.account['providerCoupon'])) {
            this.couponList.OWN = this.accountService.getJson(this.account['providerCoupon']);
        }
        this.getAppointment();
    }
    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth <= 500) {
          this.smallmobileDevice = true;
          this.tabDeviceDisplay = false;
          this.desktopDeviceDisplay = false;
        } else if (window.innerWidth > 500 && window.innerWidth <= 767) {
          this.smallmobileDevice = false;
          this.tabDeviceDisplay = true;
          this.desktopDeviceDisplay = false;
        } else if (window.innerWidth > 767) {
          this.smallmobileDevice = false;
          this.tabDeviceDisplay = false;
          this.desktopDeviceDisplay = true;
        }
      }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
    getAppointment() {
        const params = {
            account: this.accountId
        };
        this.subs.sink = this.consumerService.getAppointmentDetail(this.uuid, params)
            .subscribe(
                data => {
                    this.checkin = data;

                    this.provider_id = this.checkin.providerAccount.uniqueId;
                    if (this.invoiceInfo === 'true') {
                        this.getInvoice(this.accountId, this.invoiceId);                   
                    } else if (this.invoiceInfo === 'false') {
                        this.getAppointmentBill();
                    }
                    this.getPrePaymentDetails();
                    this.getPaymentModes();
                    const credentials = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
                    this.customer_countrycode = credentials.countryCode;

                });
    }
    goToInvoiceList() {
        this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
          width: '50%',
          panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
          disableClose: true,
          autoFocus: true,
        //   data: pass_ob
        });
        this.addnotedialogRef.afterClosed().subscribe(result => {
          if (result === 'reloadlist') {
          }
        });
      }
    getBillDateandTime() {
        if (this.checkin.providerAccount && this.checkin.providerAccount.businessName) {
            this.bname = this.checkin.providerAccount.businessName;
        }

        if (this.bill_data.hasOwnProperty('createdDate')) {
            this.billdate = this.bill_data.createdDate;
            const datearr = this.bill_data.createdDate.split(' ');
            const billdatearr = datearr[0].split('-');
            this.billtime = datearr[1] + ' ' + datearr[2];
            this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
        }
        if (this.bill_data.hasOwnProperty('gstNumber')) {
            this.gstnumber = this.bill_data.gstNumber;
        }

        // if (this.bill_data.hasOwnProperty('billId')) {
        //     this.billnumber = this.bill_data.billId;
        // }
        // if (this.checkin.hasOwnProperty('billId')) {
        //     this.billnumber = this.checkin.billId;
        // }
    }
    getTerminologyTerm(term) {
        const term_only = term.replace(/[\[\]']/g, ''); // term may me with or without '[' ']'
        if (this.terminologiesjson) {
            return (this.terminologiesjson[term_only]) ? this.terminologiesjson[term_only] : ((term === term_only) ? term_only : term);
        } else {
            return (term === term_only) ? term_only : term;
        }
    }
    resetApiErrors() {
        this.api_error = null;
        this.api_success = null;
    }
    showJCWorkbench() {
        this.showJCouponSection = true;
    }
    getAppointmentBill() {
        // const params = {
        //     account: this.accountId
        // };
        this.subs.sink = this.consumerService.getApptBill(this.uuid)
            .subscribe(
                data => {
                    this.bill_data = data;

                    if (this.bill_data.discount) {
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
                    if (this.bill_data.amountDue > 0) {
                        this.getJaldeeCashandCredit();
                    }
                    if (this.bill_data.accountProfile.location && this.bill_data.accountProfile.location.place) {
                        this.splocation = this.bill_data.accountProfile.location.place;
                    }
                    this.getBillDateandTime();

                },
                error => {
                },
                () => {
                }
            );
    }
    
    getInvoice(accId, invoiceId) {
        this.consumerService.getInvoice(accId, invoiceId)
            .subscribe(data => {
                this.invoiceDetailsById = data;
                if (this.invoiceDetailsById.amountDue < 0) {
                    this.refund_value = Math.abs(this.invoiceDetailsById.amountDue);
                }
                if (this.invoiceDetailsById.amountDue > 0) {
                    this.getJaldeeCashandCredit();
                }
                this.getInvoiceDateandTime();

            });
    }
    getInvoiceDateandTime() {
        if (this.invoiceDetailsById.hasOwnProperty('invoiceDate')) {
            this.billdate = this.invoiceDetailsById.invoiceDate;
            const datearr = this.invoiceDetailsById.invoiceDate.split(' ');
            const billdatearr = datearr[0].split('-');
            this.billtime = datearr[1] + ' ' + datearr[2];
            this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
        }
        if (this.invoiceDetailsById.hasOwnProperty('dueDate')) {
            this.dueDate = this.invoiceDetailsById.dueDate;
        }
        if (this.invoiceDetailsById.hasOwnProperty('invoiceId')) {
            this.billnumber = this.invoiceDetailsById.invoiceId;
        }
        if(this.invoiceDetailsById.taxSettings && this.invoiceDetailsById.taxSettings.gstNumber){
            this.gstnumber = this.invoiceDetailsById.taxSettings.gstNumber;
        }
        if(this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.businessName){
            this.bname = this.invoiceDetailsById.accountProfile.businessName;
        }
        if (this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.location && this.invoiceDetailsById.accountProfile.location.place) {
            this.splocation = this.invoiceDetailsById.accountProfile.location.place;
        }
       

    }
    getJaldeeCashandCredit() {
        this.consumerService.getJaldeeCashandJcredit()
            .subscribe(data => {
                this.checkJcash = true
                this.jaldeecash = data;
                this.jcashamount = this.jaldeecash.jCashAmt;
                this.jcreditamount = this.jaldeecash.creditAmt;
            });

    }
    billNotesClicked() {
        if (!this.showBillNotes) {
            this.showBillNotes = true;
        } else {
            this.showBillNotes = false;
        }
    }
    billNotesExists(billNotesExists: any) {
        throw new Error('Method not implemented.');
    }
    getPrePaymentDetails() {
        const params = {
            account: this.accountId
        };
        this.subs.sink = this.consumerService.getPaymentDetail(params, this.uuid)
            .subscribe(
                data => {
                    this.pre_payment_log = data;
                },
                () => {

                }
            );
    }
    indian_payment_mode_onchange(event) {
        this.selected_payment_mode = event.value;
        this.isInternatonal = false;
    }
    non_indian_modes_onchange(event) {
        this.selected_payment_mode = event.value;
        this.isInternatonal = true;
    }
    togglepaymentMode() {
        this.shownonIndianModes = !this.shownonIndianModes;
        this.selected_payment_mode = null;
    }
    getPaymentModes() {
        this.consumerService.getPaymentModesofProvider(this.accountId, 0, this.invoiceInfo === 'false' ? 'billPayment' : 'financeInvoicePayment')
            .subscribe(
                data => {
                    this.paymentmodes = data[0];
                    this.isPayment = true;
                    if (this.paymentmodes.indiaPay) {
                        this.indian_payment_modes = this.paymentmodes.indiaBankInfo;
                    }
                    if (this.paymentmodes.internationalPay) {
                        this.non_indian_modes = this.paymentmodes.internationalBankInfo;

                    }
                    if (!this.paymentmodes.indiaPay && this.paymentmodes.internationalPay) {
                        this.shownonIndianModes = true;
                    } else {
                        this.shownonIndianModes = false;
                    }

                }
            );
    }
    /**
     * Perform PayU Payment
     */
    payuPayment(paymentType?) {
        this.isClickedOnce = true;

        if (this.jcashamount > 0 && this.checkJcash) {
            this.consumerService.getRemainingPrepaymentAmount(this.checkJcash, this.checkJcredit, this.invoiceInfo === 'false' ? this.bill_data.amountDue : this.invoiceDetailsById.amountDue)
                .subscribe(data => {
                    this.remainingadvanceamount = data;
                    if (this.remainingadvanceamount == 0 && this.checkJcash) {
                        const postData = {
                            'amountToPay': this.invoiceInfo === 'false' ? this.bill_data.amountDue : this.invoiceDetailsById.amountDue,
                            'accountId': this.accountId,
                            'uuid': this.invoiceInfo === 'false' ? this.uuid : this.invoiceDetailsById.invoiceUid,
                            'paymentPurpose': this.invoiceInfo === 'false' ? 'billPayment' : 'financeInvoicePayment',
                            'isJcashUsed': true,
                            'isreditUsed': false,
                            'paymentMode': 'JCASH',
                            'serviceId': 0,
                            'isInternational': false
                        };
                        this.consumerService.PayByJaldeewallet(postData)
                            .subscribe(data => {
                                this.loadingPaytm = false;
                                this.wallet = data;
                                if (!this.wallet.isGateWayPaymentNeeded && this.wallet.isJCashPaymentSucess) {
                                    this.snackbarService.openSnackBar(Messages.PROVIDER_BILL_PAYMENT, { 'panelClass': 'snackbarnormal' });
                                    this.router.navigate([this.accountId, 'dashboard']);
                                }
                            },
                                error => {
                                    this.isClickedOnce = false;
                                    this.loadingPaytm = false;
                                    this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                                });
                    } else if (this.remainingadvanceamount > 0 && this.checkJcash) {
                        console.log("selectedMode:" + this.selected_payment_mode);
                        if (this.selected_payment_mode && this.selected_payment_mode.toLowerCase() === 'cash') {
                            this.cashPayment();
                        } else {
                            const postData = {
                                'amountToPay': this.invoiceInfo === 'false' ? this.bill_data.amountDue : this.invoiceDetailsById.amountDue,
                                'accountId': this.accountId,
                                'uuid': this.invoiceInfo === 'false' ? this.uuid : this.invoiceDetailsById.invoiceUid,
                                'paymentPurpose': this.invoiceInfo === 'false' ? 'billPayment' : 'financeInvoicePayment',
                                'isJcashUsed': true,
                                'isreditUsed': false,
                                'paymentMode': this.selected_payment_mode,
                                'serviceId': 0,
                                'isinternational': this.isInternatonal
                            };
                            this.consumerService.PayByJaldeewallet(postData)
                                .subscribe((pData: any) => {
                                    this.origin = 'consumer';
                                    this.pGateway = pData.paymentGateway;
                                    if (pData.isGateWayPaymentNeeded && pData.isJCashPaymentSucess) {
                                        if (this.pGateway == 'RAZORPAY') {
                                            this.paywithRazorpay(pData.response);
                                        } else {
                                            this.payWithPayTM(pData.response, this.accountId);
                                        }
                                    }
                                },
                                    error => {
                                        this.isClickedOnce = false;
                                        this.loadingPaytm = false;
                                        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                                    });

                        }
                    }
                },
                    error => {
                        this.isClickedOnce = false;
                        this.loadingPaytm = false;
                        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                    });
        }
        else {
            console.log("HERE:" + this.selected_payment_mode);
            if (this.selected_payment_mode && this.selected_payment_mode.toLowerCase() === 'cash') {
                this.cashPayment();
            } else {
                this.pay_data.uuid = this.invoiceInfo === 'false' ? this.uuid : this.invoiceDetailsById.invoiceUid,
                this.pay_data.amount = this.invoiceInfo === 'false' ? this.bill_data.amountDue : this.invoiceDetailsById.amountDue,
                    this.pay_data.accountId = this.accountId;
                this.pay_data.purpose = this.invoiceInfo === 'false' ? 'billPayment' : 'financeInvoicePayment'
                this.pay_data.serviceId = 0;
                this.pay_data.isInternational = this.isInternatonal;
                this.pay_data.paymentMode = this.selected_payment_mode;
                this.resetApiError();
                if (this.pay_data.uuid != null &&
                    this.pay_data.paymentMode != null &&
                    this.pay_data.amount !== 0) {
                    this.api_success = Messages.PAYMENT_REDIRECT;
                    this.gateway_redirection = true;
                    if(this.invoiceInfo === 'false'){
                        this.subs.sink = this.consumerService.consumerPayment(this.pay_data)
                        .subscribe(
                            (data: any) => {
                                this.origin = 'consumer';
                                this.pGateway = data.paymentGateway;
                                if (this.pGateway === 'RAZORPAY') {
                                    this.paywithRazorpay(data);
                                } else {
                                    this.payWithPayTM(data, this.accountId);
                                }
                            },
                            error => {
                                this.isClickedOnce = false;
                                this.resetApiError();
                                this.loadingPaytm = false;
                                this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                            }
                        );
                    }
                    else if(this.invoiceInfo === 'true'){
                        this.pay_data.custId = this.invoiceDetailsById.providerConsumerId;
                        this.subs.sink = this.consumerService.consumerPayment_invocie(this.pay_data)
                        .subscribe(
                            (data: any) => {
                                this.origin = 'consumer';
                                this.pGateway = data.paymentGateway;
                                if (this.pGateway === 'RAZORPAY') {
                                    this.paywithRazorpay(data);
                                } else {
                                    this.payWithPayTM(data, this.accountId);
                                }
                            },
                            error => {
                                this.isClickedOnce = false;
                                this.resetApiError();
                                this.loadingPaytm = false;
                                this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                            }
                        );
                    }
                    
                } else if (!this.selected_payment_mode && (this.invoiceInfo === 'false' ? this.bill_data.amountDue > 0 : this.invoiceDetailsById.amountDue > 0)) {
                    this.snackbarService.openSnackBar('Please Choose Payment Option', { 'panelClass': 'snackbarerror' });
                    this.isClickedOnce = false;
                }
            }
        }
    }
    getImageSrc(mode) {

        return 'assets/images/payment-modes/' + mode + '.png';
    }
    payWithPayTM(pData: any, accountId: any) {
        this.isClickedOnce = true;
        this.loadingPaytm = true;
        pData.paymentMode = this.selected_payment_mode;
        this.paytmService.initializePayment(pData, accountId, this);
    }
    closeloading() {
        this.isClickedOnce = false;
        this.loadingPaytm = false;
        this.cdRef.detectChanges();
    }


    finishTransaction(status) {
        console.log("status",status)
        if (status) {
            this.snackbarService.openSnackBar(Messages.PROVIDER_BILL_PAYMENT, { 'panelClass': 'snackbarnormal' });
            let queryParams = {};
            if (this.checkIn_type === 'appt_historybill') {
                queryParams['is_orderShow'] = 'false';
                this.ngZone.run(() => this.router.navigate([this.customId, 'history'], { queryParams: queryParams }));
            } else {
                queryParams['uuid'] = this.uuid;
                queryParams['type'] = 'appointment';
                queryParams['paidStatus'] = true;
                let navigationExtras: NavigationExtras = {
                    queryParams: queryParams
                };
                this.ngZone.run(() => this.router.navigate([this.customId, 'dashboard'], navigationExtras));
            }
        } else {
            this.isClickedOnce = false;
            this.loadingPaytm = false;
            this.cdRef.detectChanges();
            console.log("status",this.checkIn_type)
            this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
            if (this.checkIn_type === 'appt_historybill') {
                let queryParams = {
                    uuid: this.uuid,
                    source: 'history'
                };
                let navigationExtras: NavigationExtras = {
                    queryParams: queryParams
                };
                this.ngZone.run(() => this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras));
            } else {
                let queryParams = {
                    uuid: this.uuid,
                    type: 'appointment',
                    'paidStatus': false,
                    'invoiceInfo':this.invoiceInfo
                };
                let navigationExtras: NavigationExtras = {
                    queryParams: queryParams
                };
                this.ngZone.run(() => this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras));
            }
        }
    }



    transactionCompleted(response, payload, accountId) {
        if (response.SRC) {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.razorpayService.updateRazorPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.finishTransaction(true);
                        }
                    },
                        error => {
                            // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                if (response.error && response.error.description) {
                    this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
                }
                this.finishTransaction(false);
            }
        } else {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.paytmService.updatePaytmPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.finishTransaction(true);
                        }
                    },
                        error => {
                            // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
                this.finishTransaction(false);
            }
        }
    }
    paytmPayment() {
        this.isClickedOnce = true;
        this.pay_data.uuid = this.invoiceInfo === 'false' ? this.uuid : this.invoiceDetailsById.invoiceUid,
        this.pay_data.amount = this.invoiceInfo === 'false' ? this.bill_data.amountDue : this.invoiceDetailsById.amountDue,
            this.pay_data.paymentMode = this.selected_payment_mode;
        this.pay_data.accountId = this.accountId;
        this.pay_data.purpose = this.invoiceInfo === 'false' ? 'billPayment' : 'financeInvoicePayment'
        this.pay_data.isInternational = this.isInternatonal;
        this.pay_data.serviceId = 0;
        this.resetApiError();
        if (this.pay_data.uuid != null &&
            this.pay_data.paymentMode != null &&
            this.pay_data.amount !== 0) {
            this.api_success = Messages.PAYMENT_REDIRECT;
            this.gateway_redirection = true;
            if(this.invoiceInfo === 'false'){
                this.subs.sink = this.consumerService.consumerPayment(this.pay_data)
                .subscribe(
                    (data: any) => {
                        this.payment_popup = this._sanitizer.bypassSecurityTrustHtml(data['response']);
                        this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_SUCC_REDIRECT'), { 'panelClass': 'snackbarnormal' });
                        setTimeout(() => {
                            this.document.getElementById('paytmform').submit();
                        }, 2000);
                    },
                    error => {
                        this.isClickedOnce = false;
                        this.resetApiError();
                        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                    }
                );
                }
                else if(this.invoiceInfo === 'true'){
                    this.pay_data.custId = this.invoiceDetailsById.providerConsumerId;
                    this.subs.sink = this.consumerService.consumerPayment_invocie(this.pay_data)
                    .subscribe(
                        (data: any) => {
                            this.payment_popup = this._sanitizer.bypassSecurityTrustHtml(data['response']);
                            this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_SUCC_REDIRECT'), { 'panelClass': 'snackbarnormal' });
                            setTimeout(() => {
                                this.document.getElementById('paytmform').submit();
                            }, 2000);
                        },
                        error => {
                            this.isClickedOnce = false;
                            this.resetApiError();
                            this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                        }
                    );
                }
            
        }

    }
    paywithRazorpay(pData: any) {
        this.isClickedOnce = true;
        this.loadingPaytm = true;
        pData.paymentMode = this.selected_payment_mode;
        this.razorpayService.initializePayment(pData, this.accountId, this);
    }

    resetApiError() {
        this.api_success = null;
    }
    /**
   * Apply Jaldee Coupon
   */
    applyJCoupon() {
        if (this.checkCouponValid(this.jCoupon)) {

            this.applyAction(this.jCoupon, this.checkin.uuid);
        } else {
            this.snackbarService.openSnackBar('Enter a Coupon', { 'panelClass': 'snackbarerror' });
        }
    }
    clearJCoupon() {
        this.jCoupon = '';
    }
    /**
     * Perform Bill Actions
     * @param action Action Type
     * @param uuid Bill Id
     * @param data Data to be sent as request body
     */
    applyAction(action, uuid) {
        return new Promise<void>((resolve, reject) => {
            this.subs.sink = this.consumerService.applyCoupon(action, uuid, this.accountId).subscribe
                (billInfo => {
                    this.checkin = billInfo;
                    this.getAppointmentBill();
                    this.clearJCoupon();
                    resolve();
                },
                    error => {
                        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                        reject(error);
                    });
        });
    }
    /**
     * To Print Receipt
     */
     printMe() {
        if(this.invoiceInfo === 'true'){
            const params = [
                'height=' + screen.height,
                'width=' + screen.width,
                'fullscreen=yes'
            ].join(',');
            const printWindow = window.open('', '', params);
            let bill_html = '';
            bill_html += '<table width="100%">';
            bill_html += '<tr><td	style="text-align:center;font-weight:bold; color:#000000; font-size:11pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-bottom:10px;">' + this.checkin.providerAccount['businessName'] + '</td></tr>';
            if (this.splocation) {
                bill_html += '<tr>'
                bill_html += '<td style="color:#000000; text-align:center; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif; text-transform: capitalize !important;">' + this.splocation + '</td>';
                '</tr>';
            }
            bill_html += '<div style="margin-rigth:10px!impportant;text-align:center;"><img src="' + this.logo + '" width="80px" style="border-radius:50%!important"></div>';
            bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
            bill_html += '<table width="100%">';
            bill_html += '	<tr style="line-height:20px">';
            bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (this.invoiceDetailsById?.providerConsumerData?.title? this.invoiceDetailsById.providerConsumerData.title:'')+ ' ' + (this.invoiceDetailsById?.providerConsumerData?.firstName? this.invoiceDetailsById.providerConsumerData.firstName:'') + ' ' + (this.invoiceDetailsById?.providerConsumerData?.lastName? this.invoiceDetailsById.providerConsumerData.lastName:'')  + '</td>';
            bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">Invoice Date :' + this.dateformat.transformToMonthlyDate(this.billdate) + '</td>';
            bill_html += '	</tr>';
            bill_html += '	<tr>';
            if (this.billnumber) {
                bill_html += '<td width="50%" style="text-align:left; color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + 'Invoice #  :' +
                    this.billnumber
                    + '</td>';   
            }
            if(this.invoiceDetailsById.departmentName){
                bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">Department :' + this.invoiceDetailsById.departmentName + '</td>';
            }  
            bill_html += '	</tr>';
            if(this.dueDate){
                bill_html += '	<tr style="line-height:20px">';
                bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">Due Date :' + this.dateformat.transformToMonthlyDate(this.dueDate) + '</td>';
                bill_html += '	</tr>';
            }         
            bill_html += '	<tr>';
            // bill_html += '<td style="color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">Bill #' + this.checkin.billId + '</td>';
            bill_html += '<td style="text-align:right;color:#000000; font-size:10pt;font-family:Ubuntu, Arial,sans-serif;">';
            if (this.checkin.gstNumber) {
                bill_html += 'GSTIN ' + this.checkin.gstNumber;
            }
            bill_html += '	</tr>';
            if (this.invoiceDetailsById.providerData) {
                bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + this.provider_label + ' :' +
                    ((this.invoiceDetailsById.providerData.businessName) ? this.invoiceDetailsById.providerData.businessName : this.invoiceDetailsById.providerData.firstName + ' ' + this.invoiceDetailsById.providerData.lastName)
                    + '</td>';   
            }           
            bill_html += '</td>';
            bill_html += '	</tr>';            
            bill_html += '	<tr>';
            if (this.invoiceDetailsById.billStatus && this.invoiceDetailsById.billStatus == 'Cancel') {
                bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' +
                   'Cancelled'
                    + '</td>';
    
    
            }
            if (this.invoiceDetailsById.billStatus && this.invoiceDetailsById.billStatus == 'Settled') {
                bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' +
                   'Settled'
                    + '</td>';
    
    
            }
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
            bill_html += '<tr><td style="border-bottom:1px solid #ddd;">';
            bill_html += '<table width="100%"';
            bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
            bill_html += '	<tr>';
            bill_html += '<td width="40%" style="text-align:right; font-weight:600 !important;">' + 'Service';
            bill_html += '</td>';
            bill_html += '<td width="15%" style="text-align:right; font-weight:600 !important;">' + 'Rate';
            bill_html += '</td>';
            bill_html += '<td width="15%" style="text-align:right; font-weight:600 !important;">' + 'Quantity' + '</td>';
            bill_html += '<td width="30%" style="text-align:right; font-weight:600 !important;">' + 'Price' + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
            for (const service of this.invoiceDetailsById.serviceList) {
                bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
                bill_html += '	<tr >';
                bill_html += '<td width="40%"';
                bill_html += '	style="text-align:right;font-weight:bold;">';
                bill_html += service.serviceName;
                if (service.getGSTpercentage > 0) {
                    bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
                }
                bill_html += '</td>';
                bill_html += '<td width="15%"';
                bill_html += '	style="text-align:right">' + ' &#x20b9;' + parseFloat(service.price).toFixed(2);
                bill_html += '</td>';
                bill_html += '<td width="15%"';
                bill_html += '	style="text-align:right">' + service.quantity;
                bill_html += '</td>';
                bill_html += '<td width="30%"';
                bill_html += '	style="text-align:right">&#x20b9;' + (service.quantity * service.price).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                if (service.discount && service.discount.length > 0) {
                    for (const serviceDiscount of service.discount) {
                        bill_html += '	<tr style="color:#aaa">';
                        bill_html += '<td style="text-align:right;"';
                        bill_html += '	colspan="2">' + serviceDiscount.name + '</td>';
                        bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(serviceDiscount.discountValue).toFixed(2);
                        bill_html += '</td>';
                        bill_html += '	</tr>';
                    }
    
                    bill_html += '	<tr style="line-height:0;">';
                    bill_html += '<td style="text-align:right" colspan="2"></td>';
                    bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
                    bill_html += '	</tr>';
                    bill_html += '	<tr style="font-weight:bold">';
                    bill_html += '<td style="text-align:right"colspan="2">Sub Total</td>';
                    bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(service.netRate).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                }
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            for (const item of this.invoiceDetailsById.itemList) {
                bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
                bill_html += '	<tr>';
                bill_html += '<td width="50%" style="text-align:left;font-weight:bold;">' + item.itemName + ' @ &#x20b9;' + parseFloat(item.price).toFixed(2);
                if (item.GSTpercentage > 0) {
                    bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
                }
                bill_html += '</td>';
                bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + (item.quantity * item.price).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                if(item.discount && item.discount.length>0){
                for (const itemDiscount of item.discount) {
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td style="text-align:right" colspan="2">' + itemDiscount.name + '</td>';
                    bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(itemDiscount.discountValue).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                }
            }
                if (item.discount && item.discount.length > 0) {
                    bill_html += '	<tr style="line-height:0;">';
                    bill_html += '<td style="text-align:right" colspan="2"></td>';
                    bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
                    bill_html += '	</tr>';
                    bill_html += '	<tr style="font-weight:bold">';
                    bill_html += '<td style="text-align:right" colspan="2">Sub Total</td>';
                    bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                }
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            for (const item of this.invoiceDetailsById.adhocItemList) {
                bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
                bill_html += '	<tr>';
                bill_html += '<td width="50%" style="text-align:left;font-weight:bold;">' + item.itemName + ' @ &#x20b9;' + parseFloat(item.price).toFixed(2);
                if (item.GSTpercentage > 0) {
                    bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
                }
                bill_html += '</td>';
                bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + (item.quantity * item.price).toFixed(2) + '</td>';
                bill_html += '	</tr>';
               
                
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:5px">                                                                             ';
            bill_html += '	<tr style="font-weight: bold">';
            bill_html += '<td width="70%" style="text-align:right">Gross Amount</td>';
            bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.invoiceDetailsById.netTotal).toFixed(2) + '</td>';
            bill_html += '	</tr>                                                                           ';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
    
            if (this.invoiceDetailsById.jdn && this.invoiceDetailsById.jdn.discount) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                bill_html += '	<tr style="color:#aaa">';
                bill_html += '<td width="70%" style="text-align:right">JDN</td>';
                bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(this.invoiceDetailsById.jdn.discount).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            for (const billDiscount of this.invoiceDetailsById.discounts) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                bill_html += '	<tr style="color:#aaa">';
                bill_html += '<td width="70%" style="text-align:right">' + billDiscount.name + '</td>';
                bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(billDiscount.discValue).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.providerCoupons) {
                // for (const providerCoupon of this.bill_data.providerCoupon) {
                for (const coupon of this.invoiceDetailsById.providerCoupons) {
                    bill_html += '	<tr><td>';
                    bill_html += '<table width="100%" style="color:#000000; font-size:10pt;  font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td width="70%" style="text-align:right">' + coupon.couponCode + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(coupon.discount).toFixed(2) + '</td>';
                    bill_html += '	</tr>                                                                           ';
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            if (this.invoiceDetailsById.jaldeeCoupons) {
                for (const jc of this.invoiceDetailsById.jaldeeCoupons) {
                    bill_html += '	<tr><td>';
                    bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td width="70%" style="text-align:right">' + jc.couponCode + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(jc.discount).toFixed(2) + '</td>';
                    bill_html += '	</tr>                                                                           ';
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            if (this.invoiceDetailsById.taxableTotal !== 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr>';
                bill_html += '<td width="70%" style="text-align:right">Tax ' + this.invoiceDetailsById.taxPercentage + ' % of &#x20b9;' + parseFloat(this.invoiceDetailsById.taxableTotal).toFixed(2) + '(CGST-' + (this.invoiceDetailsById.taxPercentage / 2) + '%, SGST-' + (this.invoiceDetailsById.taxPercentage / 2) + '%)</td>';
                bill_html += '<td width="30%" style="text-align:right">(+) &#x20b9;' + parseFloat(this.invoiceDetailsById.netTaxAmount).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.netRate > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;">';
                bill_html += '<td width="70%" style="text-align:right">Net Total</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.invoiceDetailsById.netRate).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.amountPaid > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;">';
                bill_html += '<td width="70%" style="text-align:right">Amount Paid</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.invoiceDetailsById.amountPaid).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.amountDue >= 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Amount Due</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.invoiceDetailsById.amountDue).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.amountDue < 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Refundable Amount</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.refund_value).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.invoiceDetailsById.refundedAmount > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Amount refunded</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.invoiceDetailsById.refundedAmount).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            bill_html += '</table>';
            printWindow.document.write('<html><head><title></title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(bill_html);
            printWindow.document.write('</body></html>');
            printWindow.moveTo(0, 0);
            printWindow.document.close();
            printWindow.print();
            if (this.smallmobileDevice || this.tabDeviceDisplay) {
                printWindow.addEventListener('click', () => {
                  printWindow.close();
                });
              } else {
                printWindow.close();
              }
        }
        else{
            const params = [
                'height=' + screen.height,
                'width=' + screen.width,
                'fullscreen=yes'
            ].join(',');
            const printWindow = window.open('', '', params);
            let bill_html = '';
            bill_html += '<table width="100%">';
            bill_html += '<tr><td	style="text-align:center;font-weight:bold; color:#000000; font-size:11pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-bottom:10px;">' + this.checkin.providerAccount['businessName'] + '</td></tr>';
            bill_html += '<div style="margin-rigth:10px!impportant;"><img src="' + this.logo + '" width="80px" style="border-radius:50%!important"></div>';
            bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
            bill_html += '<table width="100%">';
            bill_html += '	<tr style="line-height:20px">';
            bill_html += '<td width="50%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif;">' + (this.checkin?.appmtFor[0]?.title ? this.checkin.appmtFor[0].title:'') + ' '+(this.checkin?.appmtFor[0]?.firstName ? this.checkin.appmtFor[0].firstName:'') + ' ' + (this.checkin?.appmtFor[0]?.lastName? this.checkin.appmtFor[0].lastName:'') + '</td>';
            bill_html += '<td width="50%"	style="text-align:right;color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + this.dateformat.transformToMonthlyDate(this.billdate) + '</td>';
    
            bill_html += '	</tr>';
            bill_html += '	<tr>';
            // bill_html += '<td style="color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">Bill #' + this.checkin.billId + '</td>';
            bill_html += '<td style="text-align:right;color:#000000; font-size:10pt;font-family:Ubuntu, Arial,sans-serif;">';
            if (this.checkin.gstNumber) {
                bill_html += 'GSTIN ' + this.checkin.gstNumber;
            }
            bill_html += '	</tr>';
            bill_html += '	<tr>';
            if (this.splocation) {
                bill_html += '<td style="color:#000000; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif; text-transform: capitalize !important;">' + this.splocation + '</td>';
            }
            bill_html += '	<tr>';
            if (this.checkin.provider) {
                bill_html += '<td style="color:#000000;  text-transform: capitalize !important; font-size:10pt; font-family:"Ubuntu, Arial,sans-serif;">' + this.provider_label + ':' +
                    ((this.checkin.provider.businessName) ? this.checkin.provider.businessName : this.checkin.provider.firstName + ' ' + this.checkin.provider.lastName)
                    + '</td>';
    
    
            }
            bill_html += '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
            if(this.bill_data.service){
                for (const service of this.bill_data.service) {
                    bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
                    bill_html += '<table width="100%"';
                    bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
                    bill_html += '	<tr >';
                    bill_html += '<td width="50%"';
                    bill_html += '	style="text-align:left;font-weight:bold;">';
                    bill_html += service.serviceName + ' &#x20b9;' + parseFloat(service.price).toFixed(2);
                    if (service.getGSTpercentage > 0) {
                        bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
                    }
                    bill_html += '</td>';
                    bill_html += '<td width="20%"';
                    bill_html += '	style="text-align:right">Qty ' + service.quantity;
                    bill_html += '</td>';
                    bill_html += '<td width="30%"';
                    bill_html += '	style="text-align:right">&#x20b9;' + (service.quantity * service.price).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                    if (service.discount && service.discount.length > 0) {
                        for (const serviceDiscount of service.discount) {
                            bill_html += '	<tr style="color:#aaa">';
                            bill_html += '<td style="text-align:right;"';
                            bill_html += '	colspan="2">' + serviceDiscount.name + '</td>';
                            bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(serviceDiscount.discountValue).toFixed(2);
                            bill_html += '</td>';
                            bill_html += '	</tr>';
                        }
        
                        bill_html += '	<tr style="line-height:0;">';
                        bill_html += '<td style="text-align:right" colspan="2"></td>';
                        bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
                        bill_html += '	</tr>';
                        bill_html += '	<tr style="font-weight:bold">';
                        bill_html += '<td style="text-align:right"colspan="2">Sub Total</td>';
                        bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(service.netRate).toFixed(2) + '</td>';
                        bill_html += '	</tr>';
                    }
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            if(this.bill_data.items){
                for (const item of this.bill_data.items) {
                    bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
                    bill_html += '<table width="100%"';
                    bill_html += '	style="color:#000000; font-size:10pt; line-height:25px; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:10px">';
                    bill_html += '	<tr>';
                    bill_html += '<td width="50%" style="text-align:left;font-weight:bold;">' + item.itemName + ' @ &#x20b9;' + parseFloat(item.price).toFixed(2);
                    if (item.GSTpercentage > 0) {
                        bill_html += '<span style="font-size: .60rem;;font-weight: 600;color: #fda60d;"><sup> Tax</sup></span>';
                    }
                    bill_html += '</td>';
                    bill_html += '<td width="20%" style="text-align:right">Qty ' + item.quantity + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + (item.quantity * item.price).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                    if(item.discount && item.discount.length>0){
                    for (const itemDiscount of item.discount) {
                        bill_html += '	<tr style="color:#aaa">';
                        bill_html += '<td style="text-align:right" colspan="2">' + itemDiscount.name + '</td>';
                        bill_html += '<td style="text-align:right">(-) &#x20b9;' + parseFloat(itemDiscount.discountValue).toFixed(2) + '</td>';
                        bill_html += '	</tr>';
                    }
                }
                    if (item.discount && item.discount.length > 0) {
                        bill_html += '	<tr style="line-height:0;">';
                        bill_html += '<td style="text-align:right" colspan="2"></td>';
                        bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd">Â </td>';
                        bill_html += '	</tr>';
                        bill_html += '	<tr style="font-weight:bold">';
                        bill_html += '<td style="text-align:right" colspan="2">Sub Total</td>';
                        bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2) + '</td>';
                        bill_html += '	</tr>';
                    }
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
           
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:5px">                                                                             ';
            bill_html += '	<tr style="font-weight: bold">';
            bill_html += '<td width="70%" style="text-align:right">Gross Amount</td>';
            bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.bill_data.netTotal).toFixed(2) + '</td>';
            bill_html += '	</tr>                                                                           ';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
    
            if (this.bill_data.jdn && this.bill_data.jdn.discount) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                bill_html += '	<tr style="color:#aaa">';
                bill_html += '<td width="70%" style="text-align:right">JDN</td>';
                bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(this.bill_data.jdn.discount).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if(this.bill_data.discount){
                for (const billDiscount of this.bill_data.discount) {
                    bill_html += '	<tr><td>';
                    bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td width="70%" style="text-align:right">' + billDiscount.name + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(billDiscount.discValue).toFixed(2) + '</td>';
                    bill_html += '	</tr>';
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            
            if (this.bill_data.proCouponList) {
                // for (const providerCoupon of this.bill_data.providerCoupon) {
                for (const coupon of this.bill_data.proCouponList) {
                    bill_html += '	<tr><td>';
                    bill_html += '<table width="100%" style="color:#000000; font-size:10pt;  font-family:Ubuntu, Arial,sans-serif; padding-bottom:5px">';
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td width="70%" style="text-align:right">' + coupon.couponCode + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(coupon.discount).toFixed(2) + '</td>';
                    bill_html += '	</tr>                                                                           ';
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            if (this.bill_data.jCouponList) {
                for (const jcoupon of this.bill_data.jCouponList) {
                    bill_html += '	<tr><td>';
                    bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                    bill_html += '	<tr style="color:#aaa">';
                    bill_html += '<td width="70%" style="text-align:right">' + jcoupon.couponCode + '</td>';
                    bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(jcoupon.discount).toFixed(2) + '</td>';
                    bill_html += '	</tr>                                                                           ';
                    bill_html += '</table>';
                    bill_html += '	</td></tr>';
                }
            }
            if (this.bill_data.taxableTotal !== 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr>';
                bill_html += '<td width="70%" style="text-align:right">Tax ' + this.bill_data.taxPercentage + ' % of &#x20b9;' + parseFloat(this.bill_data.taxableTotal).toFixed(2) + '(CGST-' + (this.bill_data.taxPercentage / 2) + '%, SGST-' + (this.bill_data.taxPercentage / 2) + '%)</td>';
                bill_html += '<td width="30%" style="text-align:right">(+) &#x20b9;' + parseFloat(this.bill_data.totalTaxAmount).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.bill_data.netRate > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;">';
                bill_html += '<td width="70%" style="text-align:right">Net Total</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.bill_data.netRate).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.bill_data.totalAmountPaid > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;">';
                bill_html += '<td width="70%" style="text-align:right">Amount Paid</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.bill_data.totalAmountPaid).toFixed(2) + '</td>';
                bill_html += '	</tr>';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.bill_data.amountDue >= 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Amount Due</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.bill_data.amountDue).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.bill_data.amountDue < 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Refundable Amount</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.refund_value).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            if (this.bill_data.refundedAmount > 0) {
                bill_html += '	<tr><td>';
                bill_html += '<table width="100%"';
                bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
                bill_html += '	<tr style="font-weight: bold;"> ';
                bill_html += '<td width="70%" style="text-align:right">Amount refunded</td>';
                bill_html += '<td width="30%" style="text-align:right">&#x20b9;' + parseFloat(this.bill_data.refundedAmount).toFixed(2) + '</td>';
                bill_html += '	</tr>                                                                           ';
                bill_html += '</table>';
                bill_html += '	</td></tr>';
            }
            bill_html += '</table>';
            printWindow.document.write('<html><head><title></title>');
            printWindow.document.write('</head><body >');
            printWindow.document.write(bill_html);
            printWindow.document.write('</body></html>');
            printWindow.moveTo(0, 0);
            printWindow.document.close();
            printWindow.print();
            if (this.smallmobileDevice || this.tabDeviceDisplay) {
                printWindow.addEventListener('click', () => {
                  printWindow.close();
                });
              } else {
                printWindow.close();
              }
        }
      
    }
    /**
     * Cash Button Pressed
     */
    cashPayment() {
        this.snackbarService.openSnackBar('Visit ' + this.getTerminologyTerm('provider') + ' to pay by cash', { 'panelClass': 'snackbarnormal' });
        setTimeout(() => {
            this.ngZone.run(() => this.router.navigate([this.customId, 'dashboard']));
            console.log('redirect to consumer');

        }, 1000);
    }

    checkCouponValid(couponCode) {
        let found = false;
        for (let couponIndex = 0; couponIndex < this.couponList.JC.length; couponIndex++) {
            if (this.couponList.JC[couponIndex].jaldeeCouponCode.trim() === couponCode.trim()) {
                found = true;
                break;
            }
        }
        for (let couponIndex = 0; couponIndex < this.couponList.OWN.length; couponIndex++) {
            if (this.couponList.OWN[couponIndex].couponCode.trim() === couponCode.trim()) {
                found = true;
                break;
            }
        }
        if (found) {
            return true;
        } else {
            return false;
        }
    }
    showJCCouponNote(coupon) {
        if (coupon.value.systemNote.length === 1 && coupon.value.systemNote.includes('COUPON_APPLIED')) {
        } else {
            if (coupon.value.value === '0.0') {
                this.dialog.open(JcCouponNoteComponent, {
                    width: '50%',
                    panelClass: ['commonpopupmainclass', 'confirmationmainclass', 'jcouponmessagepopupclass'],
                    disableClose: true,
                    data: {
                        jCoupon: coupon
                    }
                });
            }
        }
    }
    changeJcashUse(event) {
        if (event.checked) {
            this.checkJcash = true;
        } else {
            this.checkJcash = false;
        }
    }
}
