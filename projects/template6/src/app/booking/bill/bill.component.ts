import { DOCUMENT, Location } from "@angular/common";
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild, ChangeDetectorRef } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { ConsumerService, DateFormatPipe, ErrorMessagingService, Messages, PaytmService, projectConstantsLocal, RazorpayService, SharedService, ToastService, WordProcessor } from "jconsumer-shared";
import { Subscription } from "rxjs";
import { CouponNotesComponent } from "../../shared/coupon-notes/coupon-notes.component";
import { PrintService } from "./print.service";
import { BookingService } from "../booking.service";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

@Component({
    selector: 'app-bill',
    templateUrl: './bill.component.html',
    styleUrls: ['./bill.component.scss']
})
export class BillComponent implements OnInit, OnDestroy {

    @ViewChild('consumer_bill') paytmview;
    // @ViewChild('receipt') shareview?: ElementRef;
    loadingPaytm: boolean = false;
    smallmobileDevice: boolean = false;
    tabDeviceDisplay: boolean = false;
    desktopDeviceDisplay: boolean = false;
    provider_label: string = '';
    private subscriptions: Subscription = new Subscription();
    theme: any;
    accountID: any;
    logo: any;
    booking = {
        location: null,
        providerLabel: null,
        uid: null,
        info: null,
        invoice: null,
        invoiceExtras: {
            businessName: null,
            gstNumber: null,
            refundAmount: null,
            dueDate: null,
            _dueDate: null,
            billDate: null,
            _billDate: null,
            billTime: null,
            billNumber: null,
            invoiceNum:null,
            haveNotes: false,
            amountPaid: null,
            discounts: [],
            coupons: [],
            services: [],
            items: []
        },
        isAppointment: false,
        isInvoice: false,
        invoiceID: null,
        isPaid: false,
        isHistory: false,
        bookingFor: null,
        account: {
            logo: null
        },
        isDesktop: false
    }
    apiLoading: boolean = true;
    razorpay_order_id: any;
    razorpay_payment_id: any;
    razorpayDetails: any = [];
    paymentModes: any;
    isPayment: boolean;
    indianPaymentModes: any;
    internationalPaymentModes: any;
    shownonIndianModes: boolean;
    isInternatonal: boolean;
    selectedPaymentMode: any;
    payment_popup = null;
    showBillNotes: boolean = false;
    isClickedOnce: boolean;
    pGateway: any;
    couponList: any = {
        OWN: []
    };
    jCoupon: string = '';
    sub_tot_cap = Messages.SUB_TOT_CAP;
    qnty_cap = Messages.QTY_CAP;
    gross_amnt_cap = Messages.GROSS_AMNT_CAP;
    gstin_cap = Messages.GSTIN_CAP;
    newDateFormat_date = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
     fileDownloading = false;
    hideLocationGlobal: boolean = false;
    constructor(
        private sharedService: SharedService,
        private activatedRoute: ActivatedRoute,
        private router: Router,
        private location: Location,
        private wordProcessor: WordProcessor,
        private consumerService: ConsumerService,
        private toastService: ToastService,
        private errorService: ErrorMessagingService,
        private paytmService: PaytmService,
        private razorpayService: RazorpayService,
        private dialog: MatDialog,
        private printService: PrintService,
        private dateFormat: DateFormatPipe,
        private bookingService: BookingService,
        private cdRef: ChangeDetectorRef,
        @Inject(DOCUMENT) public document,
    ) {
        this.onResize();
        this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
        this.booking['providerLabel']= this.provider_label;
        let subs = this.activatedRoute.params.subscribe((params) => {
            if (params['id']) {
                this.initBookingAttributes(params['id']);
            }
        })
        this.subscriptions.add(subs);
        let subsQ = this.activatedRoute.queryParams.subscribe((qparams) => {
            if (qparams['invoiceId']) {
                this.booking['isInvoice'] = true;
                this.booking['invoiceID'] = qparams['invoiceId'];
            }
            if (qparams['paidStatus'] && qparams['paidStatus']=='true') {
                this.booking['isPaid'] = true;
            }
            if (qparams['details']) {
                this.razorpayDetails = JSON.parse(qparams['details']);
                this.razorpay_order_id = this.razorpayDetails.razorpay_order_id;
                this.razorpay_payment_id = this.razorpayDetails.razorpay_payment_id;
            }
        })
        this.subscriptions.add(subsQ);
    }

