import { Component, OnInit, Inject, OnDestroy, ViewChild, NgZone, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { AccountService, AuthService, CommonService, ConsumerService, DateTimeProcessor, ErrorMessagingService, FormMessageDisplayService, JGalleryService, LocalStorageService, Messages, PaytmService, projectConstantsLocal, QuestionaireService, RazorpayService, SharedService, StorageService, SubscriptionService, ToastService, WordProcessor } from 'jconsumer-shared';
import { Subscription } from 'rxjs';
import { IntlTelInputLoaderService } from '../shared/intl-tel-input-loader.service';

@Component({
    selector: 'app-donation',
    templateUrl: './donation.component.html',
    styleUrls: ['./donation.component.scss']
})
export class DonationComponent implements OnInit, OnDestroy {
    private subscriptions: Subscription = new Subscription();
    businessInfo: any = {}; // To hold Business Name, Location, Map Url etc.
    smallDevice;      // To know whether device is mobile or desktop
    selectedServiceId;// Id of the donation service
    selectedService: any; // To store selected donation service details
    locationId;       // Location id
    paymentMode: any; // Mode of donation payment
    loggedIn = true;  // To check whether user logged in or not
    loading = true;
    loadingPaytm: boolean;
    accountId;        // To hold the Account Id
    uniqueId;         // To hold the S3 Unique Id
    theme;            // Selected Theme
    serverDate;       // To store the server date
    from: string;
    from_iOS = false; // To know whether req came from ios custom app
    paymentWindow: Window; // to store window reference of the payment link page
    donationDate;
    parentCustomer: any;// logged in customer
    oneTimeInfo: any; // One time information
    onetimeQuestionnaireList: any; // one time information questionaire list
    questionAnswers; // questionaire answers
    questionnaireList: any = []; // normal questionaire list
    bookStep;       // To show the steps onetime info/take donation/questionaire etc
    donationId;        // Donation uuid
    api_loading_video;
    isInternational: boolean;
    shownonIndianModes: boolean;
    donorName = '';
    donorFirstName = '';
    donorLastName = '';
    firstNameRequired;
    lastNameRequired;
    consumerNote = '';// consumer note input
    isClickedOnce = false;
    paymentmodes: any;
    action = '';
    isPayment: boolean;
    indian_payment_modes: any;
    non_indian_modes: any;
    userEmail: any;
    userPhone: any;
    dialCode: any;
    @ViewChild('closebutton') closebutton;
    services: any;    // To store services json
    providerConsumerId; // id of the selected provider consumer 
    providerConsumerList: any;
    selectedPhone: any;
    phoneError = '';
    donationAmount;
    payEmail: any;
    image_list_popup;
    payEmail1: string;
    selectedMessage = {
        files: [],
        base64: [],
        caption: []
    }; // storing message to be uploaded
    emailerror: any;
    email1error: any;
    pGateway: any;
    confrmshow: boolean;
    api_loading: boolean;
    donorSelectedField: any;
    familyMembers: any = []; // hold the members
    amountPlaceHolder: any;
    @ViewChild('consumer_donation') paytmview;
    account: any;
    accountConfig: any;
    accountProfile: any;
    providerCustomerID: any;
    title: any;
    preferredCountries = ['in', 'uk', 'us'];
    separateDialCode = true;
    phoneNumber: string = '';
    cdnPath: string = '';

    constructor(
        public fed_service: FormMessageDisplayService,
        public dialog: MatDialog,
        public router: Router,
        public activatedRoute: ActivatedRoute,
        private wordProcessor: WordProcessor,
        private lStorageService: LocalStorageService,
        private toastService: ToastService,
        @Inject(DOCUMENT) public document,
        public _sanitizer: DomSanitizer,
        public razorpayService: RazorpayService,
        private location: Location,
        private paytmService: PaytmService,
        private cdRef: ChangeDetectorRef,
        private dateTimeProcessor: DateTimeProcessor,
        private ngZone: NgZone,
        private authService: AuthService,
        private sharedService: SharedService,
        private consumerService: ConsumerService,
        private questionaireService: QuestionaireService,
        private errorService: ErrorMessagingService,
        private storageService: StorageService,
        private subscriptionService: SubscriptionService,
        private accountService: AccountService,
        private commonService: CommonService,
        private galleryService: JGalleryService,
        public intlTelInputLoader: IntlTelInputLoaderService
    ) {
        this.cdnPath = this.sharedService.getCDNPath();
        const response = {
            ttype: 'hideLocation'
        }
        this.subscriptionService.sendMessage(response);
        this.activatedRoute.queryParams.subscribe(qparams => {
            if(qparams['service_id']){
                this.selectedServiceId = parseInt(qparams['service_id']);
            }
        })
    }
    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth <= 767) {
            this.smallDevice = true;
        } else {
            this.smallDevice = false;
        }
    }
    ngOnDestroy(): void {
        this.subscriptions.unsubscribe();
    }
    serviceSelected(service) {
        this.selectedServiceId = service.id;
        console.log("Donation Service:", service);
    }
    /**
     * Returns the family Members
     */
    initDonation() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.donationDate = _this.dateTimeProcessor.getToday(_this.serverDate);
            _this.image_list_popup = [];
            _this.storageService.getProviderConsumer().then((spConsumer: any) => {
                _this.providerConsumerId = spConsumer.id;
                _this.getPaymentModes();
                _this.setProfileInfo(spConsumer);
                _this.parentCustomer = spConsumer;
                _this.getConsumerQuestionnaire().then(
                    (data) => {
                        if (data) {
                            _this.questionnaireList = data;
                        }
                        resolve(true);
                    }
                );
            });
        })
    }
    setProfileInfo(data: any) {
        if (data !== undefined) {
            this.title = data.title;
            this.donorName = `${data.firstName || ''} ${data.lastName || ''}`.trim();
            this.donorFirstName = data.firstName;
            this.donorLastName = data.lastName;
            this.payEmail = data.email || '';
            this.userEmail = data.email || '';
            this.dialCode = data.countryCode || '';
            this.selectedPhone = {
                e164Number: (data.countryCode + data.phoneNo)
            }
            this.phoneNumber = data.phoneNo;
        }
        this.storageService.clear();
    }
    ngOnInit() {
        const _this = this;
        _this.serverDate = _this.lStorageService.getitemfromLocalStorage('sysdate');
        _this.account = _this.sharedService.getAccountInfo();
        _this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
        _this.accountConfig = _this.sharedService.getAccountConfig();
        if (_this.accountConfig && _this.accountConfig['theme']) {
            _this.theme = _this.accountConfig['theme'];
        }
        _this.accountId = _this.sharedService.getAccountID();
        _this.wordProcessor.setTerminologies(_this.sharedService.getTerminologies());
        let selectedLocation = this.accountService.getActiveLocation();
        this.locationId = selectedLocation.id;
        _this.businessInfo['businessName'] = _this.accountProfile.businessName;
        if (!_this.businessInfo['locationName']) {
            _this.businessInfo['locationName'] = _this.accountProfile.baseLocation?.place;
        }
        if (!_this.businessInfo['googleMapUrl']) {
            _this.businessInfo['googleMapUrl'] = _this.accountProfile.baseLocation?.googleMapUrl;
        }
        if (_this.accountProfile['logo']) {
            _this.businessInfo['logo'] = _this.accountProfile['logo'];
        }
        if (_this.lStorageService.getitemfromLocalStorage('ios')) {
            _this.from_iOS = true;
        }
        _this.services = _this.sharedService.getJson(_this.account['donationServices']);
        if (_this.services.length > 0) {
            if (!_this.selectedServiceId) {
                _this.selectedServiceId = _this.services[0].id;
            }
            _this.setServiceDetails(_this.selectedServiceId); // setting the details of the first service to the holding variable
        }
        _this.authService.goThroughLogin().then(
            (status) => {
                if (status) {
                    _this.initDonation().then(() => {
                        _this.getOneTimeInfo(_this.parentCustomer, _this.accountId).then(
                            (questions) => {
                                if (questions) {
                                    _this.onetimeQuestionnaireList = questions;
                                    if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                        _this.bookStep = 'profile';
                                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 'qnr';
                                    } else {
                                        _this.bookStep = 'donation';
                                    }
                                    _this.loggedIn = true;
                                } else {
                                    if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 'qnr';
                                    } else {
                                        _this.bookStep = 'donation';
                                    }
                                    _this.loggedIn = true;
                                }
                                _this.loading = false;
                            }
                        )
                    });
                } else {
                    this.loggedIn = false;
                    this.subscriptionService.sendMessage({ ttype: 'hideBookingsAndLocations' });
                }
            });
    }
    autoGrowTextZone(e) {
        e.target.style.height = "0px";
        e.target.style.height = (e.target.scrollHeight + 15) + "px";
    }
    getPaymentModes() {
        this.consumerService.getPaymentModesofProvider(this.accountId, this.selectedServiceId, 'donation')
            .subscribe(data => {
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
            }, () => {
                this.isPayment = false;
                console.log(this.isPayment);
            });
    }
    indian_payment_mode_onchange(event) {
        this.paymentMode = event.value;
        this.isInternational = false;
    }
    non_indian_modes_onchange(event) {
        this.paymentMode = event.value;
        this.isInternational = true;
    }
    togglepaymentMode() {
        this.shownonIndianModes = !this.shownonIndianModes;
        this.paymentMode = null;
    }
    saveDonorDetails() {
        this.resetApiErrors();
        let donorData = {};
        if (this.donorFirstName.trim() === '') {
            this.firstNameRequired = 'Please enter the first name';
            return;
        }
        if (this.donorLastName.trim() === '') {
            this.lastNameRequired = 'Please enter the last name';
            return;
        }
        donorData['firstName'] = this.donorFirstName.trim()
        donorData['lastName'] = this.donorLastName.trim();
        this.phoneError = '';
        if (this.selectedPhone) {
            if (this.selectedPhone.e164Number) {
                this.phoneNumber = this.selectedPhone.e164Number.split(this.selectedPhone['dialCode'])[1];
            }
        }
        const pattern = new RegExp(projectConstantsLocal.VALIDATOR_NUMBERONLY);
        const result = pattern.test(this.phoneNumber);
        const pattern1 = new RegExp(projectConstantsLocal.VALIDATOR_PHONENUMBERCOUNT10);
        const result1 = pattern1.test(this.phoneNumber);
        if (this.phoneNumber === '') {
            this.phoneError = Messages.BPROFILE_PHONENO;
            return;
        }
        if (!result) {
            this.phoneError = 'Please enter valid phone number';
            return;
        }
        if (!result1) {
            this.phoneError = Messages.BPROFILE_PRIVACY_PHONE_10DIGITS; // 'Mobile number should have 10 digits';
            return;
        }
        donorData['phoneNo'] = this.phoneNumber;
        donorData['countryCode'] = this.selectedPhone['dialCode'] ? this.selectedPhone['dialCode'] : this.dialCode ? this.dialCode : '+91';
        this.resetApiErrors();
        const stat = this.validateEmail(this.payEmail);
        const stat1 = this.validateEmail(this.payEmail1);
        if (this.payEmail === '' || !stat) {
            this.emailerror = 'Please enter a valid email.';
            return;
        }
        if ((this.payEmail1 === '' || !stat1) && this.confrmshow) {
            this.email1error = 'Please enter a valid email.';
            return;
        }
        if (stat && stat1) {
            if (this.payEmail === this.payEmail1) {
                donorData['email'] = this.payEmail;
            } else {
                this.email1error = 'Email and Re-entered Email do not match';
                return;
            }
        }
        else if (this.userEmail && this.userEmail != '') {
            donorData['email'] = this.userEmail
        }
        console.log("donorData", donorData)
        this.setProfileInfo(donorData);
        this.closebutton.nativeElement.click();
    }
    resetData() {
        this.setProfileInfo(this.parentCustomer)
    }
    editDonor(email: any, name: any, phone: any) {
        this.action = 'donor';
        this.action = 'phone';
        this.action = 'email';
        this.confrmshow = false;
        this.payEmail = email;
        this.payEmail1 = '';
    }
    validateEmail(mail) {
        const emailField = mail;
        const reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(emailField) === false) {
            return false;
        }
        return true;
    }
    resetApiErrors() {
        this.emailerror = null;
        this.email1error = null;
        this.phoneError = '';
    }
    setServiceDetails(curservid) {
        console.log(this.services);
        
        this.selectedService = this.services.filter(service => service.id === curservid)[0];
        console.log("Selected Service:", this.selectedService);
        
    }
    showConfrmEmail() {
        this.confrmshow = true;
    }
    handleConsumerNote(vale) {
        this.consumerNote = vale.trim();
    }
    goToGateway() {
        this.isClickedOnce = true;
        if (!this.paymentMode) {
            this.toastService.showError('Please select a payment mode');
            this.isClickedOnce = false;
            return false;
        }
        if (this.selectedServiceId) {
        } else {
            this.toastService.showError('Donation service is not found');
            return false;
        }

        let paymenttype = this.paymentMode;
        this.donate(paymenttype);
        return true;
    }
    donate(paymentWay) {
        const post_Data = {
            'consumer': {
                'id': this.parentCustomer.jaldeeConsumer
            },
            'proConsumerId': this.providerConsumerId,
            'service': {
                'id': this.selectedServiceId
            },
            'location': {
                'id': this.locationId
            },
            'date': this.donationDate,
            'donationAmount': this.donationAmount,
            'donor': {
                'firstName': this.donorFirstName,
                'lastName': this.donorLastName
            },
            'countryCode': this.dialCode,
            'donorPhoneNumber': this.phoneNumber,
            'note': this.consumerNote,
            'donorEmail': this.userEmail
        };
        console.log("Donation Data :", post_Data);
        if (this.donationAmount) {
            this.addDonationConsumer(post_Data, paymentWay);
        } else {
            this.isClickedOnce = false;
            this.toastService.showError('Please enter valid donation amount');
        }
    }
    validate(event) {
        this.donationAmount = event.target.value;
    }
    addDonationConsumer(post_Data, paymentWay) {
        const _this = this;
        _this.api_loading = true;
        if (_this.from_iOS) {
            delete post_Data['providerConsumer'];
            _this.consumerService.generateDonationLink(_this.accountId, post_Data).subscribe(
                (paymentLinkResponse: any) => {
                    console.log("Payment Link:", paymentLinkResponse);
                    _this.donationId = paymentLinkResponse['uuid'];
                    _this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                _this.submitQuestionnaire(_this.donationId, post_Data).then(
                                    (status1) => {
                                        if (status1) {
                                            _this.openPaymentLink(_this.sharedService.getRouteID(), post_Data['service'].id, paymentLinkResponse.paylink);
                                        }
                                    });
                            }
                        }
                    )
                }, error => {
                    _this.isClickedOnce = false;
                    let errorObj = this.errorService.getApiError(error);
                    this.toastService.showError(errorObj);
                });
        } else {
            const paymentWay = _this.paymentMode;
            console.log("Going to call donation link:", paymentWay);
            let subs = _this.consumerService.addCustomerDonation(post_Data, _this.accountId)
                .subscribe(data => {
                    _this.donationId = data['uid'];
                    _this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                _this.submitQuestionnaire(_this.donationId, post_Data).then(
                                    (status1) => {
                                        if (status1) {
                                            _this.consumerPayment(_this.donationId, post_Data, paymentWay);
                                        }
                                    });
                            }
                        }
                    )
                }, error => {
                    _this.isClickedOnce = false;
                    let errorObj = this.errorService.getApiError(error);
                    this.toastService.showError(errorObj);
                });
            this.subscriptions.add(subs);
        }
    }
    isDonationSuccess(paylink) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.consumerService.getDonationLinkUuid(paylink).subscribe(
                (donationInfo: any) => {
                    if (donationInfo.donationStatus !== 'PROCESSING') {
                        resolve(true);
                    } else {
                        resolve(false);
                    }
                }
            )
        })

    }
    openPaymentLink(businessId, serviceId, paylink, userId?) {
        const _this = this;
        const url = this.sharedService.getUIPath() + businessId + "/service/" + serviceId + "/pay/" + paylink;
        _this.paymentWindow = window.open(url, "_blank", "location=no,fullscreen=yes,toolbar=no,resizable=no;menubar=no,titlebar=no");
        let easingLoop = setInterval(function () {
            _this.paymentWindow.onbeforeunload = function () {
                _this.isClickedOnce = false;
                clearInterval(easingLoop);
                _this.cdRef.detectChanges();
            }
            _this.isDonationSuccess(paylink).then(
                (status) => {
                    if (status) {
                        clearInterval(easingLoop);
                        _this.paymentWindow.close();
                        _this.isClickedOnce = false;
                        _this.cdRef.detectChanges();
                        _this.ngZone.run(() => _this.router.navigate([_this.sharedService.getRouteID(), 'dashboard']));
                    }
                });
        }, 3000);
    }

    consumerPayment(uid, post_Data, paymentWay) {
        const payInfo: any = {
            'amount': post_Data.donationAmount,
            'custId': this.parentCustomer.jaldeeConsumer,
            'paymentMode': paymentWay,
            'uuid': uid,
            'accountId': this.accountId,
            'source': 'Desktop',
            'purpose': 'donation',
            'serviceId': this.selectedServiceId
        };
        payInfo.isInternational = this.isInternational;
        this.lStorageService.setitemonLocalStorage('uuid', uid);
        this.lStorageService.setitemonLocalStorage('acid', this.accountId);
        this.lStorageService.setitemonLocalStorage('p_src', 'c_d');
        let subs = this.consumerService.consumerPayment(payInfo).subscribe((pData: any) => {
            this.pGateway = pData.paymentGateway;
            if (this.pGateway === 'RAZORPAY') {
                this.paywithRazorpay(pData);
            } else {
                if (pData['response']) {
                    this.payWithPayTM(pData, this.accountId);
                } else {
                    this.isClickedOnce = false;
                    this.toastService.showError(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'));
                }
            }
        }, error => {
            this.isClickedOnce = false;
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
        });
        this.subscriptions.add(subs);
    }

    paywithRazorpay(pData: any) {
        pData.paymentMode = this.paymentMode;
        this.razorpayService.initializePayment(pData, this.accountId, this);
    }
    payWithPayTM(pData: any, accountId: any) {
        this.loadingPaytm = true;
        pData.paymentMode = this.paymentMode;
        this.paytmService.initializePayment(pData, accountId, this);
    }
    finishDonation(status, response?) {
        if (status) {
            this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
            let queryParams = {
                uuid: this.donationId,
                "details": response
            };
            if (this.from) {
                queryParams['isFrom'] = this.from;
            }
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.ngZone.run(() => this.router.navigate([this.sharedService.getRouteID(), 'donation', 'confirm'], navigationExtras));
        } else {
            this.isClickedOnce = false;
            this.toastService.showError("Transaction failed");
            if (this.from) {
                this.ngZone.run(() => this.router.navigate([this.sharedService.getRouteID(), 'dashboard']));
            } else {
                this.isClickedOnce = false;
                this.loadingPaytm = false;
                this.cdRef.detectChanges();
                this.toastService.showError("Transaction failed");
                // this.ngZone.run(() => {
                //     const snackBar = this.snackbarService.openSnackBar("Transaction Failed", { 'panelClass': 'snackbarerror' });
                //     snackBar.onAction().subscribe(() => {
                //         snackBar.dismiss();
                //     })
                // });
            }
        }
    }
    transactionCompleted(response, payload, accountId) {
        if (response.SRC) {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.razorpayService.updateRazorPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.finishDonation(true, response);
                        }
                    }, () => {
                        this.toastService.showError("Transaction failed");
                    })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.finishDonation(false);
            }
        } else {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.paytmService.updatePaytmPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.finishDonation(true, response);
                        }
                    }, () => {
                        this.toastService.showError("Transaction failed");
                    })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.finishDonation(false);
            }
        }
    }
    closeloading() {
        this.isClickedOnce = false;
        this.loadingPaytm = false;
        this.cdRef.detectChanges();
        this.toastService.showError("Your payment attempt was cancelled.");
        // this.ngZone.run(() => {
        //     const snackBar = this.snackbarService.openSnackBar('Your payment attempt was cancelled.', { 'panelClass': 'snackbarerror' });
        //     snackBar.onAction().subscribe(() => {
        //         snackBar.dismiss();
        //     })
        // });
    }
    onReloadPage() {
        window.location.reload();
    }

    goBack(type?) {
        if (this.action == '') {
            if (this.bookStep === 'donation') {
                if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
                    this.bookStep = 'qnr';
                } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                    this.bookStep = 'profile';
                } else {
                    this.location.back();
                }
            } else if (this.bookStep === 'qnr') {
                if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                    this.bookStep = 'profile';
                } else {
                    this.location.back();
                }
            } else {
                this.location.back();
            }
        } else {
            setTimeout(() => {
                this.action = '';
            }, 500);
            if (this.closebutton) {
                this.closebutton.nativeElement.click();
            }
        }
    }
    showCheckinButtonCaption() {
        let caption = '';
        caption = 'Confirm';
        return caption;
    }
    handleEmail(email) {
        this.action = 'email';
        this.confrmshow = false;
        this.payEmail = email;
        this.payEmail1 = '';
    }
    consumerNoteAndFileSave(uuid) {
        const dataToSend: FormData = new FormData();
        let subs = this.consumerService.addConsumerWaitlistNote(this.accountId, uuid,
            dataToSend).subscribe(() => { },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    this.wordProcessor.apiErrorAutoHide(this, errorObj);
                }
            );
        this.subscriptions.add(subs);
    }
    isNumeric(evt) {
        return this.commonService.isNumericwithoutdot(evt);
    }
    isValid(evt) {
        console.log(evt);
        return this.commonService.isValid(evt);
    }
    changeService() {
        this.action = 'service';
    }
    getConsumerQuestionnaire() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            let subs = _this.consumerService.getDonationQuestionnaire(_this.selectedServiceId, _this.accountId).subscribe(data => {
                resolve(data);
            }, () => {
                resolve(false);
            });
            _this.subscriptions.add(subs);
        })
    }
    getQuestionAnswers(event) {
        this.questionAnswers = event;
    }
    submitQuestionnaire(uuid, post_Data) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                const dataToSend: FormData = new FormData();
                if (_this.questionAnswers.files) {
                    for (const pic of _this.questionAnswers.files) {
                        dataToSend.append('files', pic, pic['name']);
                    }
                }
                const blobpost_Data = new Blob([JSON.stringify(_this.questionAnswers.answers)], { type: 'application/json' });
                dataToSend.append('question', blobpost_Data);
                _this.consumerService.submitDonationQuestionnaire(uuid, dataToSend, _this.accountId).subscribe((data: any) => {
                    let postData = {
                        urls: []
                    };
                    if (data.urls && data.urls.length > 0) {
                        for (const url of data.urls) {
                            const file = _this.questionAnswers.filestoUpload[url.labelName][url.document];
                            _this.questionaireService.videoaudioS3Upload(file, url.url)
                                .subscribe(() => {
                                    postData['urls'].push({ uid: url.uid, labelName: url.labelName });
                                    if (data.urls.length === postData['urls'].length) {
                                        _this.consumerService.consumerDonationQnrUploadStatusUpdate(uuid, _this.accountId, postData)
                                            .subscribe((data) => {
                                                _this.api_loading_video = true;
                                                resolve(true);
                                                _this.api_loading_video = false;
                                            }, error => {
                                                _this.isClickedOnce = false;
                                                let errorObj = _this.errorService.getApiError(error);
                                                _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies()));
                                                _this.api_loading_video = false;
                                                resolve(false);
                                            });
                                    }
                                }, error => {
                                    _this.isClickedOnce = false;
                                    let errorObj = _this.errorService.getApiError(error);
                                    _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies()));
                                    _this.api_loading_video = false;
                                });
                        }
                    } else {
                        resolve(true);
                    }
                }, error => {
                    _this.isClickedOnce = false;
                    let errorObj = _this.errorService.getApiError(error);
                    _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies()));
                    _this.api_loading_video = false;
                    resolve(false);
                });
            } else {
                resolve(true);
            }
        })
    }
    goToStep(type) {
        if (this.bookStep === 'profile') {
            this.validateOneTimeInfo();
        }
        if (this.bookStep === 'qnr') {
            this.validateQuestionnaire();
        } else {
            this.bookStep = type;
        }
    }
    validateQuestionnaire() {
        if (!this.questionAnswers) {
            this.questionAnswers = {
                answers: {
                    answerLine: [],
                    questionnaireId: this.questionnaireList.id
                }
            }
        }
        if (this.questionAnswers.answers) {
            let subs = this.consumerService.validateConsumerQuestionnaire(this.questionAnswers.answers, this.accountId).subscribe((data: any) => {
                if (data.length === 0) {
                    this.bookStep = 'donation';
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj, this.sharedService.getTerminologies()));
            });
            this.subscriptions.add(subs);
        }
    }
    validateOneTimeInfo() {
        if (!this.oneTimeInfo) {
            this.oneTimeInfo = {
                answers: {
                    answerLine: [],
                    questionnaireId: this.onetimeQuestionnaireList.id
                }
            }
        }
        console.log("Before Validation", this.oneTimeInfo);
        if (this.oneTimeInfo.answers) {
            const questions = this.oneTimeInfo.answers.answerLine.map(function (a) { return a.labelName; })
            const dataToSend: FormData = new FormData();
            const answer = new Blob([JSON.stringify(this.oneTimeInfo.answers)], { type: 'application/json' });
            const question = new Blob([JSON.stringify(questions)], { type: 'application/json' });
            dataToSend.append('answer', answer);
            dataToSend.append('question', question);
            let subs = this.consumerService.validateConsumerOneTimeQuestionnaire(dataToSend, this.accountId, this.providerConsumerId).subscribe((data: any) => {
                if (data.length === 0) {
                    this.submitOneTimeInfo().then((status) => {
                        if (status) {
                            this.getBookStep('profile');
                        }
                    })
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj, this.sharedService.getTerminologies()));
            });
            this.subscriptions.add(subs);
        }
    }
    getBookStep(curStep) {
        if (curStep === 'profile') {
            if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
                this.bookStep = 'qnr';
            } else {
                this.bookStep = 'donation';
            }
        }
    }
    resetErrors() {
        this.firstNameRequired = null;
        this.lastNameRequired = null;
    }
    actionPerformed(status) {
        const _this = this;
        if (status === 'success') {
            this.loggedIn = true;
            this.initDonation().then(
                (status) => {
                    _this.getOneTimeInfo(_this.parentCustomer, _this.accountId).then(
                        (questions) => {
                            _this.onetimeQuestionnaireList = questions;
                            if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                _this.bookStep = 'profile';
                            } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                _this.bookStep = 'qnr';
                            } else {
                                _this.bookStep = 'donation';
                            }
                            _this.loggedIn = true;
                            _this.loading = false;
                        }
                    )
                }
            );
        }
    }
    getOneTimeInfo(user, accountId) {
        const _this = this;
        console.log("Get one time info:", user);
        return new Promise(function (resolve, reject) {
            let subs = _this.consumerService.getProviderCustomerOnetimeInfo(user.id, accountId).subscribe(
                (questions) => {
                    resolve(questions);
                }, () => {
                    resolve(false);
                })
            _this.subscriptions.add(subs);
        })
    }
    getOneTimeQuestionAnswers(event) {
        this.oneTimeInfo = event;
        console.log("OneTimeInfo:", this.oneTimeInfo);
    }
    submitOneTimeInfo() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                const dataToSend: FormData = new FormData();
                if (_this.oneTimeInfo.files) {
                    for (const pic of _this.oneTimeInfo.files) {
                        dataToSend.append('files', pic, pic['name']);
                    }
                }
                const blobpost_Data = new Blob([JSON.stringify(_this.oneTimeInfo.answers)], { type: 'application/json' });
                dataToSend.append('question', blobpost_Data);
                let subs = _this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.parentCustomer.jaldeeConsumer, _this.accountId).subscribe((data: any) => {
                    resolve(true);
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies()));
                        resolve(false);
                    });
                _this.subscriptions.add(subs);
            } else {
                resolve(true);
            }
        });
    }
    onPhoneNumberChanged(updatedPhoneNumber: any) {
        console.log('Updated phone number:', updatedPhoneNumber);
        this.selectedPhone = updatedPhoneNumber;
    }
    private getCurrentIndexCustomLayout(image, images): number {
        return image ? images.indexOf(image) : -1;
    }
    openGallery(image): void {
        let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
        this.galleryService.open(this.image_list_popup, imageIndex);
    }
}
