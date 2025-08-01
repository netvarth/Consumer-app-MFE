import { DOCUMENT, Location } from '@angular/common';
import { ChangeDetectorRef, Component, HostListener, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ConsumerService, DateFormatPipe, Messages, OrderService, PaytmService, projectConstantsLocal, RazorpayService, SharedService, ToastService, WordProcessor } from 'jconsumer-shared';
import { CouponNotesComponent } from '../../shared/coupon-notes/coupon-notes.component';

@Component({
    selector: 'app-bill',
    templateUrl: './bill.component.html',
    styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {
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
    razorpayEnabled = false;
    interNatioanalPaid = false;
    type;
    accountId;
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
    newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
    newDateFormat_date = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
    billTitle = 'Invoice';
    terminologiesjson: any;
    checkJcash = false;
    checkJcredit = false;
    jaldeecash: any;
    jcashamount: any;
    jcreditamount: any;
    remainingadvanceamount;
    wallet: any;
    splocation: any;
    loadingPaytm = false;
    isClickedOnce = false;
    @ViewChild('consumer_orderbill') paytmview;
    paymentmodes: any;
    paymode = false;
    customer_countrycode: any;
    selected_payment_mode: any;
    isInternatonal: boolean;
    shownonIndianModes: boolean;
    isPayment: boolean;
    indian_payment_modes: any;
    non_indian_modes: any;
    provider_label = ''
    theme: any;
    accountProfile: any;
    invoiceInfo;
    invoiceDetails: any;
    invoiceDetailsById: any = [];
    allInvocies: any;
    addnotedialogRef;
    invoiceId: any;
    smallmobileDevice = false;
    tabDeviceDisplay = false;
    desktopDeviceDisplay = false;
    storeLogo: any;
    ynwUuid: any;
    constructor(
        public _sanitizer: DomSanitizer,
        private wordProcessor: WordProcessor,
        private toastService: ToastService,
        private activated_route: ActivatedRoute,
        private dialog: MatDialog,
        private locationobj: Location,
        @Inject(DOCUMENT) public document,
        public razorpayService: RazorpayService,
        private cdRef: ChangeDetectorRef,
        private location: Location,
        public router: Router,
        private paytmService: PaytmService,
        private consumerService: ConsumerService,
        private sharedService: SharedService,
        public dateformat: DateFormatPipe,
        private orderService: OrderService
    ) {
        this.onResize();
        this.activated_route.params.subscribe(params => {
            this.uuid = params['id'];
        });
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
        this.activated_route.queryParams.subscribe(
            params => {
                console.log(params);
                if (params['paidStatus']) {
                    this.paidStatus = params['paidStatus'];
                }
                if (params['uuid']) {
                    this.uuid = params['uuid'];
                    console.log(this.uuid);
                }
                if (params['ynwUuid']) {
                    this.ynwUuid = params['ynwUuid'];
                }
                if (params['source']) {
                    this.source = params['source'];
                }
                if (params['accountId']) {
                    this.accountId = params['accountId'];
                }
                if (this.source === 'history') {
                    this.checkIn_type = 'order';
                }
                if (params['type']) {
                    this.checkIn_type = params['type'];
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
    }
    goBack() {
        this.location.back();
    }
    ngOnInit() {
        let config = this.sharedService.getTemplateJSON();
        if (config.theme) {
            this.theme = config.theme;
        }
        this.accountId = this.sharedService.getAccountID();
        this.getInvoice(this.accountId, this.uuid, this.ynwUuid);

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
    }
    getInvoice(accId, invoiceId, ynwUuid?) {
        if (ynwUuid) {
            this.orderService.getInvoiceByOrderYnwuuid(accId, invoiceId)
                .subscribe(data => {
                    this.invoiceDetailsById = data;
                    if (this.invoiceDetailsById && this.invoiceDetailsById.store && this.invoiceDetailsById.store.details && this.invoiceDetailsById.store.details.storeLogo && this.invoiceDetailsById.store.details.storeLogo.s3path) {
                        this.storeLogo = this.invoiceDetailsById.store.details.storeLogo.s3path;
                    }
                    if (this.invoiceDetailsById.amountDue < 0) {
                        this.refund_value = Math.abs(this.invoiceDetailsById.amountDue);
                    }
                    if (this.invoiceDetailsById.amountDue > 0) {
                        this.getJaldeeCashandCredit();
                    }
                    this.getInvoiceDateandTime();
                },
                    error => {
                        this.toastService.showError(error);
                    });
        } else {
            this.orderService.getInvoiceByOrderUid(accId, invoiceId)
                .subscribe(data => {
                    this.invoiceDetailsById = data[0];
                    if (this.invoiceDetailsById && this.invoiceDetailsById.store && this.invoiceDetailsById.store.details && this.invoiceDetailsById.store.details.storeLogo &&  this.invoiceDetailsById.store.details.storeLogo.s3path) {
                        this.storeLogo = this.invoiceDetailsById.store.details.storeLogo.s3path;
                    }
                    if (this.invoiceDetailsById.amountDue < 0) {
                        this.refund_value = Math.abs(this.invoiceDetailsById.amountDue);
                    }
                    if (this.invoiceDetailsById.amountDue > 0) {
                        this.getJaldeeCashandCredit();
                    }
                    this.getInvoiceDateandTime();

                },
                    error => {
                        this.toastService.showError(error);
                    });
        }
    }
    getInvoiceDateandTime() {
        if (this.invoiceDetailsById.hasOwnProperty('invoiceDate')) {
            this.billdate = this.invoiceDetailsById.invoiceDate;
            const datearr = this.invoiceDetailsById.invoiceDate.split(' ');
            const billdatearr = datearr[0].split('-');
            this.billtime = datearr[1] + ' ' + datearr[2];
            this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
        }
        if (this.invoiceDetailsById.hasOwnProperty('invoiceId')) {
            this.billnumber = this.invoiceDetailsById.invoiceNum;
        }
        if (this.invoiceDetailsById.taxSettings && this.invoiceDetailsById.taxSettings.gstNumber) {
            this.gstnumber = this.invoiceDetailsById.taxSettings.gstNumber;
        }
        if (this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.businessName) {
            this.bname = this.invoiceDetailsById.accountProfile.businessName;
        }
        if (this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.location && this.invoiceDetailsById.accountProfile.location.place) {
            this.splocation = this.invoiceDetailsById.accountProfile.location.place;
        }
    }
    stringtoDate(dt, mod) {
        let dtsarr;
        if (dt) {
            dtsarr = dt.split(' ');
            const dtarr = dtsarr[0].split('-');
            let retval = '';
            if (mod === 'all') {
                retval = dtarr[2] + '/' + dtarr[1] + '/' + dtarr[0] + ' ' + dtsarr[1] + ' ' + dtsarr[2];
            } else if (mod === 'date') {
                retval = dtarr[2] + '/' + dtarr[1] + '/' + dtarr[0];
            } else if (mod === 'time') {
                retval = dtsarr[1] + ' ' + dtsarr[2];
            }
            return retval;
        } else {
            return null;
        }
    }
    resetApiErrors() {
        this.api_error = null;
        this.api_success = null;
    }
    showJCWorkbench() {
        this.showJCouponSection = true;
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
    /**
     * To Get Payment Modes
     */
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
        this.consumerService.getPaymentModesofProvider(this.accountId, 0, 'financeInvoicePayment')
            .subscribe(
                data => {
                    this.paymentmodes = data[0];
                    this.isPayment = true;
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

                }
            );
    }
    /**
     * Perform PayU Payment
     */


    payuPayment(paymentType?) {
        this.isClickedOnce = true;
        if (this.jcashamount > 0 && this.checkJcash) {
            this.consumerService.getRemainingPrepaymentAmount(this.checkJcash, this.checkJcredit, this.invoiceDetailsById.amountDue)
                .subscribe(data => {
                    this.remainingadvanceamount = data;
                    if (this.remainingadvanceamount == 0 && this.checkJcash) {
                        const postData = {
                            'amountToPay': this.invoiceDetailsById.amountDue,
                            'accountId': this.accountId,
                            'uuid': this.invoiceDetailsById.invoiceUid,
                            'paymentPurpose': 'financeInvoicePayment',
                            'isJcashUsed': true,
                            'isreditUsed': false,
                            'paymentMode': 'JCASH',
                            'serviceId': 0,
                            'isinternational': this.isInternatonal,

                        };
                        this.consumerService.PayByJaldeewallet(postData)
                            .subscribe(data => {
                                this.loadingPaytm = false;
                                this.wallet = data;
                                if (!this.wallet.isGateWayPaymentNeeded && this.wallet.isJCashPaymentSucess) {
                                    this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
                                    this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
                                }
                            },
                                error => {
                                    this.isClickedOnce = false;
                                    this.loadingPaytm = false;
                                    this.toastService.showError(error);
                                });
                    } else if (this.remainingadvanceamount > 0 && this.checkJcash) {
                        if (this.selected_payment_mode && this.selected_payment_mode.toLowerCase() === 'cash') {
                            this.cashPayment();
                        } else {
                            const postData = {
                                'amountToPay': this.invoiceDetailsById.amountDue,
                                'accountId': this.accountId,
                                'uuid': this.invoiceDetailsById.invoiceUid,
                                'paymentPurpose': 'financeInvoicePayment',
                                'isJcashUsed': true,
                                'isreditUsed': false,
                                'serviceId': 0,
                                'isinternational': this.isInternatonal,
                                'paymentMode': this.selected_payment_mode
                            };

                            this.consumerService.PayByJaldeewallet(postData)
                                .subscribe((pData: any) => {
                                    this.origin = 'consumer';
                                    this.pGateway = pData.paymentGateway;

                                    if (pData.isGateWayPaymentNeeded == true && pData.isJCashPaymentSucess == true) {
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
                                        this.toastService.showError(error);
                                    });
                        }
                    }
                },
                    error => {
                        this.isClickedOnce = false;
                        this.loadingPaytm = false;
                        this.toastService.showError(error);
                    });
        }
        else {
            if (this.selected_payment_mode && this.selected_payment_mode.toLowerCase() === 'cash') {
                this.cashPayment();
            } else {
                this.pay_data.uuid = this.invoiceDetailsById.invoiceUid;
                this.pay_data.amount = this.invoiceDetailsById.amountDue;
                this.pay_data.paymentMode = this.selected_payment_mode;;
                this.pay_data.accountId = this.accountId;
                this.pay_data.purpose = 'financeInvoicePayment';
                this.pay_data.isinternational = this.isInternatonal;
                this.pay_data.serviceId = 0;
                this.resetApiError();

                if (this.pay_data.uuid != null &&
                    this.pay_data.paymentMode != null &&
                    this.pay_data.amount !== 0) {
                    this.api_success = Messages.PAYMENT_REDIRECT;
                    this.gateway_redirection = true;

                    this.consumerService.consumerPayment_invocie(this.pay_data)
                        .subscribe(
                            (data: any) => {
                                this.origin = 'consumer';
                                this.pGateway = data.paymentGateway;
                                console.log("Gatway :", this.pGateway)
                                if (this.pGateway !== 'PAYTM') {
                                    this.paywithRazorpay(data);
                                } else {
                                    this.payWithPayTM(data, this.accountId);
                                }
                            },
                            error => {
                                this.isClickedOnce = false;
                                this.resetApiError();
                                this.loadingPaytm = false;
                                this.toastService.showError(error);
                            }
                        );
                } else if (!this.selected_payment_mode && this.invoiceDetailsById.amountDue > 0) {
                    this.toastService.showError('Please Choose Payment Option');
                    this.isClickedOnce = false;
                }
            }
        }
    }
    paywithRazorpay(pData: any) {
        this.isClickedOnce = true;
        this.loadingPaytm = true;
        pData.paymentMode = this.selected_payment_mode;
        this.razorpayService.initializePayment(pData, this.accountId, this);
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
        if (status) {
            this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
            const navigationExtras: NavigationExtras = {
                queryParams: {
                    uuid: this.uuid,
                    type: 'order',
                    'paidStatus': true
                }
            };
            if (this.checkIn_type === 'order') {
                // this.ngZone.run(() => 
                this.router.navigate([this.sharedService.getRouteID(), 'history'], { queryParams: { 'is_orderShow': 'true' } })
                // );
            } else {
                // this.ngZone.run(() => 
                this.router.navigate([this.sharedService.getRouteID(), 'dashboard'], navigationExtras);
                // );
            }
        } else {
            this.isClickedOnce = false;
            this.loadingPaytm = false;
            this.cdRef.detectChanges();
            this.toastService.showError("Transaction failed");
            // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
            if (this.checkIn_type === 'order') {
                const navigationExtras: NavigationExtras = {
                    queryParams: {
                        source: 'history'
                    }
                };
                // this.ngZone.run(() => 
                this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', this.uuid], navigationExtras)
                // );
            } else {
                const navigationExtras: NavigationExtras = {
                    queryParams: {
                        type: 'order',
                        'paidStatus': false
                    }
                };
                // this.ngZone.run(() => 
                this.router.navigate([this.sharedService.getRouteID(), 'order', 'bill', this.uuid], navigationExtras)
                // );
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
                            this.toastService.showError("Transaction failed");
                            // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                if (response.error && response.error.description) {
                    this.toastService.showError(response.error.description);
                    // this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
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
                            this.toastService.showError("Transaction failed");
                            // this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.toastService.showError(response.RESPMSG);
                // this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
                this.finishTransaction(false);
            }
        }
    }
    paytmPayment() {
        this.isClickedOnce = true;
        this.pay_data.uuid = this.invoiceDetailsById.invoiceUid,
            this.pay_data.amount = this.invoiceDetailsById.amountDue;
        this.pay_data.paymentMode = 'PPI';
        this.pay_data.accountId = this.accountId;
        this.pay_data.purpose = 'financeInvoicePayment';
        this.resetApiError();
        if (this.pay_data.uuid != null &&
            this.pay_data.paymentMode != null &&
            this.pay_data.amount !== 0) {
            this.api_success = Messages.PAYMENT_REDIRECT;
            this.gateway_redirection = true;
            this.consumerService.consumerPayment_invocie(this.pay_data)
                .subscribe(
                    data => {
                        this.payment_popup = this._sanitizer.bypassSecurityTrustHtml(data['response']);
                        this.toastService.showSuccess(this.wordProcessor.getProjectMesssages('CHECKIN_SUCC_REDIRECT'));
                        // this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_SUCC_REDIRECT'),{ 'panelClass': 'snackbarnormal' });
                        setTimeout(() => {
                            this.document.getElementById('paytmform').submit();
                        }, 2000);
                    },
                    error => {
                        this.isClickedOnce = false;
                        this.resetApiError();
                        this.toastService.showError(error);
                        // this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                    }
                );
        }
    }
    resetApiError() {
        this.api_success = null;
    }
    /**
   * Apply Jaldee Coupon
   */
    applyJCoupon() {
        if (this.checkCouponValid(this.jCoupon)) {
            this.applyAction(this.jCoupon, this.invoiceDetailsById.uuid);
        } else {
            this.toastService.showError('Coupon Invalid');
            // this.snackbarService.openSnackBar('Coupon Invalid', { 'panelClass': 'snackbarerror' });
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
            this.consumerService.applyCoupon(action, uuid, this.accountId).subscribe
                (billInfo => {
                    this.invoiceDetailsById = billInfo;
                    // this.getWaitlistBill();
                    this.clearJCoupon();
                    resolve();
                },
                    error => {
                        this.toastService.showError(error);
                        // this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                        reject(error);
                    });
        });
    }
    /**
     * To Print Receipt
     */
    printMe() {
        const params = [
            'height=' + screen.height,
            'width=' + screen.width,
            'fullscreen=yes'
        ].join(',');
        const printWindow = window.open('', '', params);
        let bill_html = '';
        bill_html += '<table width="100%">';
        bill_html += '<tr><td	style="display:flex;align-items:center;text-align:left;font-weight:bold; color:#000000; font-size:11pt; font-family:Ubuntu, Arial,sans-serif;gap:30px;">' +
            '<img src="' + this.storeLogo + ' "width="50px" height="50px" style="border-radius:50%!important">' + '<div style="display:flex;gap:150px;">' +
            '<div>' + '<div style="font-weight:600 !important">' + this.invoiceDetailsById.store.details.name + '</div>' +
            '<div style="font-weight:300 !important">' + this.invoiceDetailsById.store.details.locationName + '</div>' +
            '</div>' + '<div>' + '<div style="font-weight:500 !important;font-size:10pt; font-family:Ubuntu, Arial,sans-serif;text-transform: capitalize!important;">Invoice For: ' + this.invoiceDetailsById.orderFor.name + '</div>' +
            '<div style="font-weight:500 !important;font-size:10pt; font-family:Ubuntu, Arial,sans-serif;text-transform: capitalize!important;">Invoice Date: ' + this.dateformat.transformToMonthlyDate(this.billdate) + '</div>' +
            '<div style="font-weight:500 !important;font-size:10pt; font-family:Ubuntu, Arial,sans-serif;text-transform: capitalize!important;">Invoice No: #' + this.invoiceDetailsById.invoiceNum + '</div>' +
            '</div>' + '</div>'
        '</td></tr>';
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%">';
        bill_html += '	<tr style="line-height:20px">';
        bill_html += '	</tr>';
        bill_html += '	<tr>';
        bill_html += '<td style="text-align:right;color:#000000; font-size:10pt;font-family:Ubuntu, Arial,sans-serif;">';
        if (this.invoiceDetailsById.gstNumber) {
            bill_html += 'GSTIN ' + this.invoiceDetailsById.gstNumber;
        }
        bill_html += '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
        bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
        bill_html += '<table width="100%"';
        bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
        bill_html += '	<tr>';
        bill_html += '<td width="30%" style="text-align:left;">' + 'Item';
        bill_html += '</td>';
        bill_html += '<td width="15%" style="text-align:left">' + 'Quantity' + '</td>';
        bill_html += '<td width="15%" style="text-align:left;">' + 'Price(₹)';
        bill_html += '</td>';
        bill_html += '<td width="15%" style="text-align:left;">' + 'Net Total(₹)';
        bill_html += '</td>';
        bill_html += '<td width="15%" style="text-align:right;">' + 'GST(₹)';
        bill_html += '</td>';
        bill_html += '<td width="15%" style="text-align:right">' + 'Total Amt(₹)' + '</td>';
        bill_html += '	</tr>';
        bill_html += '</table>';
        bill_html += '	</td></tr>';
        for (const item of this.invoiceDetailsById.items) {
            bill_html += '	<tr><td style="border-bottom:1px solid #ddd;">';
            bill_html += '<table width="100%"';
            bill_html += '	style="color:#000000; font-size:10pt; line-height:15px; font-family:Ubuntu, Arial,sans-serif; padding-top:5px;padding-bottom:5px">';
            bill_html += '	<tr>';
            bill_html += '<td width="30%" style="text-align:left;">' + item.orderItemDetails.spItem.name + '</td>';
            bill_html += '<td width="15%" style="text-align:left">' + item.quantity + '</td>';
            bill_html += '<td width="15%" style="text-align:left;">' + parseFloat(item.price).toFixed(2) + '</td>';
            bill_html += '<td width="15%" style="text-align:left;">' + parseFloat(item.totalAmount).toFixed(2) + '</td>';
            if (!item.taxAmount) {
                bill_html += '<td width="15%" style="text-align:right">' + '-' + '</td>';
            }
            if (item.taxAmount && item.taxAmount > 0) {
                bill_html += '<td width="15%" style="text-align:right">' + item.taxAmount + '</td>';
            }
            bill_html += '<td width="15%" style="text-align:right">' + (item.netRate).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            if (item.discount) {
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
                bill_html += '<td style="text-align:right; border-bottom:1px dotted #ddd"> </td>';
                bill_html += '	</tr>';
                bill_html += '	<tr style="font-weight:bold">';
                bill_html += '<td style="text-align:right" colspan="2">Sub Total</td>';
                bill_html += '<td style="text-align:right">&#x20b9;' + parseFloat(item.netRate).toFixed(2) + '</td>';
                bill_html += '	</tr>';
            }
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        bill_html += '	<tr><td>';
        bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; padding-top:10px;padding-bottom:5px">                                                                             ';
        bill_html += '	<tr style="">';
        bill_html += '<td width="70%" style="text-align:right">Subtotal</td>';
        bill_html += '<td width="30%" style="text-align:right;font-weight:bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.netTotal).toFixed(2) + '</td>';
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
            bill_html += '<td width="30%" style="text-align:right">(-) &#x20b9;' + parseFloat(billDiscount.discountValue).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
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
        if (this.invoiceDetailsById.taxTotal !== 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr>';
            bill_html += '<td width="70%" style="text-align:right">GST</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight:bold;">(+) &#x20b9;' + parseFloat(this.invoiceDetailsById.taxTotal).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.netTotalWithTax !== 0 && this.invoiceDetailsById.taxTotal !== 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr>';
            bill_html += '<td width="70%" style="text-align:right">Net Total With GST</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight:bold;">' + parseFloat(this.invoiceDetailsById.netTotalWithTax).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }

        if (this.invoiceDetailsById.providerCoupons) {
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
        if (this.invoiceDetailsById.deliveryCharges > 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style="">';
            bill_html += '<td width="70%" style="text-align:right">Delivery Charge</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight:bold;"> (+) &#x20b9;' + parseFloat(this.invoiceDetailsById.deliveryCharges).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.roundedValue != 0) {
            let roundedValue = parseFloat(this.invoiceDetailsById.roundedValue).toFixed(2);
            let formattedValue = this.invoiceDetailsById.roundedValue > 0 ? `₹+${roundedValue}` : `₹${roundedValue}`;

            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial, sans-serif; padding-bottom:5px">';
            bill_html += '	<tr>';
            bill_html += '<td width="70%" style="text-align:right">Rounded Value</td>';
            bill_html += `<td width="30%" style="text-align:right; font-weight: bold;">${formattedValue}</td>`;
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.netRate > 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style="">';
            bill_html += '<td width="70%" style="text-align:right">Net Total</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.netRate).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.processingFee > 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style="">';
            bill_html += '<td width="70%" style="text-align:right">Net Total</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.processingFee).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.amountPaid > 0 && !this.invoiceDetailsById.amountPaidWithProcessingFee) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style="">';
            bill_html += '<td width="70%" style="text-align:right">Amount Paid</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.amountPaid).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.amountPaid > 0 && this.invoiceDetailsById.amountPaidWithProcessingFee && this.invoiceDetailsById.amountPaidWithProcessingFee > 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%" style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style="">';
            bill_html += '<td width="70%" style="text-align:right">Amount Paid</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.amountPaidWithProcessingFee).toFixed(2) + '</td>';
            bill_html += '	</tr>';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.amountDue >= 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"';
            bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style=""> ';
            bill_html += '<td width="70%" style="text-align:right">Amount Due</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.amountDue).toFixed(2) + '</td>';
            bill_html += '	</tr>                                                                           ';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.amountDue < 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"';
            bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style=""> ';
            bill_html += '<td width="70%" style="text-align:right">Refundable Amount</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.refund_value).toFixed(2) + '</td>';
            bill_html += '	</tr>                                                                           ';
            bill_html += '</table>';
            bill_html += '	</td></tr>';
        }
        if (this.invoiceDetailsById.refundedAmount > 0) {
            bill_html += '	<tr><td>';
            bill_html += '<table width="100%"';
            bill_html += '	style="color:#000000; font-size:10pt; font-family:Ubuntu, Arial,sans-serif; ;padding-bottom:5px">';
            bill_html += '	<tr style=""> ';
            bill_html += '<td width="70%" style="text-align:right">Amount refunded</td>';
            bill_html += '<td width="30%" style="text-align:right;font-weight: bold;">&#x20b9;' + parseFloat(this.invoiceDetailsById.refundedAmount).toFixed(2) + '</td>';
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
    /**
     * Cash Button Pressed
     */
    cashPayment() {
        this.toastService.showSuccess(`Visit ${this.provider_label} to ${this.selected_payment_mode}`);
        // this.snackbarService.openSnackBar(`Visit ${this.provider_label} to ${this.selected_payment_mode}
        // `,{ 'panelClass': 'snackbarnormal' });
        setTimeout(() => {
            // this.ngZone.run(() => 
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
            // );
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
                this.dialog.open(CouponNotesComponent, {
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
    backtoProviderDetails() {
        this.locationobj.back();
    }
    changeJcashUse(event) {
        if (event.checked) {
            this.checkJcash = true;
        } else {
            this.checkJcash = false;
        }
    }

    getAmountInDecimalPoints(amount) {
        return parseFloat(amount).toFixed(2);
    }
}
