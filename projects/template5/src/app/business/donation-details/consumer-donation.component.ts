import { Component, OnInit, Inject, OnDestroy, ViewChild, NgZone, ChangeDetectorRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { DOCUMENT, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { SubSink } from 'subsink';
import { Image, ButtonsConfig, ButtonsStrategy, ButtonType, ModalGalleryRef, ModalLibConfig, ModalGalleryConfig, ModalGalleryService } from '@ks89/angular-modal-gallery';
import { AuthService } from '../../services/auth-service';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';
import { projectConstants } from '../../constants/project-constants';
import { FormMessageDisplayService } from 'jaldee-framework/form-message';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { ErrorMessagingService } from 'jaldee-framework/error-messaging';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { SharedService } from 'jaldee-framework/shared';
import { QuestionaireService } from 'jaldee-framework/questionaire';
import { StorageService } from '../../services/storage.service';
import { CountryISO, PhoneNumberFormat, SearchCountryField } from 'ngx-intl-tel-input';


@Component({
    selector: 'app-consumer-donation',
    templateUrl: './consumer-donation.component.html',
    styleUrls: ['./consumer-donation.component.scss']
})
export class ConsumerDonationComponent implements OnInit, OnDestroy {
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
    SearchCountryField = SearchCountryField;
  selectedCountry = CountryISO.India;
  PhoneNumberFormat = PhoneNumberFormat;
  preferredCountries: CountryISO[] = [CountryISO.India, CountryISO.UnitedKingdom, CountryISO.UnitedStates];
  separateDialCode = true;
    private subs = new SubSink();
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
    customId;         // To know whether req came from customapp/qr link
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
    // questionnaireLoaded = false; // to check questionaire loaded or not
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
    // @ViewChild('modal') modal; // referring modal object
    @ViewChild('closebutton') closebutton;
    services: any;    // To store services json
    providerConsumerId; // id of the selected provider consumer 
    providerConsumerList: any;
    selected_phone: any;
    phoneError = '';
    donationAmount;
    payEmail: any;
    image_list_popup: Image[];
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
    constructor(public fed_service: FormMessageDisplayService,
        public dialog: MatDialog,
        private router: Router,
        private route: ActivatedRoute,
        private wordProcessor: WordProcessor,
        private lStorageService: LocalStorageService,
        private snackbarService: SnackbarService,
        @Inject(DOCUMENT) public document,
        public _sanitizer: DomSanitizer,
        private razorpayService: RazorpayService,
        private location: Location,
        private paytmService: PaytmService,
        private cdRef: ChangeDetectorRef,
        private dateTimeProcessor: DateTimeProcessor,
        private ngZone: NgZone,
        private authService: AuthService,
        private accountService: AccountService,
        private consumerService: ConsumerService,
        private questionaireService: QuestionaireService,
        private sharedService: SharedService,
        private errorService: ErrorMessagingService,
        private storageService: StorageService,
        private modalGalleryService: ModalGalleryService
        ) {
        this.subs.sink = this.route.queryParams.subscribe(
            params => {
                this.locationId = parseInt(params['loc_id']);
                this.selectedServiceId = JSON.parse(params['service_id']);
            });
            const response = {
                ttype: 'hideLocation'
            }
            this.accountService.sendMessage(response);
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
        this.subs.unsubscribe();
    }
    /**
 * Returns the family Members
 * @param parentId parent consumer id
 */    
    initDonation() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.donationDate = _this.dateTimeProcessor.getToday(_this.serverDate);
            _this.image_list_popup = [];
            _this.storageService.getProviderConsumer().then((spConsumer: any) => {
                console.log("spConsumer23",spConsumer);
                _this.providerConsumerId = spConsumer.id  
            _this.getPaymentModes();            
                _this.setProfileInfo(spConsumer);
                _this.parentCustomer = spConsumer;
                                _this.getConsumerQuestionnaire().then(
                                    (data) => {
                                        if (data) {
                                            _this.questionnaireList = data;
                                        }
                                        console.log("Heree");
                                        resolve(true);
                                    }
                                );
                            });
        })

    }
    
    setProfileInfo(data: any) {
        if (data !== undefined) {
            this.donorName = data.firstName + ' ' + data.lastName;
            this.donorFirstName = data.firstName;
            this.donorLastName = data.lastName;
            this.payEmail =  data.email || '';
            this.userEmail = data.email || '';
            // this.userPhone = data.phoneNo || '';
            // this.selected_phone = this.userPhone ||'';
            this.dialCode = data.countryCode || '';
            this.selected_phone = data.countryCode + data.phoneNo || '';
            setTimeout(() => this.selected_phone = data.phoneNo, 5);
        }
        this.storageService.clear();
    }
    ngOnInit() {
        const _this = this;
        _this.serverDate = _this.lStorageService.getitemfromLocalStorage('sysdate');

        _this.account = _this.accountService.getAccountInfo();
        _this.accountConfig = _this.accountService.getAccountConfig();
        if (_this.accountConfig && _this.accountConfig['theme']) {
            _this.theme = _this.accountConfig['theme'];
        }
        _this.wordProcessor.setTerminologies(_this.accountService.getTerminologies());
        _this.accountProfile = _this.accountService.getJson(_this.account['businessProfile']);
        _this.accountId = _this.accountProfile.id;
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
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
        _this.services = _this.accountService.getJson(_this.account['donationServices']);
        if (_this.services.length > 0) {
            if (!_this.selectedServiceId) {
                _this.selectedServiceId = _this.services[0].id;
            }
            _this.setServiceDetails(_this.selectedServiceId); // setting the details of the first service to the holding variable
        }
        _this.authService.goThroughLogin().then(
            (status) => {
                console.log("Status:", status);
                if (status) {
                    _this.initDonation().then(
                        (status) => {
                            console.log("init Donation Status1:", status);
                            _this.getOneTimeInfo(_this.parentCustomer, _this.accountId).then(
                                (questions) => {
                                    console.log("Questions:", questions);
                                    // _this.onetimeQuestionnaireList = { "questionnaireId": "WalkinConsumer", "id": 7, "labels": [{ "transactionType": "CONSUMERCREATION", "transactionId": 0, "channel": "ANY", "questionnaireId": "WalkinConsumer", "questions": [{ "id": 18, "labelName": "General Health3", "sequnceId": "", "fieldDataType": "bool", "fieldScope": "consumer", "label": "Do you have any chronic diseases?", "labelValues": ["Yes", "No"], "billable": false, "mandatory": false, "scopTarget": { "target": [{ "targetUser": "PROVIDER" }, { "targetUser": "CONSUMER" }] } }] }] };
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
                        }
                    );

                } else {
                    this.loggedIn = false;
                    this.accountService.sendMessage({ttype:'hideBookingsAndLocations'});
                }
            });
    }
    autoGrowTextZone(e) {
        console.log('textarea', e)
        e.target.style.height = "0px";
        e.target.style.height = (e.target.scrollHeight + 15) + "px";
    }
    getPaymentModes() {
        this.consumerService.getPaymentModesofProvider(this.accountId, this.selectedServiceId, 'donation')
            .subscribe(
                data => {
                    this.paymentmodes = data[0];
                    console.log('payment details..', this.paymentmodes)
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
                },
                error => {
                    this.isPayment = false;
                    console.log(this.isPayment);
                }
            );
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
        let curphone;
        if (this.selected_phone) {
            if (this.selected_phone.e164Number) {
                curphone = this.selected_phone.e164Number.split(this.selected_phone['dialCode'])[1];                
            }
            else {
                curphone = this.selected_phone;
            }
        }
        const pattern = new RegExp(projectConstantsLocal.VALIDATOR_NUMBERONLY);
        const result = pattern.test(curphone);
        const pattern1 = new RegExp(projectConstantsLocal.VALIDATOR_PHONENUMBERCOUNT10);
        const result1 = pattern1.test(curphone);
        if (this.selected_phone === '') {
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
        donorData['phoneNo'] = curphone;
        donorData['countryCode'] = this.selected_phone['dialCode']?this.selected_phone['dialCode']:this.dialCode?this.dialCode:'+91';
        this.resetApiErrors();
        const stat = this.validateEmail(this.payEmail);
        const stat1 = this.validateEmail(this.payEmail1);
        if (this.payEmail === '' || !stat) {
            this.emailerror = 'Please enter a valid email.';
            return;
        }
        if (this.payEmail1 === '' || !stat1) {
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
        else if (this.userEmail && this.userEmail != ''){
            donorData['email'] = this.userEmail
        }
        this.setProfileInfo(donorData);
        this.closebutton.nativeElement.click();
    }
    editDonor(email: any, name: any, phone: any) {
        this.action = 'donor';
        this.action = 'phone';
        // this.selected_phone = this.userPhone;
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
    resetData() {
        this.setProfileInfo(this.parentCustomer)
    }   
    resetApiErrors() {
        this.emailerror = null;
        this.email1error = null;
        this.phoneError = '';
    }
    setServiceDetails(curservid) {
        this.selectedService = this.services.filter(service => service.id === curservid)[0];
        console.log('donation details.......', this.selectedService);
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
            this.snackbarService.openSnackBar('Please select a payment mode', { 'panelClass': 'snackbarerror' });
            this.isClickedOnce = false;
            return false;
        }
        // this.resetApi();
        if (this.selectedServiceId) {

        } else {
            this.snackbarService.openSnackBar('Donation service is not found', { 'panelClass': 'snackbarerror' });
            return;
        }

        let paymenttype = this.paymentMode;
        this.donate(paymenttype);
    }
    donate(paymentWay) {
        // this.showEditView = false;
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
            'donorPhoneNumber': this.selected_phone,
            'note': this.consumerNote,
            'donorEmail': this.userEmail
        };
        console.log("Donation Data :", post_Data);
        if (this.donationAmount) {
            this.addDonationConsumer(post_Data, paymentWay);
        } else {
            this.isClickedOnce = false;
            this.snackbarService.openSnackBar('Please enter valid donation amount', { 'panelClass': 'snackbarerror' });
        }
    }
    validate(event) {
        this.donationAmount = event.target.value;
        console.log("EVent:", event);
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
                    // if (_this.customId) {
                    //     console.log("businessid" + _this.accountId);
                    //     _this.consumerService.addProvidertoFavourite(_this.accountId)
                    //         .subscribe(() => {
                    //         });
                    // }
                    _this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                _this.submitQuestionnaire(_this.donationId, post_Data).then(
                                    (status1) => {
                                        if (status1) {
                                            _this.openPaymentLink(_this.customId, post_Data['service'].id, paymentLinkResponse.paylink);
                                        }
                                    });
                            }
                        }
                    )
                },
                error => {
                    _this.isClickedOnce = false;
                    _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                });
        } else {
            const paymentWay = _this.paymentMode;
            console.log("Going to call donation link:", paymentWay);
            _this.subs.sink = _this.consumerService.addCustomerDonation(post_Data, _this.accountId)
                .subscribe(data => {
                    _this.donationId = data['uid'];
                    // if (_this.customId) {
                    //     console.log("businessid" + _this.accountId);
                    //     _this.consumerService.addProvidertoFavourite(_this.accountId)
                    //         .subscribe(() => {
                    //         });

                    // }
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
                },
                    error => {
                        _this.isClickedOnce = false;
                        _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                    });
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
        const url = projectConstants.PATH + businessId + "/service/" + serviceId + "/pay/" + paylink;
        _this.paymentWindow = window.open(url, "_blank", "location=no,fullscreen=yes,toolbar=no,resizable=no;menubar=no,titlebar=no");

        let easingLoop = setInterval(function () {
            _this.paymentWindow.onbeforeunload = function () {
                _this.isClickedOnce = false;
                clearInterval(easingLoop);
                _this.cdRef.detectChanges();

            }
            console.log("Payment Window:");
            console.log(_this.paymentWindow);
            // if (!_this.paymentWindow.closed) {
            //     clearInterval(easingLoop);
            //     _this.isClickedOnce = false;
            // }
            _this.isDonationSuccess(paylink).then(
                (status) => {
                    if (status) {
                        clearInterval(easingLoop);
                        _this.paymentWindow.close();
                        _this.isClickedOnce = false;
                        _this.cdRef.detectChanges();
                        _this.ngZone.run(() => _this.router.navigate([_this.customId, 'dashboard']));
                        // }
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
        this.subs.sink = this.consumerService.consumerPayment(payInfo)
            .subscribe((pData: any) => {
                console.log("Payment Info:", pData);
                // this.checkIn_type = 'donations';
                // this.origin = 'consumer';
                this.pGateway = pData.paymentGateway;
                if (this.pGateway === 'RAZORPAY') {
                    this.paywithRazorpay(pData);
                } else {
                    if (pData['response']) {
                        this.payWithPayTM(pData, this.accountId);
                    } else {
                        this.isClickedOnce = false;
                        this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'), { 'panelClass': 'snackbarerror' });
                    }
                }
            },
                error => {
                    this.isClickedOnce = false;
                    this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                });
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
            this.snackbarService.openSnackBar(Messages.PROVIDER_BILL_PAYMENT,{ 'panelClass': 'snackbarnormal' });
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
            this.ngZone.run(() => this.router.navigate([this.customId, 'donations', 'confirm'], navigationExtras));
        } else {
            this.isClickedOnce = false;
            this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
            if (this.from) {
                this.ngZone.run(() => this.router.navigate([this.customId, 'dashboard']));
            } else {
                this.isClickedOnce = false;
                this.loadingPaytm = false;
                this.cdRef.detectChanges();
                this.ngZone.run(() => {
                    const snackBar = this.snackbarService.openSnackBar("Transaction Failed", { 'panelClass': 'snackbarerror' });
                    snackBar.onAction().subscribe(() => {
                        snackBar.dismiss();
                    })
                });
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
                    },
                        error => {
                            this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
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
                    },
                        error => {
                            this.snackbarService.openSnackBar("Transaction failed", { 'panelClass': 'snackbarerror' });
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                this.finishDonation(false);
            }
        }
    }
    getImageSrc(mode) {
        return 'assets/images/payment-modes/' + mode + '.png';
    }
    closeloading() {
        this.isClickedOnce = false;
        this.loadingPaytm = false;
        this.cdRef.detectChanges();
        this.ngZone.run(() => {
            const snackBar = this.snackbarService.openSnackBar('Your payment attempt was cancelled.', { 'panelClass': 'snackbarerror' });
            snackBar.onAction().subscribe(() => {
                snackBar.dismiss();
            })
        });
    }
    onReloadPage() {
        window.location.reload();
    }
    
    goBack(type?) {
        console.log(this.bookStep);
        console.log(this.action);
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
        dataToSend.append('message', this.consumerNote);
        // const captions = {};
        this.subs.sink = this.consumerService.addConsumerWaitlistNote(this.accountId, uuid,
            dataToSend)
            .subscribe(
                () => {
                },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    this.wordProcessor.apiErrorAutoHide(this, errorObj);
                }
            );
    }
    isNumeric(evt) {
        return this.sharedService.isNumericwithoutdot(evt);
    }
    isValid(evt) {
        console.log(evt);
        return this.sharedService.isValid(evt);
    }
    changeService() {
        this.action = 'service';
    }
    getConsumerQuestionnaire() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.subs.sink = _this.consumerService.getDonationQuestionnaire(_this.selectedServiceId, _this.accountId).subscribe(data => {
                resolve(data);
            }, () => {
                resolve(false);
            });
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
                                            },
                                                error => {
                                                    _this.isClickedOnce = false;
                                                    let errorObj = _this.errorService.getApiError(error);
                                                    _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                                    _this.api_loading_video = false;
                                                    resolve(false);
                                                });

                                    }

                                },
                                    error => {
                                        _this.isClickedOnce = false;
                                        let errorObj = _this.errorService.getApiError(error);
                                        _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                        _this.api_loading_video = false;
                                    });
                        }
                    } else {
                        resolve(true);
                    }
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
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
            this.consumerService.validateConsumerQuestionnaire(this.questionAnswers.answers, this.accountId).subscribe((data: any) => {
                if (data.length === 0) {
                    this.bookStep = 'donation';
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
        }
    }
    validateOneTimeInfo() {
        console.log("OneTime:", this.oneTimeInfo);
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
            this.consumerService.validateConsumerOneTimeQuestionnaire(dataToSend, this.accountId, this.providerConsumerId).subscribe((data: any) => {
                if (data.length === 0) {
                    this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                this.getBookStep('profile');
                            }
                        })
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
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
                    console.log("init Donation Status:", status);
                    _this.getOneTimeInfo(_this.parentCustomer, _this.accountId).then(
                        (questions) => {
                            _this.onetimeQuestionnaireList = questions;
                            console.log("Questions:", questions);
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
                    _this.consumerService.getProviderCustomerOnetimeInfo(user.id, accountId).subscribe(
                        (questions) => {
                            resolve(questions);
                        }, () => {
                            resolve(false);
                        }
                    )
                }
            )
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
                //activeUser.id
                _this.subs.sink = _this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.parentCustomer.jaldeeConsumer, _this.accountId).subscribe((data: any) => {
                    resolve(true);
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        resolve(false);
                    });
            } else {
                resolve(true);
            }
        });
    }
    openImageModalRow(image: Image) {
        const index: number = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
        this.openModal(1, index, this.customButtonsFontAwesomeConfig);
    }
    
    getCurrentIndexCustomLayout(image: Image, images: Image[]): number {
        return image ? images.indexOf(image) : -1;
    }
    openModal(id: number, imageIndex: number, buttonsConfig: ButtonsConfig): void {
        const dialogRef: ModalGalleryRef = this.modalGalleryService.open({
            id: id,
            images: this.image_list_popup,
            currentImage: this.image_list_popup[imageIndex],
            libConfig: {
                buttonsConfig: buttonsConfig,
                currentImageConfig: {
                    downloadable: true
                }
            } as ModalLibConfig
        } as ModalGalleryConfig) as ModalGalleryRef;
    }
}