    clearInvoice() {
        this.booking['invoice'] = null;
        this.booking['invoiceExtras'] = {
            businessName: null,
            gstNumber: null,
            refundAmount: null,
            amountPaid: null,
            dueDate: null,
            _dueDate: null,
            billDate: null,
            _billDate: null,
            billTime: null,
            billNumber: null,
            invoiceNum:null,
            haveNotes: false,
            discounts: [],
            coupons: [],
            services: [],
            items: []
        }
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth <= 500) {
            this.smallmobileDevice = true;
            this.tabDeviceDisplay = false;
            this.desktopDeviceDisplay = false;
            this.booking['isDesktop'] = false;
        } else if (window.innerWidth > 500 && window.innerWidth <= 767) {
            this.smallmobileDevice = false;
            this.tabDeviceDisplay = true;
            this.desktopDeviceDisplay = false;
            this.booking['isDesktop'] = false;
        } else if (window.innerWidth > 767) {
            this.booking['isDesktop'] = true;
            this.smallmobileDevice = false;
            this.tabDeviceDisplay = false;
            this.desktopDeviceDisplay = true;
        }
    }
    initBookingAttributes(bookingID: string) {
        this.booking['uid'] = bookingID;
        if (bookingID.startsWith('h_')) {
            this.booking['isHistory'] = true;
        }
        if (bookingID.endsWith('appt')) {
            this.booking['isAppointment'] = true;
        }
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
    ngOnInit(): void {
        let account = this.sharedService.getAccountInfo();
        let accountProfile = this.sharedService.getJson(account['businessProfile']);
        this.accountID = this.sharedService.getAccountID();
        this.setLogo(accountProfile);
        let accountConfig = this.sharedService.getAccountConfig();
        if (accountConfig && accountConfig['theme']) {
            this.theme = accountConfig['theme'];
        }
        if (accountConfig?.locationVisible) {
            this.hideLocationGlobal = accountConfig?.locationVisible;
        }
        this.loadBookingInfo();
        if (!this.booking['isPaid']) {
            this.loadPaymentModes();
        }
    }
    setLogo(accountProfile: any) {
        if (accountProfile && accountProfile.businessLogo && accountProfile.businessLogo.length > 0) {
            this.booking.account.logo = accountProfile.businessLogo[0].s3path;
        }
    }
    getBookingInfo() {
        const _this = this;
        return new Promise(function (resolve) {
            if (_this.booking['isAppointment']) {
                let subs = _this.consumerService.getAppointmentByConsumerUUID(_this.booking['uid'], _this.accountID).subscribe(
                    (appointment: any) => {
                        _this.booking['bookingFor'] = appointment.appmtFor;
                        resolve(appointment);
                    }
                )
                _this.subscriptions.add(subs);
            } else {
                let subs = _this.consumerService.getCheckinByConsumerUUID(_this.booking['uid'], _this.accountID).subscribe(
                    (checkin: any) => {
                        _this.booking['bookingFor'] = checkin.waitlistingFor;
                        resolve(checkin);
                    }
                )
                _this.subscriptions.add(subs);
            }
        })
    }
    loadInvoice() {
        const _this=this;
        if (_this.booking['isInvoice']) {
            _this.getInvoice().then((invoice) => {
                _this.booking['invoice'] = invoice;
                _this.setInvoiceExtras(invoice);
                _this.apiLoading = false;
            })
        } else {
            _this.getBill().then((bill: any) => {
                _this.booking['invoice'] = bill;
                _this.setBillExtras(bill);
                _this.apiLoading = false;
            })
        }
    }
    loadBookingInfo() {
        const _this = this;
        this.getBookingInfo().then((booking: any) => {
            _this.booking['info'] = booking;
            _this.loadInvoice();
        })
    }

    setInvoiceExtras(invoice) {
        if (invoice.providerData) {
            this.booking['invoiceExtras']['providerName'] = (invoice.providerData?.businessName? invoice.providerData?.businessName : (invoice.providerData?.firstName + ' ' + invoice.providerData?.lastName));
        }                
        this.booking['invoiceExtras']['businessName'] = this.booking['info'].providerAccount['businessName'];
        if (invoice.amountDue < 0) {
            this.booking['invoiceExtras']['refundAmount'] = Math.abs(invoice.amountDue);
        }
        if (invoice.accountProfile.location && invoice.accountProfile.location.place) {
            this.booking['location'] = invoice.accountProfile.location.place;;
        }
        if (invoice.taxSettings && invoice.taxSettings.gstNumber) {
            this.booking['invoiceExtras']['gstNumber'] = invoice.taxSettings.gstNumber;
        }
        if (invoice.hasOwnProperty('invoiceDate')) {
            const datearr = invoice.invoiceDate.split(' ');
            const billdatearr = datearr[0].split('-');
            this.booking['invoiceExtras']['billDate'] = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
            this.booking['invoiceExtras']['_billDate'] = this.dateFormat.transformToMonthlyDate(this.booking['invoiceExtras']['billDate']);
            this.booking['invoiceExtras']['billTime'] = datearr[1] + ' ' + datearr[2];
        }
        if (invoice.hasOwnProperty('dueDate')) {
            this.booking['invoiceExtras']['dueDate'] = invoice.dueDate;
            this.booking['invoiceExtras']['_dueDate'] = this.dateFormat.transformToMonthlyDate(invoice.dueDate);
        }
        if (invoice.hasOwnProperty('invoiceId')) {
            this.booking['invoiceExtras']['billNumber'] = invoice.invoiceId;
        }
        if (invoice.discounts && invoice.discounts.length > 0) {
            this.booking['invoiceExtras']['discounts'] = invoice.discounts;
        }
        if (invoice.providerCoupons && invoice.providerCoupons.length > 0) {
            this.booking['invoiceExtras']['coupons'] = invoice.providerCoupons;
        }
        this.booking['invoiceExtras']['netTaxAmount'] = invoice.netTaxAmount;
        this.booking['invoiceExtras']['amountPaid'] = invoice.amountPaid;
        this.booking['invoiceExtras']['displayNote'] = invoice.notesForCustomer;
        let discountDisplayNotes = invoice.discounts?.some(discount => discount.displayNote);
        if (invoice.notesForCustomer || discountDisplayNotes) {
            this.booking['invoiceExtras']['haveNotes'] = true;
        }
        this.booking['invoiceExtras']['services']= invoice.serviceList;
        if (invoice.subServiceData){
            this.booking['invoiceExtras']['services'] = [...this.booking['invoiceExtras']['services'], ...invoice.subServiceData];
        }
        if (invoice.departmentName){
            this.booking['invoiceExtras']['departmentName'] = invoice.departmentName;
        }
         if (invoice.invoiceNum){
            this.booking['invoiceExtras']['invoiceNum'] = invoice.invoiceNum;
        }
        this.booking['invoiceExtras']['items']= invoice.itemList;
    }
    setBillExtras(bill) {
        if (bill.provider) {
        this.booking['invoiceExtras']['providerName'] = (bill.provider?.businessName? bill.provider?.businessName : (bill.provider?.firstName + ' ' + bill.provider?.lastName));
        }
        let discountDisplayNotes = bill.discount?.some(discount => discount.displayNote);
        if (bill.displayNote || discountDisplayNotes) {
            this.booking['invoiceExtras']['haveNotes'] = true;
        }
        if (bill.amountDue < 0) {
            this.booking['invoiceExtras']['refundAmount'] = Math.abs(bill.amountDue);
        }
        if (bill.accountProfile.location && bill.accountProfile.location.place) {
            this.booking['location'] = bill.accountProfile.location.place;
        }
        if (bill.hasOwnProperty('createdDate')) {
            const datearr = bill.createdDate.split(' ');
            const billdatearr = datearr[0].split('-');
            this.booking['invoiceExtras']['billDate'] = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
            this.booking['invoiceExtras']['_billDate'] = this.dateFormat.transformToMonthlyDate(this.booking['invoiceExtras']['billDate']);
            this.booking['invoiceExtras']['billTime'] = datearr[1] + ' ' + datearr[2];
        }
        if (bill.hasOwnProperty('gstNumber')) {
            this.booking['invoiceExtras']['gstNumber'] = bill.gstNumber;
        }
        this.booking['invoiceExtras']['businessName'] = this.booking['info'].providerAccount['businessName'];
        if (bill.hasOwnProperty('billId')) {
            this.booking['invoiceExtras']['billNumber'] = bill.billId;
        }
        if (bill.discount && bill.discount.length > 0) {
            this.booking['invoiceExtras']['discounts'] = bill.discount;
        }
        if (bill.proCouponList && bill.proCouponList.length > 0) {
            this.booking['invoiceExtras']['coupons'] = bill.proCouponList;
        }
        this.booking['invoiceExtras']['netTaxAmount'] = bill.totalTaxAmount;
        this.booking['invoiceExtras']['amountPaid'] = bill.totalAmountPaid;
        this.booking['invoiceExtras']['displayNote'] = bill.displayNote;
        this.booking['invoiceExtras']['services']= bill.service;
        if (bill.subServiceData){
            this.booking['invoiceExtras']['services'] = [...this.booking['invoiceExtras']['services'], ...bill.subServiceData];
        }
        if (bill.departmentName){
            this.booking['invoiceExtras']['departmentName'] = bill.departmentName;
        }
         if (bill.invoiceNum){
            this.booking['invoiceExtras']['invoiceNum'] = bill.invoiceNum;
        }
        this.booking['invoiceExtras']['items']= bill.items;

        console.log("this.booking['invoiceExtras']['items']",this.booking['invoiceExtras']['items']);
    }

    getInvoice() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            let subs = _this.bookingService.getBookingInvoiceDetailsByuuid(_this.accountID, _this.booking['invoiceID']).subscribe(
                (invoice) => {
                    resolve(invoice);
                }
            )
            _this.subscriptions.add(subs);
        })
    }

    getBill() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.booking['isAppointment']) {
                let subs = _this.consumerService.getApptBill(_this.booking['uid']).subscribe(
                    (bill) => {
                        resolve(bill);
                    }, (error) => { reject(error) }
                )
                _this.subscriptions.add(subs);
            } else {
                let subs = _this.consumerService.getWaitBill(_this.booking['uid']).subscribe(
                    (bill) => {
                        resolve(bill);
                    }, (error) => { reject(error) }
                )
                _this.subscriptions.add(subs);
            }
        })
    }

    loadPaymentModes() {
        let paymentType = this.booking['isInvoice'] ? 'financeInvoicePayment' : 'billPayment';
        this.consumerService.getPaymentModesofProvider(this.accountID, 0, paymentType).subscribe((paymentModes: any) => {
            this.paymentModes = paymentModes[0];
            this.isPayment = true;
            if (this.paymentModes.indiaPay) {
                this.indianPaymentModes = this.paymentModes.indiaBankInfo;
            }
            if (this.paymentModes.internationalPay) {
                this.internationalPaymentModes = this.paymentModes.internationalBankInfo;
            }
            if (!this.paymentModes.indiaPay && this.paymentModes.internationalPay) {
                this.shownonIndianModes = true;
            } else {
                this.shownonIndianModes = false;
            }
        });
    }

    goBack() {
        this.location.back();
    }
    printMe() {
        console.log("this.booking",this.booking);
        this.printService.print(this.booking);
    }
  async downloadMe() {
        this.fileDownloading = true;
        await new Promise(resolve => setTimeout(resolve, 100));
        this.cdRef.detectChanges();
        const doc: Document = (this.document as Document) || document;
        const htmlContainer = doc.getElementById('payment-receipt') as HTMLElement | null;
        if (!htmlContainer) {
            console.error('Element not found');
            this.fileDownloading = false;
            return;
        }
        htmlContainer.style.visibility = 'visible';
        try {
            const source = htmlContainer;
            const prevOverflow = source.style.overflow;
            const prevWidth = source.style.width;
            const prevMaxWidth = source.style.maxWidth;
            source.style.overflow = 'visible';
            // source.style.width = '794px';
            // source.style.maxWidth = '100%';

            const bounds = source.getBoundingClientRect();
            const options = {
                scale: 2,
                useCORS: true,
                backgroundColor: '#FFFFFF',
                width: source.scrollWidth || bounds.width,
                height: source.scrollHeight || bounds.height,
                windowWidth: source.scrollWidth || bounds.width,
                windowHeight: source.scrollHeight || bounds.height,
                scrollX: 0,
                scrollY: 0
            };
            let canvas;
            try {
                canvas = await html2canvas(source, options);
            } finally {
                source.style.overflow = prevOverflow;
                source.style.width = prevWidth;
                source.style.maxWidth = prevMaxWidth;
            }
            const marginPx = 24;
            const zoomedOutCanvas = doc.createElement('canvas');
            zoomedOutCanvas.width = canvas.width + marginPx * 2;
            zoomedOutCanvas.height = canvas.height + marginPx * 2;

            const ctx = zoomedOutCanvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, zoomedOutCanvas.width, zoomedOutCanvas.height);
                ctx.drawImage(canvas, marginPx, marginPx);
            }

            const imgData = zoomedOutCanvas.toDataURL('application/pdf');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            const canvasWidth = zoomedOutCanvas.width;
            const canvasHeight = zoomedOutCanvas.height;
            const canvasAspectRatio = canvasWidth / canvasHeight;
            const imgHeightOnPdf = pdfWidth / canvasAspectRatio;

            let heightLeft = imgHeightOnPdf;
            let position = 0;

            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
            heightLeft -= pdfHeight;

            while (heightLeft > 0) { 
                position -= pdfHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeightOnPdf);
                heightLeft -= pdfHeight;
            }

            pdf.save(this.getInvoiceFileName());
        } catch (error) {
            console.error('Error during PDF generation:', error);
            this.toastService.showError('Could not generate PDF');
            // this.snackbarService?.openSnackBar('Could not generate PDF', { panelClass: 'snackbarerror' });
        } finally {
            this.fileDownloading = false;
            htmlContainer.style.visibility = 'hidden';
            // htmlContainer!.innerHTML = '';
        }
    }
    private getInvoiceFileName(): string {
        const identifier = this.booking['invoiceExtras']['invoiceNum'] || this.booking['invoiceExtras']['billNumber'];
        return identifier ? `Invoice-${identifier}.pdf` : 'Invoice.pdf';
    }
    indian_payment_mode_onchange(event) {
        this.selectedPaymentMode = event.value;
        this.isInternatonal = false;
    }
    non_indian_modes_onchange(event) {
        this.selectedPaymentMode = event.value;
        this.isInternatonal = true;
    }
    togglepaymentMode() {
        this.shownonIndianModes = !this.shownonIndianModes;
        this.selectedPaymentMode = null;
    }
    billNotesClicked() {
        if (!this.showBillNotes) {
            this.showBillNotes = true;
        } else {
            this.showBillNotes = false;
        }
    }
    /**
 * Cash Button Pressed
 */
    cashPayment() {
        this.toastService.showSuccess('Visit ' + this.provider_label + ' to pay by cash');
        setTimeout(() => {
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
        }, 1000);
    }
    makePayment(paymentInput) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.booking['isInvoice']) {
                let subs = _this.bookingService.makePayment_booking(paymentInput).subscribe(
                    (response) => {
                        resolve(response);
                    }, (error) => { reject(error) }
                )
                _this.subscriptions.add(subs);
            } else {
                let subs = _this.consumerService.consumerPayment(paymentInput).subscribe(
                    (response) => {
                        resolve(response);
                    }, (error) => { reject(error) }
                )
                _this.subscriptions.add(subs);
            }
        })
    }
    /**
     * Perform PayU Payment
     */
    payuPayment(paymentType?) {
        const _this = this;
        this.isClickedOnce = true;
        if (this.selectedPaymentMode && this.selectedPaymentMode.toLowerCase() === 'cash') {
            this.cashPayment();
        } else {
            let paymentInput = {
                accountId: this.accountID,
                amount: this.booking['invoice'].amountDue,
                purpose: this.booking['isInvoice'] ? 'bookingInvoice' : 'billPayment',
                serviceId: 0,
                isInternational: this.isInternatonal,
                paymentMode: this.selectedPaymentMode,
                uuid: this.booking['isInvoice'] ? this.booking.invoiceID : this.booking['uid']
            };
            if (paymentInput.uuid != null && paymentInput.paymentMode != null && paymentInput.amount !== 0) {
                if (this.booking['isInvoice']) {
                    paymentInput['custId'] = this.booking['invoice'].providerConsumerId;
                }
                this.makePayment(paymentInput).then((paymentResponse: any) => {
                    if (paymentResponse.paymentGateway === 'RAZORPAY') {
                        _this.paywithRazorpay(paymentResponse);
                    } else {
                        _this.payWithPayTM(paymentResponse, this.accountID);
                    }
                }).catch((error) => {
                    this.isClickedOnce = false;
                    this.loadingPaytm = false;
                    let errorObj = this.errorService.getApiError(error);
                    this.toastService.showError(errorObj);
                });
            } else if (!this.selectedPaymentMode && this.booking['invoice'].amountDue > 0) {
                this.toastService.showError('Please Choose Payment Option');
                this.isClickedOnce = false;
            }
        }
    }
    paywithRazorpay(pData: any) {
        this.isClickedOnce = true;
        this.loadingPaytm = true;
        pData.paymentMode = this.selectedPaymentMode;
        this.razorpayService.initializePayment(pData, this.accountID, this);
    }
    payWithPayTM(pData: any, accountId: any) {
        this.isClickedOnce = true;
        this.loadingPaytm = true;
        pData.paymentMode = this.selectedPaymentMode;        
        this.paytmService.initializePayment(pData, accountId, this);
    }
    closeloading() {
        this.isClickedOnce = false;
        this.loadingPaytm = false;
    }
    finishTransaction(status) {
        if (status) {
            this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
            let queryParams = {};
            queryParams['paidStatus'] = true;
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard'], navigationExtras);
        } else {
            this.isClickedOnce = false;
            this.loadingPaytm = false;
            this.toastService.showError("Transaction failed");
            let queryParams = {
                'paidStatus': false
            };
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.router.navigate([this.sharedService.getRouteID(), 'bill', this.booking['uid']], navigationExtras);
        }
    }
    transactionCompleted(response, payload, accountId) {
        if (response.SRC) {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.razorpayService.updateRazorPay(payload, accountId).then((data) => {
                    if (data) {
                        this.finishTransaction(true);
                    }
                })
            } else if (response.STATUS == 'TXN_FAILURE') {
                if (response.error && response.error.description) {
                    this.toastService.showError(response.error.description);
                }
                this.finishTransaction(false);
            }
        } else {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.paytmService.updatePaytmPay(payload, accountId).then((data) => {
                    if (data) {
                        this.finishTransaction(true);
                    }
                })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.toastService.showError(response.RESPMSG);
                this.finishTransaction(false);
            }
        }
    }
    /**
* Apply Jaldee Coupon
*/
    applyJCoupon() {
        if (this.checkCouponValid(this.jCoupon)) {
            this.applyAction(this.jCoupon, this.booking['uid']);
        } else {
            this.toastService.showError('Enter a Coupon');
        }
    }
    clearJCoupon() {
        this.jCoupon = '';
    }

    checkCouponValid(couponCode) {
        let found = false;
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
    /**
    * Perform Bill Actions
    * @param action Action Type
    * @param uuid Bill Id
    * @param data Data to be sent as request body
    */
    applyAction(action, uuid) {
        let subs = this.consumerService.applyCoupon(action, uuid, this.accountID).subscribe
            (() => {
                this.apiLoading = true;
                this.clearInvoice();
                this.loadInvoice();
                this.clearJCoupon();
            }, (error) => {
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
            });
        this.subscriptions.add(subs);
    }
}
