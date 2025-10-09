import { Component, Inject, OnInit, ViewChild, OnDestroy, NgZone, ChangeDetectorRef, HostListener, ElementRef } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { DOCUMENT, Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { AccountService, AuthService, CommonService, ConsumerService, DateFormatPipe, DateTimeProcessor, ErrorMessagingService, FileService, FormMessageDisplayService, GroupStorageService, JaldeeTimeService, LocalStorageService, Messages, PaytmService, projectConstantsLocal, QuestionaireService, RazorpayService, SharedService, StorageService, SubscriptionService, WordProcessor } from 'jconsumer-shared';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CouponsComponent } from '../../shared/coupons/coupons.component';
import { ConsumerEmailComponent } from '../../shared/consumer-email/consumer-email.component';

@Component({
    selector: 'app-checkin',
    templateUrl: './checkin.component.html',
    styleUrls: ['./checkin.component.scss']
})
export class CheckinComponent implements OnInit, OnDestroy {
    isClickedOnce = false;
    shownonIndianModes = false;
    tooltipcls = '';
    add_member_cap = Messages.ADD_MEMBER_CAP;
    cancel_btn = Messages.CANCEL_BTN;
    applied_inbilltime = Messages.APPLIED_INBILLTIME;
    domain;
    note_placeholder;
    s3url;
    api_cp_error = null;
    services: any = [];
    servicesjson: any = [];
    serviceslist: any = [];
    settingsjson: any = [];
    terminologiesjson: any = [];
    queuejson: any = [];
    businessjson: any = [];
    partysizejson: any = [];
    sel_loc;
    customer = "patient"
    prepaymentAmount = 0;
    sel_queue_id;
    queueId;
    sel_queue_waitingmins;
    waitingTime;
    sel_queue_servicetime = '';
    serviceTime;
    sel_queue_name;
    sel_queue_timecaption;
    sel_queue_indx;
    sel_queue_personaahead = 0;
    personsAhead;
    calc_mode;
    multipleMembers_allowed = false;
    partySize = false;
    partySizeRequired = null;
    today;
    minDate;
    maxDate;
    consumerNote = '';
    enterd_partySize = 1;
    holdenterd_partySize = 0;
    checkinDate;
    accountId;
    retval;
    futuredate_allowed = false;
    step = 1;
    waitlist_for: any = [];
    holdwaitlist_for: any = [];
    maxsize = 1;
    isFutureDate = false;
    addmemberobj = { 'fname': '', 'lname': '', 'mobile': '', 'gender': '', 'dob': '' };
    userN = { 'id': 0, 'firstName': Messages.NOUSERCAP, 'lastName': '' };
    payment_popup = null;
    dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT_WITH_DAY;
    newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
    queueQryExecuted = false;
    ddate;
    server_date;
    api_loading1 = true;
    departmentlist: any = [];
    departments: any = [];
    datePresent = true;
    selectedCountryCode;
    userData: any = [];
    userEmail;
    users: any = [];
    emailExist = false;
    emailerror = null;
    trackUuid;
    selectedMessage = {
        files: [],
        base64: [],
        caption: []
    };
    selectedSlot: any;
    allSlots: any = [];
    availableSlots: any = [];
    data;
    provider_id: any;
    s3CouponsList: any = {
        JC: [], OWN: []
    };
    showCouponWB: boolean;
    bgColor: string;
    change_date: any;
    liveTrack = false;
    action: any = '';
    callingMode;
    virtualServiceArray;
    callingModes: any = [];
    callingModesDisplayName = projectConstantsLocal.CALLING_MODES;
    tele_srv_stat: any;
    is_wtsap_empty = false;
    accountType;
    disable = false;
    hideEditButton = false;
    selectedService: any;
    note_cap = 'Add Note';
    servicedialogRef: any;
    availableDates: any = [];
    type;
    rescheduleUserId;
    waitlist: any = [];
    checkin_date;
    wtlst_for_fname;
    wtlst_for_lname;
    serviceCost;
    phoneNumber;
    separateDialCode = true;

    phoneError: string;
    dialCode;
    editBookingFields: boolean;
    whatsapperror = '';
    showmoreSpec = false;
    bookStep;
    locationName;
    waitlistDetails: any;
    uuidList: any = [];
    prepayAmount;
    paymentDetails: any = [];
    paymentLength = 0;
    @ViewChild('closebutton') closebutton;
    @ViewChild('modal') modal;
    apiError = '';
    apiSuccess = '';
    questionnaireList: any = [];
    questionAnswers;
    googleMapUrl;
    private subs: Subscription = new Subscription();
    selectedQTime;
    questionnaireLoaded = false;
    imgCaptions: any = [];
    virtualInfo: any;
    newMember: any;
    consumerType: string;
    theme: any;
    checkPolicy = true;
    customId: any; // To know the source whether the router came from Landing page or not
    businessId: any;
    virtualFields: any;
    whatsappCountryCode;
    disablebutton = false;
    readMore = false;
    razorpayGatway = false;
    paytmGateway = false;
    jaldeecash: any;
    jcashamount: any;
    jcreditamount: any;
    remainingadvanceamount;
    amounttopay: any;
    wallet: any;
    payAmount: number;
    loadingPaytm = false;
    @ViewChild('consumer_checkin') paytmview;
    api_loading_video;
    payment_options: any = [];
    paytmEnabled = false;
    razorpayEnabled = false;
    interNatioanalPaid = false;
    paymentmodes: any;
    from: string;
    details: any;
    gender_cap = Messages.GENDER_CAP;
    locations;
    consumer_label: any;
    disableButton;
    loading = false;
    submitbtndisabled = false;
    hideTokenFor = true;
    api_loading = true;
    familyMembers: any = [];
    new_member;
    is_parent = true;
    chosen_person: any;
    activeUser: any;
    memberObject: any;
    selectedMonth: number;
    selectedYear: number;
    allDates: any[] = [];
    dates: any[] = [];
    years: number[] = [];
    months: { value: string; name: string; }[];
    mandatoryEmail: any;
    serviceDetails: any;
    provider: any;
    languageSelected: any = [];
    iseditLanguage = false;
    hideNextButton = false;
    wt_personaahead;
    selection_modes: any;
    indian_payment_modes: any = [];
    non_indian_modes: any = [];
    gateway: any;
    isPayment: boolean;
    pGateway: any;
    parentCustomer;
    countryCode;
    commObj = {}
    waitlistForPrev: any = [];
    selectedTime: any;
    provider_label = '';

    loggedIn = true;
    smallDevice: boolean;
    businessInfo: any = {};
    queuesLoaded: boolean = false;
    oneTimeInfo: any;
    onetimeQuestionnaireList: any = [];
    providerConsumerId: any;
    providerConsumerList: any;
    scheduledWaitlist; // To store rescheduled info
    changePhone;     // Change phone number or not
    departmentEnabled;// Department Enabled or not
    selectedUser;     // Appointment for which user/doctor
    selectedUserId;   // Appointment for which user/doctor id
    selectedServiceId;// Id of the appointment service
    selectedDept;     // Department of the selected service
    selectedDeptId;     // Department Id of the selected service
    paymentRequestId; // Retrying failed attempts
    serverDate;       // To store the server date
    filestoUpload: any = [];
    uuid: any;
    apiErrors: any[];
    loadedConvenientfee;
    convenientPaymentModes: any = [];
    convenientFeeObj: any;
    convenientFee: any;
    gatewayFee: any;
    profileId: any;
    serviceOptionQuestionnaireList: any;
    serviceOptionApptt = false;
    btnClicked = false // To avoid double click
    serviceOPtionInfo: any;
    groupedQnr: any;
    finalDataToSend: any;
    showSlot = true;
    showNext = false;
    serviceTotalPrice: number;
    accountConfig: any;
    account: any;
    accountProfile: any;
    couponChecked: any;
    privacyChecked: any;
    coupondialogRef: any;
    privacy = false;
    isJCashSelected;
    isJCreditSelected;
    jCashInHand;
    jCreditInHand;
    balanceToPay;
    isPaymentNeeded;
    isCouponsAvailable: boolean = false;
    confirmButton = { 'caption': 'Confirm', 'disabled': false };
    amountToPayAfterJCash: any;
    selectedCoupons: any = [];
    paymentReqInfo: any = {};
    isInternational: any;
    paymentMode: any;
    bookingPolicy: boolean;
    bookingPolicyContent: any;
    bookingPolicyPath: any;
    filesToUpload: any = [];
    attachments: any;
    @ViewChild('imagefile') fileInput: ElementRef;
    waitlist_details_lastName: any;
    waitlist_details_firstName: any;
    currentAttachment: any;
    constructor(public fed_service: FormMessageDisplayService,
        public router: Router,
        public route: ActivatedRoute,
        public dateformat: DateFormatPipe,
        public location: Location,
        public dialog: MatDialog,
        // private snackbarService: SnackbarService,
        private wordProcessor: WordProcessor,
        private lStorageService: LocalStorageService,
        private groupService: GroupStorageService,
        public _sanitizer: DomSanitizer,
        public razorpayService: RazorpayService,
        private dateTimeProcessor: DateTimeProcessor,
        private jaldeeTimeService: JaldeeTimeService,
        private ngZone: NgZone,
        private paytmService: PaytmService,
        private cdRef: ChangeDetectorRef,
        private authService: AuthService,
        private fileService: FileService,
        private consumerService: ConsumerService,
        private questionaireService: QuestionaireService,
        private sharedService: SharedService,
        private accountService: AccountService,
        private errorService: ErrorMessagingService,
        public translate: TranslateService,
        private subscriptionService: SubscriptionService,
        private storageService: StorageService,
        private commonService: CommonService,
        @Inject(DOCUMENT) public document
    ) {
        this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
        this.subscriptionService.sendMessage({ ttype: 'hideBookingsAndLocations' });
        this.subs.add(this.route.queryParams.subscribe(
            params => {
                if (params['src']) {
                    this.lStorageService.setitemonLocalStorage('source', params['src']);
                    this.lStorageService.setitemonLocalStorage('reqFrom', 'CUSTOM_WEBSITE');
                }
                if (params['ctime']) {
                    // console.log('****************************')
                    this.selectedTime = params['ctime']
                }
                this.sel_loc = params['loc_id'];
                if (params['qid']) {
                    this.sel_queue_id = params['qid'];
                }
                this.change_date = params['cur'];
                if (params['sel_date']) {
                    this.checkinDate = params['sel_date'];
                }
                if (params['dept']) {
                    this.selectedDeptId = parseInt(params['dept']);
                    this.departmentEnabled = true;
                }
                if (params['user']) {
                    this.selectedUserId = params['user'];
                }
                if (params['service_id']) {
                    this.selectedServiceId = parseInt(params['service_id']);
                }
                if (params['type'] === 'waitlistreschedule') {
                    this.type = params['type'];
                    this.rescheduleUserId = params['uuid'];
                }
                this.uuid = params['uuid'];
            }
        ));
    }
    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth <= 767) {
            this.smallDevice = true;
        } else {
            this.smallDevice = false;
        }
    }
    /**
    * 
    * @param locid Location Id
    * @returns services of location
    */
    getServicesbyLocation(locid) {
        console.log("getServicesbyLocation:", locid);
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (locid) {
                _this.subs.add(_this.consumerService.getServicesByLocationId(locid).subscribe((services) => {
                    resolve(services);
                }, () => {
                    resolve([]);
                }))
            } else {
                resolve([]);
            }

        })
    }

    getRescheduledInfo() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.rescheduleUserId) {
                resolve(true);
            } else {
                _this.getRescheduleWaitlistDet().then(
                    () => {
                        resolve(true);
                    }
                )
            }
        })

    }

    /**
     * 
     * @param locid Location Id
     * @returns services of location
     */
    getQueuesbyLocationServiceAndDate(locid, servid, pdate, accountid) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.subs.add(_this.consumerService.getQueuesbyLocationandServiceId(locid, servid, pdate, accountid)
                .subscribe((queues: any) => {
                    resolve(queues);
                    _this.queuesLoaded = true;
                }, () => {
                    resolve([]);
                    _this.queuesLoaded = true;
                }))
        })
    }

    ngOnInit() {
        const _this = this;
        let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
        this.translate.setDefaultLang(language);
        this.translate.use(language);
        _this.onResize();
        if (_this.checkin_date) {
            _this.isFutureDate = _this.dateTimeProcessor.isFutureDate(_this.serverDate, _this.checkin_date);
        }
        this.account = this.sharedService.getAccountInfo();
        this.settingsjson = this.sharedService.getJson(this.account['settings']);
        this.accountConfig = this.accountService.getAccountConfig();
        if (this.accountConfig && this.accountConfig['theme']) {
            this.theme = this.accountConfig['theme'];
        }
        if (this.accountConfig && this.accountConfig['bookingPolicy']) {
            this.bookingPolicy = true;
            if (this.accountConfig['bookingPolicyContent']) {
                this.bookingPolicyContent = this.accountConfig['bookingPolicyContent'];
            } else if (this.accountConfig['bookingPolicyPath']) {
                this.bookingPolicyPath = this.accountConfig['bookingPolicyPath'];
            }
        } else {
            this.bookingPolicy = false;
        }
        this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
        this.consumer_label = this.wordProcessor.getTerminologyTerm('customer');
        this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
        this.setBasicProfile();

        if (this.accountService.getJson(this.account['coupon'])) {
            this.s3CouponsList.JC = this.accountService.getJson(this.account['coupon']);
            if (this.s3CouponsList.JC.length > 0) {
                this.showCouponWB = true;
            }
        }
        if (this.accountService.getJson(this.account['providerCoupon'])) {
            this.s3CouponsList.OWN = this.accountService.getJson(this.account['providerCoupon']);
            if (this.s3CouponsList.OWN.length > 0) {
                this.showCouponWB = true;
            }
        }
        const deptUsers = this.accountService.getJson(this.account['departmentProviders']);
        if (!this.departmentEnabled) {
            this.users = deptUsers;
        } else {
            this.departments = deptUsers;
            deptUsers.forEach(depts => {
                if (depts.users.length > 0) {
                    this.users = this.users.concat(depts.users);
                }
            });
        }
        _this.getRescheduledInfo().then(() => {
            if (_this.selectedServiceId) { _this.getPaymentModes(); }
            _this.getServicesbyLocation(_this.sel_loc).then(
                (services: any) => {
                    _this.services = services;
                    console.log("Services:", services);
                    _this.setServiceDetails(_this.selectedServiceId);
                    _this.getPaymentModes();
                    _this.api_loading = false;
                })
        })
        this.serviceOPtionInfo = this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
        this.getServiceOptions();
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
    setBasicProfile() {
        this.accountId = this.accountProfile.id;
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
        this.businessInfo['businessName'] = this.accountProfile.businessName;

        if (!this.businessInfo['locationName']) {
            this.businessInfo['locationName'] = this.accountProfile.baseLocation?.place;
        }
        if (!this.businessInfo['googleMapUrl']) {
            this.businessInfo['googleMapUrl'] = this.accountProfile.baseLocation?.googleMapUrl;
        }
        if (this.accountProfile['logo']) {
            this.businessInfo['logo'] = this.accountProfile['logo'];
        }
        const domain = this.accountProfile.serviceSector.domain;
        if (domain === 'foodJoints') {
            this.note_placeholder = 'Item No Item Name Item Quantity';
            this.note_cap = 'Add Note / Delivery address';
        } else {
            this.note_placeholder = '';
            this.note_cap = 'Add Note';
        }
        this.getPartysizeDetails(this.accountProfile.serviceSector.domain, this.accountProfile.serviceSubSector.subDomain);
    }
    getServiceOptions() {
        this.subs.add(this.consumerService.getServiceoptionsWaitlist(this.selectedServiceId, this.accountId)
            .subscribe(
                (data) => {
                    if (data) {
                        this.serviceOptionQuestionnaireList = data;
                        if (this.serviceOptionQuestionnaireList.questionnaireId && this.type !== 'waitlistreschedule') {
                            this.serviceOptionApptt = true;
                            this.bookStep = 1;
                        }
                        else {
                            this.bookStep = 2;
                        }
                    }
                },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                    this.btnClicked = false;
                }));
    }
    getserviceOptionQuestionAnswers(event) {
        this.serviceOPtionInfo = event;
        if (this.serviceOPtionInfo.answers.answerLine && this.serviceOPtionInfo.answers.answerLine.length === 0) {
            console.log(this.showNext)
            this.showNext = false;
        }
        else {
            console.log('ggggggggg')
            console.log(this.showNext)
            this.showNext = true;
        }
        this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.serviceOPtionInfo);


    }
    setQDetails(queues, qId?) {
        if (queues.length > 0) {
            let selindx = 0;
            for (let i = 0; i < queues.length; i++) {
                if (queues[i]['queueWaitingTime'] !== undefined) {
                    selindx = i;
                }
            }
            this.sel_queue_id = queues[selindx].id;
            this.sel_queue_indx = selindx;
            console.log("Selected QId:", this.sel_queue_id);
            this.sel_queue_waitingmins = this.dateTimeProcessor.providerConvertMinutesToHourMinute(queues[selindx].queueWaitingTime);
            this.sel_queue_servicetime = queues[selindx].serviceTime || '';
            this.sel_queue_name = queues[selindx].name;
            this.sel_queue_personaahead = queues[selindx].queueSize;
            this.wt_personaahead = queues[selindx].showPersonAhead;
            this.calc_mode = queues[selindx].calculationMode;
            this.slotSelected(queues[selindx]);
        } else {
            this.sel_queue_id = 0;
            this.sel_queue_waitingmins = 0;
            this.sel_queue_servicetime = '';
            this.sel_queue_name = '';
            this.sel_queue_personaahead = 0;
        }
    }
    initCheckin() {
        const _this = this;
        _this.waitlist_for = [];
        _this.consumer_label = _this.wordProcessor.getTerminologyTerm('customer');
        console.log("Active User:", _this.waitlist_for);
        return new Promise(function (resolve, reject) {
            _this.storageService.getProviderConsumer().then((spConsumer: any) => {
                _this.parentCustomer = spConsumer;
                _this.providerConsumerId = spConsumer.id;
                console.log("Parent Consumer:", _this.providerConsumerId);
                _this.wtlst_for_fname = spConsumer.firstName;
                _this.wtlst_for_lname = spConsumer.lastName;
                if (!_this.rescheduleUserId) {
                    _this.waitlist_for.push({ id: spConsumer.id, firstName: spConsumer.firstName, lastName: spConsumer.lastName });

                    console.log("WaitlistFor2:", _this.waitlist_for);
                    _this.setConsumerFamilyMembers(spConsumer.id).then(); // Load Family Members 
                    if (!_this.questionnaireLoaded) {
                        _this.getConsumerQuestionnaire().then(
                            () => {
                                console.log("Heree");
                                resolve(true);
                            }
                        );
                    } else {
                        resolve(true);
                    }
                }
                _this.initCommunications(spConsumer);

            });
        })
    }

    checkinDateChanged(checkinDate) {
        const _this = this;
        this.queuejson = [];
        this.checkinDate = checkinDate;
        this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.checkinDate);
        console.log("changed_date_value Date:", this.checkinDate);
        this.queuesLoaded = false;
        _this.getQueuesbyLocationServiceAndDate(_this.sel_loc, _this.selectedServiceId, _this.checkinDate, _this.accountId).then(
            (queues: any) => {
                _this.queuejson = queues;
                _this.setQDetails(queues);
            }
        )
    }
    getPaymentModes() {
        this.paytmEnabled = false;
        this.razorpayEnabled = false;
        this.interNatioanalPaid = false;
        this.consumerService.getPaymentModesofProvider(this.accountId, this.selectedServiceId, 'prePayment')
            .subscribe(
                data => {
                    this.paymentmodes = data[0];
                    this.isPayment = true;
                    this.profileId = this.paymentmodes.profileId;
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
        this.setTotalAmountWithConvenientFee();
    }
    non_indian_modes_onchange(event) {
        this.paymentMode = event.value;
        this.isInternational = true;
        this.setTotalAmountWithConvenientFee();
    }
    setTotalAmountWithConvenientFee() {
        console.log()
        this.convenientPaymentModes.map((res: any) => {
            this.convenientFeeObj = {}
            if (res.isInternational === this.shownonIndianModes) {
                if (this.paymentMode === res.mode) {
                    this.convenientFeeObj = res;
                    console.log("Convenient:", this.convenientFeeObj);
                    this.gatewayFee = this.convenientFeeObj.totalGatewayFee;
                    this.convenientFee = this.convenientFeeObj.convenienceFee;
                    this.paymentDetails['amountToPay'] = this.convenientFeeObj.amountWithAllCharges;

                    console.log("Convenient feea:", this.convenientFeeObj.amountWithAllCharges);
                    console.log("gatewayFee for  non-indian:", this.gatewayFee, res.mode)
                }
            }
        })
    }
    togglepaymentMode() {
        this.shownonIndianModes = !this.shownonIndianModes;
        this.isInternational = this.shownonIndianModes;
        this.loadedConvenientfee = false;
        this.paymentMode = null;
        if (this.paymentDetails['amountToPay'] > 0) {
            this.setConvenientFee();
        }
    }
    getImageSrc(mode) {
        return 'assets/images/payment-modes/' + mode + '.png';
    }
    ngOnDestroy(): void {
        this.subs.unsubscribe();
    }
    getRescheduleWaitlistDet() {
        const _this = this;
        _this.waitlist_for = [];
        return new Promise(function (resolve, reject) {
            _this.subs.add(_this.consumerService.getCheckinByConsumerUUID(_this.rescheduleUserId, _this.accountId).subscribe(
                (waitlst: any) => {
                    _this.scheduledWaitlist = waitlst;
                    if (_this.scheduledWaitlist && _this.scheduledWaitlist.attachments && _this.scheduledWaitlist.attachments.length > 0) {
                        _this.currentAttachment = _this.scheduledWaitlist.attachments;
                    }
                    if (_this.type === 'waitlistreschedule') {
                        _this.waitlist_for.push({ id: _this.scheduledWaitlist.waitlistingFor[0].id, firstName: _this.scheduledWaitlist.waitlistingFor[0].firstName, lastName: _this.scheduledWaitlist.waitlistingFor[0].lastName, phoneNo: _this.scheduledWaitlist.phoneNumber });
                        _this.wtlst_for_fname = _this.scheduledWaitlist.waitlistingFor[0].firstName;
                        _this.wtlst_for_lname = _this.scheduledWaitlist.waitlistingFor[0].lastName;

                        _this.commObj['communicationPhNo'] = _this.scheduledWaitlist.waitlistPhoneNumber;
                        _this.commObj['communicationPhCountryCode'] = _this.scheduledWaitlist.countryCode;
                        _this.commObj['communicationEmail'] = _this.scheduledWaitlist.waitlistingFor[0]['email'];

                        if (_this.scheduledWaitlist.waitlistingFor[0].whatsAppNum) {
                            _this.commObj['comWhatsappNo'] = _this.scheduledWaitlist.waitlistingFor[0].whatsAppNum.number;
                            _this.commObj['comWhatsappCountryCode'] = _this.scheduledWaitlist.waitlistingFor[0].whatsAppNum.countryCode;
                        } else {
                            _this.commObj['comWhatsappNo'] = _this.parentCustomer.primaryMobileNo;
                            _this.commObj['comWhatsappCountryCode'] = _this.parentCustomer.countryCode;
                        }
                        _this.consumerNote = _this.scheduledWaitlist.consumerNote;
                    }
                    _this.checkin_date = _this.scheduledWaitlist.date;
                    _this.isFutureDate = _this.dateTimeProcessor.isFutureDate(_this.serverDate, _this.checkin_date);
                    _this.sel_loc = _this.scheduledWaitlist.queue.location.id;
                    _this.selectedServiceId = _this.scheduledWaitlist.service.id;
                    _this.checkinDate = _this.scheduledWaitlist.date;
                    resolve(true);
                }, () => {
                    resolve(false);
                }));
        })

    }
    rescheduleWaitlist() {
        const post_Data = {
            'ynwUuid': this.rescheduleUserId,
            'date': this.checkinDate,
            'queue': this.queueId,
            'consumerNote': this.consumerNote
        };
        if (this.selectedMessage.files.length > 0 && this.currentAttachment && this.currentAttachment.length > 0) {
            for (let index = 0; index < this.currentAttachment.length; index++) {
                this.filesToUpload.push(this.currentAttachment[index]);
            }
            post_Data['attachments'] = this.filesToUpload;
        } else if (this.selectedMessage.files.length > 0 && !this.currentAttachment) {
            post_Data['attachments'] = this.filesToUpload;

        }
        console.log(post_Data)
        this.subs.add(this.consumerService.rescheduleConsumerWaitlist(this.accountId, post_Data)
            .subscribe(
                () => {
                    let queryParams = {
                        uuid: this.rescheduleUserId,
                        type: 'waitlistreschedule'
                    }
                    let navigationExtras: NavigationExtras = {
                        queryParams: queryParams
                    };
                    this.router.navigate([this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
                },
                error => {
                    // this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                }));
    }
    resetApiErrors() {
        this.emailerror = null;
    }

    setServiceDetails(serviceId) {
        let activeService = this.services.filter(service => service.id === serviceId)[0];
        console.log("Active Servicce:", activeService);
        if (activeService) {
            this.selectedService = {
                name: activeService.name,
                duration: activeService.serviceDuration,
                description: activeService.description,
                livetrack: activeService.livetrack,
                price: activeService.totalAmount,
                isPrePayment: activeService.isPrePayment,
                minPrePaymentAmount: activeService.minPrePaymentAmount,
                status: activeService.status,
                taxable: activeService.taxable,
                serviceType: activeService.serviceType,
                virtualServiceType: activeService.virtualServiceType,
                virtualCallingModes: activeService.virtualCallingModes,
                postInfoEnabled: activeService.postInfoEnabled,
                postInfoText: activeService.postInfoText,
                postInfoTitle: activeService.postInfoTitle,
                preInfoEnabled: activeService.preInfoEnabled,
                preInfoTitle: activeService.preInfoTitle,
                preInfoText: activeService.preInfoText,
                consumerNoteMandatory: activeService.consumerNoteMandatory,
                consumerNoteTitle: activeService.consumerNoteTitle,
                maxBookingsAllowed: activeService.maxBookingsAllowed,
                showOnlyAvailableSlots: activeService.showOnlyAvailableSlots,
                servicegallery: activeService.servicegallery
            };
            this.getBookingCoupons();
            if (activeService.provider) {
                this.selectedService['provider'] = activeService.provider;
                this.selectedUserId = activeService.provider.id;
                this.setUserDetails(this.selectedUserId);
            }
            if (this.departmentEnabled) {
                this.selectedDeptId = activeService.department;
                this.setDepartmentDetails(this.selectedDeptId);
            }
            this.getBookingCoupons();
            if (activeService.serviceAvailability && activeService.serviceAvailability.availableDate) {
                this.checkinDate = activeService.serviceAvailability.availableDate;
            } else {
                this.checkinDate = this.dateTimeProcessor.getToday(this.serverDate);
            }
            if (activeService.virtualCallingModes) {
                this.setVirtualInfoServiceInfo(activeService, this.type);
            }
            this.getQueuesbyLocationServiceAndDate(this.sel_loc, this.selectedServiceId, this.checkinDate, this.accountId).then(
                (queues: any) => {
                    this.queuejson = queues;
                    this.setQDetails(queues);
                }
            )
        }
    }
    setDepartmentDetails(departmentId) {
        const deptDetail = this.departments.filter(dept => dept.departmentId === departmentId);
        this.selectedDept = deptDetail[0];
    }

    getQueuesbyLocationandServiceIdavailability(locid, servid, accountid) {
        const _this = this;
        console.log("getQueuesbyLocationandServiceIdavailability");
        console.log("Location:" + locid + ", Service Id:" + servid + ", AccountId:" + accountid);
        if (locid && servid && accountid) {
            _this.subs.add(_this.consumerService.getQueuesbyLocationandServiceIdAvailableDates(locid, servid, accountid)
                .subscribe((data: any) => {
                    const availables = data.filter(obj => obj.isAvailable);
                    const availDates = availables.map(function (a) { return a.date; });
                    _this.availableDates = availDates.filter(function (elem, index, self) {
                        return index === self.indexOf(elem);
                    });
                }));
        }
    }
    handleQueueSelection(queue, index) {
        this.sel_queue_indx = index;
        this.sel_queue_id = queue.id;
        this.sel_queue_waitingmins = this.dateTimeProcessor.convertMinutesToHourMinute(queue.queueWaitingTime);
        this.sel_queue_servicetime = queue.serviceTime || '';
        this.sel_queue_name = queue.name;
        this.sel_queue_timecaption = queue.queueSchedule.timeSlots[0]['sTime'] + ' - ' + queue.queueSchedule.timeSlots[0]['eTime'];
        this.sel_queue_personaahead = queue.queueSize;
        if (this.calc_mode === 'Fixed' && queue.timeInterval && queue.timeInterval !== 0) {
            this.getAvailableTimeSlots(queue.queueSchedule.timeSlots[0]['sTime'], queue.queueSchedule.timeSlots[0]['eTime'], queue.timeInterval);
        }
    }
    handleConsumerNote(value) {
        this.consumerNote = value;
    }
    setVirtualInfoServiceInfo(activeService, appointmentType) {
        if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp' || activeService.virtualCallingModes[0].callingMode === 'Phone') {
            if (appointmentType === 'reschedule') {
                if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp') {
                    this.callingModes = this.scheduledWaitlist.virtualService['WhatsApp'];
                } else {
                    this.callingModes = this.scheduledWaitlist.virtualService['Phone'];
                }
                const phNumber = this.scheduledWaitlist.countryCode + this.scheduledWaitlist.phoneNumber;
                const callMode = '+' + activeService.virtualCallingModes[0].value;
                if (callMode === phNumber) {
                    this.changePhone = false;
                } else {
                    this.changePhone = true;
                }
            }
        }
    }

    confirmcheckin(type?) {
        const _this = this;
        if (this.selectedService && this.selectedService.isPrePayment && (!this.commObj['communicationEmail'] || this.commObj['communicationEmail'] === '')) {
            const emaildialogRef = this.dialog.open(ConsumerEmailComponent, {
                width: '40%',
                panelClass: ['loginmainclass', 'popup-class'],
                data: {
                    theme: this.theme
                }
            });
            emaildialogRef.afterClosed().subscribe(result => {
                if (result !== '' && result !== undefined) {
                    this.commObj['communicationEmail'] = result;
                    this.confirmcheckin(type);
                } else {
                    this.isClickedOnce = false;
                    this.goBack('backy');
                }
            });
        } else {
            if (this.waitlist_for.length !== 0) {
                for (const list of this.waitlist_for) {
                    if (list.id === this.parentCustomer.id) {
                        list['id'] = 0;
                    }
                }
            }
            if (this.selectedService.serviceType === 'virtualService' && !this.validateVirtualCallInfo(this.callingModes)) {
                return false;
            }
            if (type === 'checkin') {
                if (this.selectedService && this.selectedService.isPrePayment && !this.paymentMode && this.paymentDetails.amountRequiredNow > 0) {
                    // this.snackbarService.openSnackBar('Please select one payment mode', { 'panelClass': 'snackbarerror' });
                    this.isClickedOnce = false;
                    return false;
                }
                this.performCheckin().then(
                    () => {
                        _this.paymentOperation(this.paymentMode);
                    }
                );
            }
            this.addWaitlistAdvancePayment();
        }
        return true;
    }

    getVirtualServiceInput() {
        let virtualServiceArray = {};
        if (this.callingModes !== '') {
            if (this.selectedService.virtualCallingModes[0].callingMode === 'GoogleMeet' || this.selectedService.virtualCallingModes[0].callingMode === 'Zoom') {
                virtualServiceArray[this.selectedService.virtualCallingModes[0].callingMode] = this.selectedService.virtualCallingModes[0].value;
            } else {
                virtualServiceArray[this.selectedService.virtualCallingModes[0].callingMode] = this.commObj['comWhatsappCountryCode'] + this.commObj['comWhatsappNo'];;
            }
        }
        for (const i in virtualServiceArray) {
            if (i === 'WhatsApp') {
                return virtualServiceArray;
            } else if (i === 'GoogleMeet') {
                return virtualServiceArray;
            } else if (i === 'Zoom') {
                return virtualServiceArray;
            } else if (i === 'Phone') {
                return virtualServiceArray;
            } else if (i === 'VideoCall') {
                return { 'VideoCall': '' };
            }
        }
        return true;
    }
    validateVirtualCallInfo(callingModes) {
        let valid = true;
        if (callingModes === '' || callingModes.length < 10) {
            for (const i in this.selectedService.virtualCallingModes) {
                if (this.selectedService.virtualCallingModes[i].callingMode === 'WhatsApp' || this.selectedService.virtualCallingModes[i].callingMode === 'Phone') {
                    if (!this.commObj['comWhatsappNo']) {
                        // this.snackbarService.openSnackBar('Please enter valid mobile number', { 'panelClass': 'snackbarerror' });
                        valid = false;
                        break;
                    }
                }
            }
        }
        return valid;
    }
    generateInputforCheckin() {
        let post_Data = {
            'queue': {
                'id': this.queueId
            },
            'date': this.checkinDate,
            'service': {
                'id': this.selectedServiceId,
                'serviceType': this.selectedService.serviceType
            },
            'consumerNote': this.consumerNote,
            'countryCode': this.parentCustomer.countryCode,
            'coupons': this.selectedCoupons
        };
        if (this.commObj['communicationEmail'] !== '') {
            this.waitlist_for[0]['email'] = this.commObj['communicationEmail'];
        }
        post_Data['waitlistingFor'] = JSON.parse(JSON.stringify(this.waitlist_for));
        if (this.selectedSlot) {
            post_Data['appointmentTime'] = this.selectedSlot;
        }
        console.log("Mani:", this.selectedService);
        if ((this.selectedUser && this.selectedUser.firstName !== Messages.NOUSERCAP)) {
            post_Data['provider'] = { 'id': this.selectedUser.id };
        } else if (this.selectedService.provider) {
            post_Data['provider'] = { 'id': this.selectedService.provider.id };
        }
        if (this.partySizeRequired) {
            this.holdenterd_partySize = this.enterd_partySize;
            post_Data['partySize'] = Number(this.holdenterd_partySize);
        }
        post_Data['waitlistPhoneNumber'] = this.commObj['communicationPhNo'];
        post_Data['consumer'] = { id: this.parentCustomer.id };
        if (this.jCashInHand > 0 && this.isJCashSelected) {
            post_Data['useCredit'] = this.isJCreditSelected;
            post_Data['useJcash'] = this.isJCashSelected;
        }
        if (this.selectedService.serviceType === 'virtualService') {
            if (this.validateVirtualCallInfo(this.callingModes)) {
                post_Data['virtualService'] = this.getVirtualServiceInput();
            } else {
                return false;
            }
        }
        if (this.selectedMessage.files.length > 0) {
            post_Data['attachments'] = this.filesToUpload;
        }
        post_Data['srvAnswers'] = this.getServiceQuestionaireAnswers();
        return post_Data;
    }
    performCheckin() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Payment Req Id:", _this.paymentRequestId);
            if (_this.paymentRequestId) {
                resolve(true);
            }
            else {
                let post_Data = _this.generateInputforCheckin();
                _this.subs.add(_this.consumerService.addCheckin(_this.accountId, post_Data)
                    .subscribe(data => {
                        const retData = data;
                        _this.uuidList = [];
                        let parentUid;
                        Object.keys(retData).forEach(key => {
                            if (key === '_prepaymentAmount') {
                                _this.prepayAmount = retData['_prepaymentAmount'];
                            } else {
                                _this.trackUuid = retData[key];
                                if (key !== 'parent_uuid') {
                                    _this.uuidList.push(retData[key]);
                                }
                            }
                            parentUid = retData['parent_uuid'];
                        });
                        _this.submitQuestionnaire(parentUid).then(
                            () => {
                                resolve(true);
                            }
                        );
                        if (_this.serviceOPtionInfo && _this.serviceOPtionInfo.answers) {
                            _this.submitserviceOptionQuestionnaire(parentUid).then(
                                () => {
                                    resolve(true);
                                }
                            );
                        }
                    }, (error: any) => {
                        _this.isClickedOnce = false;
                        console.log(error);
                        let errorObj = _this.errorService.getApiError(error);
                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        _this.confirmButton['disabled'] = false;
                        _this.disablebutton = false;
                        _this.paytmGateway = false;
                        _this.razorpayGatway = false;
                    }));
            }
        });
    }
    submitQuestionnaire(uuid) {
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
                _this.subs.add(_this.questionaireService.submitConsumerWaitlistQuestionnaire(dataToSend, uuid, _this.accountId).subscribe((data: any) => {
                    let postData = {
                        urls: []
                    };
                    if (data.urls && data.urls.length > 0) {
                        for (const url of data.urls) {
                            _this.api_loading_video = true;
                            const file = _this.questionAnswers.filestoUpload[url.labelName][url.document];
                            _this.questionaireService.videoaudioS3Upload(file, url.url)
                                .subscribe(() => {
                                    postData['urls'].push({ uid: url.uid, labelName: url.labelName });
                                    if (data.urls.length === postData['urls'].length) {
                                        _this.questionaireService.consumerWaitlistQnrUploadStatusUpdate(uuid, _this.accountId, postData)
                                            .subscribe((data) => {
                                                // this.paymentOperation(paymenttype);
                                                resolve(true);
                                            },
                                                error => {
                                                    _this.isClickedOnce = false;
                                                    let errorObj = _this.errorService.getApiError(error);
                                                    // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                                    _this.disablebutton = false;
                                                    _this.api_loading_video = true;
                                                    resolve(false);
                                                });
                                    }
                                },
                                    error => {
                                        _this.isClickedOnce = false;
                                        let errorObj = _this.errorService.getApiError(error);
                                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                        _this.disablebutton = false;
                                        _this.api_loading_video = true;
                                    });
                        }
                    } else {
                        resolve(true);
                    }
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        _this.disablebutton = false;
                        _this.api_loading_video = true;
                        resolve(false);
                    }));
            } else {
                resolve(true);
            }
        });

    }
    submitserviceOptionQuestionnaire(uuid) {


        const _this = this;
        this.groupedQnr = this.serviceOPtionInfo.answers.answerLine.reduce(function (rv, x) {
            (rv[x.sequenceId] = rv[x.sequenceId] || []).push(x);
            return rv;
        }, {});
        console.log(JSON.stringify(this.groupedQnr));
        console.log('*********************************');
        let finalList = [];
        let finalSubList = [];
        for (var key in this.groupedQnr) {
            if (this.groupedQnr.hasOwnProperty(key)) {
                var val = this.groupedQnr[key];
                val.forEach(element => {
                    if (finalSubList.length === 0) {
                        finalSubList.push(element.dgList[0])
                    }
                    else {
                        finalSubList[0].answer.dataGridList.push(element.dgList[0].answer.dataGridList[0])
                    }

                });
                finalList.push(finalSubList[0]);
                finalSubList = [];
            }
        }

        this.finalDataToSend = {
            'questionnaireId': this.serviceOPtionInfo.answers.questionnaireId,
            'answerLine': finalList
        }
        const data = this.finalDataToSend
        return new Promise(function (resolve, reject) {
            const dataToSend: FormData = new FormData();
            if (data.files) {
                for (const pic of data.files) {
                    dataToSend.append('files', pic, pic['name']);
                }
            }
            const blobpost_Data = new Blob([JSON.stringify(data)], { type: 'application/json' });
            dataToSend.append('question', blobpost_Data);
            _this.subs.add(_this.consumerService.submitConsumerWaitlistServiceOption(dataToSend, uuid, _this.accountId).subscribe((data: any) => {

                resolve(true);
            },
                error => {
                    _this.isClickedOnce = false;
                    let errorObj = _this.errorService.getApiError(error);
                    // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                    resolve(false);
                }));

        });
    }
    paymentOperation(paymenttype?) {
        if (this.paymentDetails && this.paymentDetails.amountRequiredNow > 0) {
            this.setAnalytics('payment_initiated');
            this.startPayment(paymenttype);
        } else {
            let multiple;
            if (this.uuidList.length > 1) {
                multiple = true;
            } else {
                multiple = false;
            }
            let queryParams = {
                uuid: this.uuidList,
                multiple: multiple
            }
            if (this.from) {
                queryParams['isFrom'] = this.from;
            }
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.setAnalytics();
            this.router.navigate([this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
        }
    }

    finishCheckin(status) {
        if (status) {
            this.isClickedOnce = false;
            // this.snackbarService.openSnackBar(Messages.PROVIDER_BILL_PAYMENT, { 'panelClass': 'snackbarnormal' });
            let multiple;
            if (this.uuidList.length > 1) {
                multiple = true;
            } else {
                multiple = false;
            }
            let queryParams = {
                uuid: this.uuidList,
                multiple: multiple
            }
            if (this.from) {
                queryParams['isFrom'] = this.from;
            }
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.setAnalytics();
            this.ngZone.run(() => this.router.navigate([this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras));
        } else {
            this.closeloading();
        }
    }
    transactionCompleted(response, payload, accountId) {
        if (response.SRC) {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.razorpayService.updateRazorPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.setAnalytics('payment_completed');
                            this.finishCheckin(true);
                        }
                    },
                        error => {
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                if (response.error && response.error.description) {
                    // this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
                }
                this.finishCheckin(false);
            }
        } else {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.paytmService.updatePaytmPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.setAnalytics('payment_completed');
                            this.finishCheckin(true);
                        }
                    },
                        error => {
                        })
            } else if (response.STATUS == 'TXN_FAILURE') {
                // this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
                this.finishCheckin(false);
            }
        }
    }
    closeloading() {
        this.loadingPaytm = false;
        this.cdRef.detectChanges();
        return false;
    }
    showCheckinButtonCaption() {
        let caption = '';
        if (this.settingsjson.showTokenId) {
            caption = 'Token';
        } else {
            caption = 'Check-in';
        }
        return caption;
    }
    addMember() {
        this.action = 'addmember';
        this.disable = false;
    }
    handleReturnDetails(obj) {
        this.addmemberobj.fname = obj.fname || '';
        this.addmemberobj.lname = obj.lname || '';
        this.addmemberobj.mobile = obj.mobile || '';
        this.addmemberobj.gender = obj.gender || '';
        this.addmemberobj.dob = obj.dob || '';
        this.disable = false;
    }
    handleSaveMember() {
        this.disable = true;
        let derror = '';
        const namepattern = new RegExp(projectConstantsLocal.VALIDATOR_CHARONLY);
        const phonepattern = new RegExp(projectConstantsLocal.VALIDATOR_NUMBERONLY);
        const phonecntpattern = new RegExp(projectConstantsLocal.VALIDATOR_PHONENUMBERCOUNT10);
        const blankpattern = new RegExp(projectConstantsLocal.VALIDATOR_BLANK);
        if (!namepattern.test(this.addmemberobj.fname) || blankpattern.test(this.addmemberobj.fname)) {
            derror = 'Please enter a valid first name';
        }
        if (derror === '' && (!namepattern.test(this.addmemberobj.lname) || blankpattern.test(this.addmemberobj.lname))) {
            derror = 'Please enter a valid last name';
        }
        if (derror === '') {
            if (this.addmemberobj.mobile !== '') {
                if (!phonepattern.test(this.addmemberobj.mobile)) {
                    derror = 'Phone number should have only numbers';
                } else if (!phonecntpattern.test(this.addmemberobj.mobile)) {
                    derror = 'Enter a 10 digit mobile number';
                }
            }
        }
        if (derror === '') {
            const post_data = {
                'firstName': this.addmemberobj.fname.trim(),
                'lastName': this.addmemberobj.lname.trim()
            };
            if (this.addmemberobj.mobile !== '') {
                post_data['primaryMobileNo'] = this.addmemberobj.mobile;
                post_data['countryCode'] = '+91';
            }
            if (this.addmemberobj.gender !== '') {
                post_data['gender'] = this.addmemberobj.gender;
            }
            if (this.addmemberobj.dob !== '') {
                post_data['dob'] = this.addmemberobj.dob;
            }

            let fn;
            post_data['parent'] = this.parentCustomer.id;
            fn = this.consumerService.addMembers(post_data);
            this.subs.add(fn.subscribe(() => {
                this.apiSuccess = this.wordProcessor.getProjectMesssages('MEMBER_CREATED');
                this.setConsumerFamilyMembers(this.parentCustomer).then();
                setTimeout(() => {
                    this.goBack();
                }, projectConstantsLocal.TIMEOUT_DELAY);
            },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    this.apiError = this.wordProcessor.getProjectErrorMesssages(errorObj, this.sharedService.getTerminologies());
                    this.disable = false;
                }));
        } else {
            this.apiError = derror;
        }
        setTimeout(() => {
            this.apiError = '';
            this.apiSuccess = '';
        }, 2000);
    }
    getPartysizeDetails(domain, subdomain) {
        this.subs.add(this.consumerService.getPartysizeDetails(domain, subdomain)
            .subscribe(data => {
                this.partysizejson = data;
                this.partySize = false;
                this.maxsize = 1;
                if (this.partysizejson.partySize) {
                    this.partySize = true;
                    this.maxsize = (this.partysizejson.maxPartySize) ? this.partysizejson.maxPartySize : 1;
                }
                if (this.partySize && !this.partysizejson.partySizeForCalculation) { // check whether partysize box is to be displayed to the user
                    this.partySizeRequired = true;
                }
                if (this.partysizejson.partySizeForCalculation) { // check whether multiple members are allowed to be selected
                    this.multipleMembers_allowed = true;
                }
            },
                () => {
                })
        );
    }
    validatorPartysize(pVal) {
        let errmsg = '';
        const numbervalidator = projectConstantsLocal.VALIDATOR_NUMBERONLY;
        this.enterd_partySize = pVal;
        if (!numbervalidator.test(pVal)) {
            errmsg = 'Please enter a valid party size';
        } else {
            if (pVal > this.maxsize) {
                errmsg = 'Sorry ... the maximum party size allowed is ' + this.maxsize;
            }
        }
        return errmsg;
    }
    setUserDetails(selectedUserId) {
        const userDetail = this.users.filter(user => user.id === selectedUserId);
        this.selectedUser = userDetail[0];
    }
    getDepartmentById(deptId) {
        for (let i = 0; i < this.departments.length; i++) {
            if (deptId === this.departments[i].departmentId) {
                this.selectedDept = this.departments[i];
                break;
            }
        }
    }
    filesSelected(event, type) {

        let loggedUser = this.groupService.getitemFromGroupStorage('ynw-user');
        const input = event.target.files;
        let fileUploadtoS3 = [];
        if (input.length > 0) {
            const _this = this;
            this.api_loading = true;
            this.confirmButton['disabled'] = true;
            this.subscriptionService.sendMessage({ ttype: 'loading_start' });
            this.fileService.filesSelected(event, _this.selectedMessage).then(
                () => {
                    let index = _this.filesToUpload && _this.filesToUpload.length > 0 ? _this.filesToUpload.length : 0;
                    for (const pic of input) {
                        const size = pic["size"] / 1024;
                        let fileObj = {
                            owner: loggedUser.id,
                            ownerType: "ProviderConsumer",
                            fileName: pic["name"],
                            fileSize: size / 1024,
                            caption: "",
                            fileType: pic["type"].split("/")[1],
                            action: 'add'
                        }
                        console.log("pic", pic)
                        fileObj['file'] = pic;
                        fileObj['type'] = type;
                        fileObj['order'] = index;
                        _this.filesToUpload.push(fileObj);
                        fileUploadtoS3.push(fileObj);
                        index++;
                    }
                    _this.consumerService.uploadFilesToS3(fileUploadtoS3, this.accountId).subscribe(
                        (s3Urls: any) => {
                            if (s3Urls && s3Urls.length > 0) {
                                _this.uploadAudioVideos(s3Urls).then(
                                    (status) => {
                                        if (status) {
                                            this.api_loading = false;
                                            this.confirmButton['disabled'] = false;
                                            _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });

                                        }
                                    }
                                );
                            }
                        }, error => {
                            this.api_loading = false;
                            this.confirmButton['disabled'] = false;
                            _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
                            // _this.snackbarService.openSnackBar(error,
                            //     { panelClass: "snackbarerror" }
                            // );
                        }
                    );
                }).catch((error) => {
                    this.api_loading = false;
                    this.confirmButton['disabled'] = false;
                    this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
                    // _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                })
        }
        console.log('addWaitlistAttachment', this.filesToUpload)
    }

    uploadAudioVideos(data) {
        const _this = this;
        let count = 0;
        return new Promise(async function (resolve, reject) {
            for (const s3UrlObj of data) {
                console.log('_this.filesToUpload', _this.filesToUpload)
                let file = _this.filesToUpload.filter((fileObj) => {
                    return ((fileObj.order === (s3UrlObj.orderId)) ? fileObj : '');
                })[0];
                console.log("File:", file);
                _this.attachments = file;
                if (file) {
                    file['driveId'] = s3UrlObj.driveId;
                    await _this.uploadFiles(file['file'], s3UrlObj.url, s3UrlObj.driveId).then(
                        () => {
                            count++;
                            if (count === data.length) {
                                resolve(true);
                                console.log('_this.filesToUpload', _this.filesToUpload)
                            }
                        }
                    );
                }
                else {
                    resolve(true);
                }
            }
        })
    }
    uploadFiles(file, url, driveId) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.consumerService.videoaudioS3Upload(url, file)
                .subscribe(() => {
                    console.log("Final Attchment Sending Attachment Success", file)
                    _this.consumerService.videoaudioS3UploadStatusUpdate('COMPLETE', driveId, _this.accountId).subscribe((data: any) => {
                        resolve(true);
                    })
                }, error => {
                    console.log('error', error)
                    // _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
                    resolve(false);
                });
        })
    }
    deleteTempImage(i) {
        this.selectedMessage.files.splice(i, 1);
        this.selectedMessage.base64.splice(i, 1);
        this.selectedMessage.caption.splice(i, 1);
        this.filesToUpload.splice(i, 1);
        this.fileInput.nativeElement.value = '';
    }


    sendWLAttachment(accountId, uuid, dataToSend) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.subs.add(_this.consumerService.addWaitlistAttachment(accountId, uuid, dataToSend).subscribe(
                () => {
                    resolve(true);
                }, (error) => {
                    reject(error);
                }));
        });
    }


    getOneTimeQuestionAnswers(event) {
        this.oneTimeInfo = event;
    }
    consumerNoteAndFileSave(parentUid) {
        console.log("Parent Id:", parentUid);
        const dataToSend = {
            medium: {
                email: false,
                sms: false,
                pushNotification: false,
                telegram: false,
                whatsApp: false
            },
            attachments: this.filesToUpload,
        };
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.sendWLAttachment(_this.accountId, parentUid, dataToSend).then(
                () => {
                    if (_this.type !== 'waitlistreschedule') {
                        _this.submitQuestionnaire(parentUid).then(
                            () => {
                                resolve(true);
                            }
                        );
                    } else {
                        let queryParams = {
                            uuid: _this.rescheduleUserId,
                            type: 'waitlistreschedule'
                        }
                        let navigationExtras: NavigationExtras = {
                            queryParams: queryParams
                        };
                        _this.setAnalytics();
                        _this.router.navigate([_this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
                    }
                }
            )
        });
    }
    getAvailableTimeSlots(QStartTime, QEndTime, interval) {
        const _this = this;
        const allSlots = _this.jaldeeTimeService.getTimeSlotsFromQTimings(interval, QStartTime, QEndTime);
        this.availableSlots = allSlots;
        const filter = {};
        const activeSlots = [];
        filter['queue-eq'] = _this.sel_queue_id;
        filter['location-eq'] = _this.sel_loc;
        let future = false;
        const waitlist_date = new Date(this.checkinDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        waitlist_date.setHours(0, 0, 0, 0);
        if (today.valueOf() < waitlist_date.valueOf()) {
            future = true;
        }
        this.selectedSlot = '';
        if (!future) {
            _this.subs.add(_this.consumerService.getWaitlistToday(filter).subscribe(
                (waitlist: any) => {
                    for (let i = 0; i < waitlist.length; i++) {
                        if (waitlist[i]['appointmentTime']) {
                            activeSlots.push(waitlist[i]['appointmentTime']);
                        }
                    }
                    const slots = allSlots.filter(x => !activeSlots.includes(x));
                    this.availableSlots = slots;
                    this.selectedSlot = this.availableSlots[0];
                }
            ));
        } else {
            filter['date-eq'] = _this.checkinDate;
            _this.subs.add(_this.consumerService.getWaitlistFuture(filter).subscribe(
                (waitlist: any) => {
                    for (let i = 0; i < waitlist.length; i++) {
                        if (waitlist[i]['appointmentTime']) {
                            activeSlots.push(waitlist[i]['appointmentTime']);
                        }
                    }
                    const slots = allSlots.filter(x => !activeSlots.includes(x));
                    this.availableSlots = slots;
                    this.selectedSlot = this.availableSlots[0];
                }
            ));
        }
    }
    handleSideScreen(action) {
        this.action = action;
    }
    checkCouponvalidity() {
        const post_Data = this.generateInputforCheckin();
        const param = { 'account': this.accountId };
        this.subs.add(this.consumerService.addWaitlistAdvancePayment(param, post_Data)
            .subscribe(data => {
                this.paymentDetails = data;
                this.paymentLength = Object.keys(this.paymentDetails).length;
                this.jCashInHand = this.paymentDetails.eligibleJcashAmt.jCashAmt;
                this.jCreditInHand = this.paymentDetails.eligibleJcashAmt.creditAmt;
                this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow;
                if (this.isJCashSelected && this.paymentDetails.amountRequiredNow > this.jCashInHand) {
                    this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow - this.jCashInHand;
                } else if (this.isJCashSelected && this.paymentDetails.amountRequiredNow <= this.jCashInHand) {
                    this.paymentDetails['amountToPay'] = 0;
                }
                this.amountToPayAfterJCash = this.paymentDetails['amountToPay'];
                if (this.paymentDetails['amountToPay'] > 0) {
                    this.setConvenientFee();
                }
                this.setConfirmButton();
            },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                }));
    }
    getPic(user) {
        if (user.profilePicture) {
            return this.sharedService.getJson(user.profilePicture)['url'];
        }
        return 'assets/images/img-null.svg';
    }
    handleDepartment(dept) {
        this.servicesjson = this.serviceslist;
        const deptServices = [];
        for (let i = 0; i < this.servicesjson.length; i++) {
            if (this.servicesjson[i].department === dept.departmentId) {
                deptServices.push(this.serviceslist[i]);
            }
        }
        for (let i = 0; i < deptServices.length; i++) {
            if (deptServices[i].provider) {
                deptServices[i].provider['businessName'] = this.getUserName(deptServices[i].provider.id);
            }
        }
        this.servicesjson = deptServices;
        this.action = 'service';
    }
    getUserName(id) {
        let selectedUser = '';
        for (let i = 0; i < this.users.length; i++) {
            if (this.users[i].id === id) {
                selectedUser = this.users[i];
                break;
            }
        }
        if (selectedUser['businessName']) {
            return selectedUser['businessName'];
        } else {
            if (selectedUser['firstName'] && selectedUser['lastName']) {
                return (selectedUser['firstName'] + ' ' + selectedUser['lastName']);
            } else {
                return '';
            }
        }
    }
    updateEmail(post_data) {
        const _this = this;
        const passtyp = 'consumer';
        return new Promise(function (resolve, reject) {
            _this.subs.add(_this.consumerService.updateProfile(post_data, passtyp)
                .subscribe(
                    () => {
                        resolve(true);
                    },
                    error => {
                        reject(error);
                    }));
        });
    }
    disableButn() {
        console.log("Calling Disable:", this.checkinDate === this.scheduledWaitlist.date && this.scheduledWaitlist.queue && this.queueId);
        console.log(this.checkinDate);
        console.log(this.scheduledWaitlist.date);
        console.log(this.scheduledWaitlist.queue.id);
        console.log(this.queueId);
        if (this.queuesLoaded && this.checkinDate === this.scheduledWaitlist.date && this.scheduledWaitlist.queue && this.scheduledWaitlist.queue.id === this.queueId) {

            return true;
        } else {
            return false;
        }
    }
    getServiceQuestionaireAnswers() {
        let serviceOPtionInfo = this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
        let itemArray = this.lStorageService.getitemfromLocalStorage('itemArray');
        if (itemArray && itemArray.length > 0) {
            let srvAnswerstoSend = {};
            srvAnswerstoSend['answerLine'] = [];
            srvAnswerstoSend['answerLine'] = [];
            srvAnswerstoSend['answerLine'][0] = {};
            srvAnswerstoSend['answerLine'][0]['answer'] = {};
            let newDataGrid = [];
            for (let i = 0; i < itemArray.length; i++) {
                newDataGrid.push(itemArray[i].columnItem[0])
            }
            srvAnswerstoSend['answerLine'] = newDataGrid;
            if (serviceOPtionInfo && serviceOPtionInfo.answers && serviceOPtionInfo.answers.questionnaireId) {
                srvAnswerstoSend['questionnaireId'] = serviceOPtionInfo.answers.questionnaireId;
            }
            return srvAnswerstoSend;
        } else {
            return null;
        }
    }
    addWaitlistAdvancePayment() {
        let post_Data = this.generateInputforCheckin();
        const param = { 'account': this.accountId };
        this.subs.add(this.consumerService.addWaitlistAdvancePayment(param, post_Data)
            .subscribe(data => {
                this.paymentDetails = data;
                this.paymentLength = Object.keys(this.paymentDetails).length;
                this.jCashInHand = this.paymentDetails.eligibleJcashAmt.jCashAmt;
                this.jCreditInHand = this.paymentDetails.eligibleJcashAmt.creditAmt;
                this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow;
                if (this.isJCashSelected && this.paymentDetails.amountRequiredNow > this.jCashInHand) {
                    this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow - this.jCashInHand;
                } else if (this.isJCashSelected && this.paymentDetails.amountRequiredNow <= this.jCashInHand) {
                    this.paymentDetails['amountToPay'] = 0;
                }
                this.amountToPayAfterJCash = this.paymentDetails['amountToPay'];
                if (this.paymentDetails['amountToPay'] > 0) {
                    this.setConvenientFee();
                }
                this.setConfirmButton();
            }, error => {
                this.isClickedOnce = false;
                let errorObj = this.errorService.getApiError(error);
                // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            }));
    }
    setConvenientFee() {
        const _this = this;
        let convienientPaymentObj = {}
        convienientPaymentObj = {
            "profileId": _this.profileId,
            "amount": _this.paymentDetails.amountRequiredNow
        }
        _this.consumerService.getConvenientFeeOfProvider(_this.accountId, convienientPaymentObj).subscribe((data: any) => {
            _this.convenientPaymentModes = data;
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
            _this.setTotalAmountWithConvenientFee();
        });
    }
    goThroughJCash(paymentMode) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            let post_data = {
                'amountToPay': _this.paymentDetails.amountToPay,
                'accountId': _this.accountId,
                'uuid': _this.trackUuid,
                'paymentPurpose': 'prePayment',
                'isJcashUsed': _this.isJCashSelected,
                'isJcreditUsed': false,
                'isRazorPayPayment': false,
                'isPayTmPayment': false,
            }
            if (_this.amountToPayAfterJCash === 0) {
                post_data['paymentMode'] = "JCASH";
            } else {
                post_data['paymentMode'] = paymentMode;
                post_data['isInternational'] = _this.isInternational;
                post_data['serviceId'] = _this.selectedServiceId;
            }
            _this.consumerService.PayByJaldeewallet(post_data).subscribe(data => {
                resolve(data);
            }, (error) => {
                reject(error);
            })
        })
    }
    getPaymentRequest(paymentMode) {
        const _this = this;
        let paymentReqInfo = {
            'amount': _this.paymentDetails.amountRequiredNow,
            'paymentMode': null,
            'uuid': _this.trackUuid,
            'accountId': _this.accountId,
            'purpose': 'prePayment'
        };
        paymentReqInfo.paymentMode = paymentMode;
        paymentReqInfo['serviceId'] = _this.selectedServiceId;
        paymentReqInfo['isInternational'] = _this.isInternational;
        if (_this.paymentRequestId) {
            paymentReqInfo['paymentRequestId'] = _this.paymentRequestId;
        }
        _this.convenientPaymentModes.map((res: any) => {
            _this.convenientFeeObj = res;
            if ((_this.convenientFeeObj && _this.convenientFeeObj.isInternational && _this.isInternational)
                || (_this.convenientFeeObj && !_this.convenientFeeObj.isInternational && !_this.isInternational)) {
                if (_this.paymentMode === _this.convenientFeeObj.mode && _this.isInternational === _this.convenientFeeObj.isInternational) {
                    paymentReqInfo['convenientFee'] = _this.convenientFeeObj.consumerGatewayFee;
                    paymentReqInfo['convenientFeeTax'] = _this.convenientFeeObj.consumerGatewayFeeTax;
                    paymentReqInfo['jaldeeConvenienceFee'] = _this.convenientFeeObj.convenienceFee;
                    paymentReqInfo['profileId'] = _this.paymentmodes.profileId;
                    paymentReqInfo['paymentSettingsId'] = _this.convenientFeeObj.paymentSettingsId;
                    paymentReqInfo['paymentGateway'] = _this.convenientFeeObj.gateway;
                }
            }
        });
        return paymentReqInfo;
    }
    startPayment(paymentMode) {
        const _this = this;
        _this.paymentReqInfo = _this.getPaymentRequest(paymentMode);

        _this.lStorageService.setitemonLocalStorage('uuid', _this.trackUuid);
        _this.lStorageService.setitemonLocalStorage('acid', _this.accountId);
        _this.lStorageService.setitemonLocalStorage('p_src', 'c_c');
        if (_this.isJCashSelected) {
            _this.goThroughJCash(paymentMode).then(
                (pData: any) => {
                    _this.wallet = pData;
                    if (_this.balanceToPay === 0) {
                        if (!_this.wallet.isGateWayPaymentNeeded && _this.wallet.isJCashPaymentSucess) {
                            let multiple; // for checkin only
                            if (this.uuidList.length > 1) {
                                multiple = true;
                            } else {
                                multiple = false;
                            }
                            setTimeout(() => {
                                _this.setAnalytics();
                                _this.router.navigate([_this.sharedService.getRouteID(),'booking', 'confirm'], { queryParams: { account_id: _this.accountId, uuid: _this.trackUuid } });
                            }, 500);
                        }
                    } else if (_this.balanceToPay > 0) {
                        if (pData.isGateWayPaymentNeeded == true && pData.isJCashPaymentSucess == true) {
                            if (pData.paymentGateway == 'PAYTM') {
                                _this.payWithPayTM(pData.response, _this.accountId);
                            } else {
                                _this.paywithRazorpay(pData.response);
                            }
                        }
                    }
                }
            ).catch(error => {
                _this.isClickedOnce = false;
                let errorObj = _this.errorService.getApiError(error);
                // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectMesssages(errorObj), { 'panelClass': 'snackbarerror' });
            })
        } else {
            this.subs.add(this.consumerService.consumerPayment(this.paymentReqInfo)
                .subscribe((pData: any) => {
                    console.log("PDATA", JSON.stringify(pData));
                    this.paymentRequestId = pData['paymentRequestId'];
                    this.pGateway = pData.paymentGateway;
                    if (this.pGateway === 'RAZORPAY') {
                        this.paywithRazorpay(pData);
                    } else {
                        if (pData['response']) {
                            this.payWithPayTM(pData, this.accountId);
                        } else {
                            this.isClickedOnce = false;
                            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages('CHECKIN_ERROR'), { 'panelClass': 'snackbarerror' });
                        }
                    }
                }, error => {
                    this.isClickedOnce = false;
                    let errorObj = this.errorService.getApiError(error);
                    // this.snackbarService.openSnackBar(this.wordProcessor.getProjectMesssages(errorObj), { 'panelClass': 'snackbarerror' });
                }));
        }
    }
    payWithPayTM(pData: any, accountId: any) {
        this.loadingPaytm = true;
        pData.paymentMode = this.paymentMode;
        this.paytmService.initializePayment(pData, accountId, this);
    }

    paywithRazorpay(pData: any) {
        pData.paymentMode = this.paymentMode;
        this.razorpayService.initializePayment(pData, this.accountId, this);
    }
    getImage(url, file) {
        return this.fileService.getImage(url, file);
    }
    getThumbUrl(attachment) {
        if (attachment && attachment.s3path) {
            if (attachment.s3path.indexOf('.pdf') !== -1) {
                return attachment.thumbPath;
            } else {
                return attachment.s3path;
            }
        }
    }
    getAttachLength() {
        let length = this.selectedMessage.files.length;
        if (this.type == 'waitlistreschedule' && this.scheduledWaitlist && this.scheduledWaitlist.attachments && this.scheduledWaitlist.attachments[0] && this.scheduledWaitlist.attachments[0].s3path) {
            length = length + this.scheduledWaitlist.attachments.length;
        }
        return length;
    }
    actionCompleted() {
        if (this.action !== 'members' && this.action !== 'addmember' && this.action !== 'note' && this.action !== 'attachment' && this.action !== 'coupons') {
        }
        if (this.action === 'members') {
            this.saveMemberDetails();
        } else if (this.action === 'addmember') {
            this.handleSaveMember();
        } else if (this.action === 'note' || this.action === 'attachment') {
            this.goBack();
        }
    }
    popupClosed() {
        if (this.waitlistForPrev && this.waitlistForPrev.length > 0) {
            this.waitlist_for = this.waitlistForPrev;
        }
    }
    getQuestionAnswers(event) {
        this.questionAnswers = event;
        console.log("consCheckin questionnaire :", this.questionAnswers)
    }
    getConsumerQuestionnaire() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            const consumerid = (_this.waitlist_for[0].id === _this.parentCustomer.id) ? 0 : _this.waitlist_for[0].id;
            _this.subs.add(_this.consumerService.getConsumerQuestionnaire(_this.selectedServiceId, consumerid, _this.accountId).subscribe(data => {
                _this.questionnaireList = data;
                _this.questionnaireLoaded = true;

                resolve(true);
            }, () => {
                resolve(false);
            }));
        })
    }

    setValidateError(errors) {
        this.apiErrors = [];
        if (errors.length > 0) {
            for (let error of errors) {
                this.apiErrors[error.questionField] = [];
            }
        }
    }
    successGoback() {
        this.filestoUpload = [];
        this.questionAnswers.emit('reload');
    }
    //step5
    uploadAudioVideo(data, uuid?) {
        console.log("upload Audio :", data)
        if (data.urls && data.urls.length > 0) {
            let postData = {
                urls: []
            };
            for (const url of data.urls) {
                const file = this.filestoUpload[url.labelName][url.document];
                this.questionaireService.videoaudioS3Upload(file, url.url)
                    .subscribe(() => {
                        postData['urls'].push({ uid: url.uid, labelName: url.labelName });
                        if (data.urls.length === postData['urls'].length) {
                            this.questionaireService.consumerWaitlistQnrUploadStatusUpdate(this.trackUuid, this.accountId, postData)
                                .subscribe((data) => {
                                    this.successGoback();
                                },
                                    error => {
                                        let errorObj = this.errorService.getApiError(error);
                                        // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                    });
                        }
                    },
                        error => {
                            let errorObj = this.errorService.getApiError(error);
                            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        });
            }
        } else {
            this.successGoback();
        }
    }
    //step4
    resubmitConsumerWaitlistQuestionnaire(body) {
        this.questionaireService.resubmitConsumerOrderQuestionnaire(body, this.uuid, this.accountId).subscribe(data => {
            this.uploadAudioVideo(data);
        }, error => {
            let errorObj = this.errorService.getApiError(error);
            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
        });
    }
    submitConsumerWaitlistQuestionnaire(body, uuid?) {
        console.log("submit uuid:", uuid)
        this.questionaireService.submitConsumerWaitlistQuestionnaire(body, this.trackUuid, this.accountId).subscribe(data => {
            this.uploadAudioVideo(data, uuid);
        }, error => {
            let errorObj = this.errorService.getApiError(error);
            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
        });
    }
    //step3 
    validateConsumerQuestionnaireResubmit(answers, dataToSend, uuid?) {

        this.questionaireService.validateConsumerQuestionnaireResbumit(answers, this.accountId).subscribe((data: any) => {
            this.setValidateError(data);
            if (data.length === 0) {
                this.submitConsumerWaitlistQuestionnaire(dataToSend, uuid);
            }
        }, error => {
            let errorObj = this.errorService.getApiError(error);
            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
        });
    }
    submitQuestionnaireAnswers(passData, uuid?) {
        console.log("Submitttttt : ", uuid)
        const dataToSend: FormData = new FormData();
        if (passData && passData.answers) {
            const blobpost_Data = new Blob([JSON.stringify(passData.answers)], { type: 'application/json' });
            dataToSend.append('question', blobpost_Data);
            this.validateConsumerQuestionnaireResubmit(passData.answers, dataToSend, uuid);
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
                    if (this.selectedService.consumerNoteMandatory && this.consumerNote == '') {
                        // this.snackbarService.openSnackBar('Please provide ' + this.selectedService.consumerNoteTitle, { 'panelClass': 'snackbarerror' });
                    } else {
                        this.bookStep++;
                        this.confirmcheckin();
                    }
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
        }
    }
    isNumeric(evt) {
        return this.commonService.isNumeric(evt);
    }
    viewAttachments() {
        this.action = 'attachment';
        this.modal.nativeElement.click();
    }
    showText() {
        this.readMore = !this.readMore;
    }

    changeJcashUse(event) {
        if (event.checked) {
            this.isJCashSelected = true;
            this.paymentDetails['amountToPay'] = this.amountToPayAfterJCash;
        } else {
            this.isJCashSelected = false;
            this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow;
        }
    }

    /**
     * Returns the family Members
     * @param parentId parent consumer id
     */
    setConsumerFamilyMembers(parentId) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.familyMembers = [];
            _this.consumerService.getMembers(_this.providerConsumerId).subscribe(
                (members: any) => {
                    for (const member of members) {
                        if (member.id !== parentId) {
                            _this.familyMembers.push(member);
                        }
                    }
                    resolve(_this.familyMembers);
                }
            )
        })
    }
    saveMemberDetails() {
        const _this = this;
        this.resetApiErrors();
        this.emailerror = '';
        this.phoneError = '';
        this.whatsapperror = '';
        this.changePhone = true;
        if (this.commObj['communicationPhNo'] && this.commObj['communicationPhNo'].trim() !== '') {
        } else {
            // this.snackbarService.openSnackBar('Please enter phone number', { 'panelClass': 'snackbarerror' });
            return false;
        }
        if (this.selectedService && this.selectedService.virtualCallingModes && this.selectedService.virtualCallingModes[0].callingMode === 'WhatsApp') {
            if (!this.commObj['comWhatsappCountryCode'] || (this.commObj['comWhatsappCountryCode'] && this.commObj['comWhatsappCountryCode'].trim() === '')) {
                // this.snackbarService.openSnackBar('Please enter country code', { 'panelClass': 'snackbarerror' });
                return false;
            }
            if (this.commObj['comWhatsappNo'] && this.commObj['comWhatsappNo'].trim() !== '') {
                this.callingModes = this.commObj['comWhatsappCountryCode'].replace('+', '') + this.commObj['comWhatsappNo'];
            } else {
                // this.snackbarService.openSnackBar('Please enter whatsapp number', { 'panelClass': 'snackbarerror' });
                return false;
            }
        }
        if (this.commObj['communicationEmail'] && this.commObj['communicationEmail'].trim() !== '') {
            const pattern = new RegExp(projectConstantsLocal.VALIDATOR_EMAIL);
            const result = pattern.test(this.commObj['communicationEmail']);
            if (!result) {
                this.emailerror = "Email is invalid";
                return false;
            } else {
                this.waitlist_for[0]['email'] = this.commObj['communicationEmail'];
            }
        }
        this.wtlst_for_fname = this.waitlist_for[0].firstName;
        this.wtlst_for_lname = this.waitlist_for[0].lastName;
        _this.providerConsumerId = this.waitlist_for[0].id;
        this.getOneTimeInfo(_this.providerConsumerId, this.accountId).then((questions) => {
            console.log("Questions1:", questions);
            if (questions) {
                this.onetimeQuestionnaireList = questions;
                if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                    this.bookStep = 3;
                }
            }
        })
        this.closebutton.nativeElement.click();
        setTimeout(() => {
            this.action = '';
        }, 500);
        return true;
    }

    /**
     * 
     * @param selectedMembers 
     */
    memberSelected(selectedMembers) {
        console.log(selectedMembers);
        this.waitlistForPrev = this.waitlist_for;
        this.waitlist_for = selectedMembers;
        console.log(this.waitlist_for);
        if (this.selectedService && this.selectedService.minPrePaymentAmount) {
            this.prepaymentAmount = this.waitlist_for.length * this.selectedService.minPrePaymentAmount || 0;
        }
        this.serviceCost = this.waitlist_for.length * this.selectedService.price;
    }

    /**
     * 
     * @param commObj 
     */
    setCommunications(commObj) {
        this.commObj = commObj;
    }

    /**
     * Set communication parameters
     * @param parentCustomer logged in customer
     */
    initCommunications(spConsumer) {
        console.log("initCommunications", spConsumer);
        const _this = this;
        if (spConsumer.email) {
            _this.commObj['communicationEmail'] = spConsumer.email;
        }
        _this.commObj['communicationPhNo'] = spConsumer.phoneNo;
        _this.commObj['communicationPhCountryCode'] = spConsumer.countryCode;
        if (spConsumer.whatsAppNum && spConsumer.whatsAppNum.number && spConsumer.whatsAppNum.number.trim() != '') {
            _this.commObj['comWhatsappNo'] = spConsumer.whatsAppNum.number;
            _this.commObj['comWhatsappCountryCode'] = spConsumer.whatsAppNum.countryCode;
        } else {
            _this.commObj['comWhatsappNo'] = _this.commObj['communicationPhNo'];
            _this.commObj['comWhatsappCountryCode'] = _this.commObj['communicationPhCountryCode'];
        }
        this.storageService.clear();
    }

    /**
     * Method to check privacy policy
     * @param status true/false
     */
    policyApproved(status) {
        this.checkPolicy = status;
    }
    actionPerformed(status) {
        if (!this.serviceOptionApptt) {
            const _this = this;
            if (status === 'success') {
                _this.initCheckin().then(
                    () => {
                        _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                            (questions) => {
                                console.log("Questions:", questions);
                                if (questions) {
                                    _this.onetimeQuestionnaireList = questions;
                                    if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                        _this.bookStep = 3;
                                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        this.confirmcheckin('next');
                                    }
                                    _this.loggedIn = true;
                                } else {
                                    if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        this.confirmcheckin('next');
                                    }
                                    _this.loggedIn = true;
                                }
                                _this.loading = false;
                            }
                        )
                    }
                );
            }
        }
        else {
            const _this = this;
            if (status === 'success') {
                _this.initCheckin().then(
                    () => {
                        _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                            (questions) => {
                                console.log("Questions:", questions);
                                if (questions) {
                                    _this.onetimeQuestionnaireList = questions;
                                    if (this.showSlot) {
                                        _this.bookStep = 2;
                                    }
                                    else if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                        _this.bookStep = 3;
                                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        this.confirmcheckin('next');
                                    }
                                    _this.loggedIn = true;
                                } else {
                                    if (this.showSlot) {
                                        _this.bookStep = 2;
                                    }
                                    else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        this.confirmcheckin('next');
                                    }
                                    _this.loggedIn = true;
                                }
                                _this.loading = false;
                            }
                        )
                    }
                );
            }
        }
    }
    showSpec() {
        if (this.showmoreSpec) {
            this.showmoreSpec = false;
        } else {
            this.showmoreSpec = true;
        }
    }

    // BookStep = 1 --- Date/Time--ServiceName
    // BookStep = 2 --- Virtual Form
    // BookStep = 3 --- Questionaire
    // BookStep = 4 --- Review/Confirm / File / Note
    goToStep(type) {
        const _this = this;
        console.log("BookStep:" + this.bookStep);
        if (type === 'next') {
            switch (this.bookStep) {
                case 1: // Date/Time--ServiceName
                    this.authService.goThroughLogin().then((status) => {
                        console.log("Status:", status);
                        if (status) {
                            _this.initCheckin().then(
                                (status) => {
                                    _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                                        (questions) => {
                                            console.log("Questions:", questions);
                                            if (questions) {
                                                _this.onetimeQuestionnaireList = questions;
                                                if (this.showSlot) {
                                                    _this.bookStep = 2;
                                                }
                                                else if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                                    _this.bookStep = 3;
                                                } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    this.confirmcheckin('next');
                                                }
                                                _this.loggedIn = true;
                                            } else {
                                                if (this.showSlot) {
                                                    _this.bookStep = 2;
                                                }
                                                else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    this.confirmcheckin('next');
                                                }
                                                _this.loggedIn = true;
                                            }
                                            _this.loading = false;
                                        }
                                    )
                                }
                            );
                        } else {
                            _this.loggedIn = false;
                        }
                    });
                    break;
                case 2: // Date/Time--ServiceName
                    this.authService.goThroughLogin().then((status) => {
                        console.log("Status:", status);
                        if (status) {
                            _this.initCheckin().then(
                                (status) => {
                                    _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                                        (questions) => {
                                            console.log("Questions:", questions);
                                            if (questions) {
                                                _this.onetimeQuestionnaireList = questions;
                                                if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                                    _this.bookStep = 3;
                                                } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    this.confirmcheckin('next');
                                                }
                                                _this.loggedIn = true;
                                            } else {

                                                if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    this.confirmcheckin('next');
                                                }
                                                _this.loggedIn = true;
                                                this.setAnalytics('dateTime_login');
                                            }
                                            _this.loading = false;
                                        }
                                    )
                                }
                            );
                        } else {
                            _this.loggedIn = false;
                            this.setAnalytics('dateTime_withoutlogin');
                        }
                    });
                    break;
                case 3: //Virtual Fields
                    _this.validateOneTimeInfo();
                    break;
                case 4:
                    this.validateQuestionnaire();
                    break;
                case 5:
                    if (this.selectedService.consumerNoteMandatory && this.consumerNote == '') {
                        // this.snackbarService.openSnackBar('Please provide ' + this.selectedService.consumerNoteTitle, { 'panelClass': 'snackbarerror' });
                        return false;
                    }
                    break;
            }
        } else if (type === 'prev') {
            if (!this.serviceOptionApptt) {
                if (this.bookStep === 5) {
                    if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
                        this.bookStep = 4;
                    } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                        _this.bookStep = 3;
                    }
                    else if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {

                        this.bookStep = 2;
                    }
                }
                else if (this.bookStep === 4) {
                    if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                        _this.bookStep = 3;
                    }
                    else if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 2;
                    }
                }
                else if (this.bookStep === 3) {
                    if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 2;
                    }
                }
                else if (this.bookStep === 3) {
                    if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 2;
                    }
                } else {
                    this.location.back();
                }
            }
            else {
                if (this.bookStep === 5) {
                    if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
                        this.bookStep = 4;
                    } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                        _this.bookStep = 3;
                    }
                    else if (this.showSlot) {
                        _this.bookStep = 2;
                    }
                    else {
                        this.bookStep = 1;
                    }
                } else if (this.bookStep === 4) {
                    if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                        _this.bookStep = 3;
                    }
                    else if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 1;
                    }
                }
                else if (this.bookStep === 3) {
                    if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 1;
                    }
                } else {
                    this.bookStep--;
                }
            }

        } else {
            this.bookStep = type;
        }
        if (this.bookStep === 5) {
            this.confirmcheckin('next');
        }
        return true;
    }
    validateOneTimeInfo() {
        let _this = this
        console.log("OneTime:", _this.oneTimeInfo);
        if (!_this.oneTimeInfo) {
            _this.oneTimeInfo = {
                answers: {
                    answerLine: [],
                    questionnaireId: _this.onetimeQuestionnaireList.id
                }
            }
        }
        console.log("Before Validation", _this.oneTimeInfo);
        if (_this.oneTimeInfo.answers) {
            const questions = _this.oneTimeInfo.answers.answerLine.map(function (a) { return a.labelName; })
            const dataToSend: FormData = new FormData();
            const answer = new Blob([JSON.stringify(_this.oneTimeInfo.answers)], { type: 'application/json' });
            const question = new Blob([JSON.stringify(questions)], { type: 'application/json' });
            dataToSend.append('answer', answer);
            dataToSend.append('question', question);
            _this.consumerService.validateConsumerOneTimeQuestionnaire(dataToSend, _this.accountId, _this.providerConsumerId).subscribe((data: any) => {
                if (data.length === 0) {
                    _this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                _this.getBookStep();
                            }
                        })
                }
                _this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = _this.errorService.getApiError(error);
                // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
        }
    }
    submitOneTimeInfo() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                const activeUser = _this.groupService.getitemFromGroupStorage('ynw-user');
                const dataToSend: FormData = new FormData();
                if (_this.oneTimeInfo.files) {
                    for (const pic of _this.oneTimeInfo.files) {
                        dataToSend.append('files', pic, pic['name']);
                    }
                }
                const blobpost_Data = new Blob([JSON.stringify(_this.oneTimeInfo.answers)], { type: 'application/json' });
                dataToSend.append('question', blobpost_Data);
                _this.subs.add(_this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.providerConsumerId, _this.accountId).subscribe((data: any) => {
                    resolve(true);
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        _this.disablebutton = false;
                        resolve(false);
                    }));
            } else {
                resolve(true);
            }
        });
    }

    getOneTimeInfo(providerConsumerID, accountId) {
        const _this = this;
        console.log("Get one time info:", providerConsumerID);
        return new Promise(function (resolve, reject) {
            _this.consumerService.getProviderCustomerOnetimeInfo(providerConsumerID, accountId).subscribe(
                (questions) => {
                    resolve(questions);
                }, () => {
                    resolve(false);
                }
            )
        }
        )
    }

    getBookStep() {
        console.log("In Get Bookstep");
        if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
            this.bookStep = 4;
        } else {
            this.bookStep = 5;
            this.confirmcheckin();
        }
    }
    goBack(type?) {
        if (type) {
            if (this.bookStep === 1) {
                let source = this.lStorageService.getitemfromLocalStorage('source');
                if (source) {
                    window.location.href = source;
                    this.lStorageService.removeitemfromLocalStorage('reqFrom');
                    this.lStorageService.removeitemfromLocalStorage('source');
                } else {
                    this.location.back();
                }
            } else {
                if (this.bookStep === 2 && !this.serviceOptionApptt) {
                    let source = this.lStorageService.getitemfromLocalStorage('source');
                    if (source) {
                        window.location.href = source;
                        this.lStorageService.removeitemfromLocalStorage('reqFrom');
                        this.lStorageService.removeitemfromLocalStorage('source');
                    } else {
                        this.location.back();
                    }
                } else {
                    this.goToStep('prev');
                }
            }
        }
        if (this.action !== 'addmember') {
            this.closebutton.nativeElement.click();
        }
        setTimeout(() => {
            if (this.action === 'note' || this.action === 'members' || (this.action === 'service' && !this.departmentEnabled)
                || this.action === 'attachment' || this.action === 'coupons' || this.action === 'departments' ||
                this.action === 'phone' || this.action === 'email') {
                this.action = '';
            } else if (this.action === 'addmember') {
                this.action = 'members';
            } else if (this.action === 'service' && this.departmentEnabled) {
                this.action = '';
            } else if (this.action === 'preInfo') {
                this.action = '';
            }
        }, 500);
    }
    slotSelected(slot) {
        console.log("slotsleected:", slot);
        this.selectedQTime = slot.queueSchedule.timeSlots[0]['sTime'] + ' - ' + slot.queueSchedule.timeSlots[0]['eTime'];
        this.personsAhead = slot.queueSize;
        this.waitingTime = this.dateTimeProcessor.convertMinutesToHourMinute(slot.queueWaitingTime);
        this.serviceTime = slot.serviceTime || '';
        this.queueId = slot.id;
    }
    couponCheck(event) {
        console.log("envent", event.target.checked)
        this.couponChecked = event.target.checked;
    }
    privacyClicked(e) {
        e.preventDefault();
        this.privacy = !this.privacy;
    }
    privacyCheck(event) {
        this.checkPolicy = event.target.checked;
        this.setButtonVisibility();
    }
    setAnalytics(source?) {
        let analytics = {
            accId: this.accountProfile.id,
            domId: this.accountProfile.serviceSector.id,
            subDomId: this.accountProfile.serviceSubSector.id
        }
        if (source === 'dateTime_login') {
            analytics['metricId'] = 523;
        } else if (source === 'dateTime_withoutlogin') {
            analytics['metricId'] = 524;
        } else if (source === 'payment_initiated') {
            analytics['metricId'] = 528;
        } else if (source === 'payment_completed') {
            analytics['metricId'] = 531;
        } else {
            analytics['metricId'] = 504;
        }
        this.consumerService.updateAnalytics(analytics).subscribe();
    }
    couponActionPerformed(action) {
        switch (action.ttype) {
            case 'open':
                this.openCoupons();
                break;
            case 'validate':
                this.selectedCoupons = action['value'];
                this.checkCouponvalidity();
                break;
        }
    }
    setCouponAvailability() {
        this.isCouponsAvailable = false;
        if ((this.s3CouponsList.JC.length > 0) && this.type != 'waitlistreschedule' || (this.s3CouponsList.OWN.length > 0) && this.type != 'waitlistreschedule') {
            this.isCouponsAvailable = true;
        }
    }
    getBookingCoupons() {
        const _this = this;
        _this.s3CouponsList = { JC: [], OWN: [] };
        _this.getCoupons().then((coupons: any) => {
            if (coupons && coupons.jaldeeCoupons) {
                let jcCoupons = coupons.jaldeeCoupons.filter(coupon => coupon.couponStatus === 'ACTIVE');
                _this.s3CouponsList.JC = jcCoupons;
                if (_this.s3CouponsList.JC.length > 0) {
                    _this.showCouponWB = true;
                }
            }
            if (coupons && coupons.providerCoupons) {
                _this.s3CouponsList.OWN = coupons.providerCoupons;
                if (_this.s3CouponsList.OWN.length > 0) {
                    _this.showCouponWB = true;
                }
            }
            _this.setCouponAvailability();
        }).catch((error) => {
            // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(error), { 'panelClass': 'snackbarerror' });
            _this.btnClicked = false;
        });
    }
    getCoupons() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.consumerService.getCheckinCoupons(_this.selectedServiceId, _this.sel_loc)
                .subscribe((res: any) => {
                    resolve(res);
                }, (error) => {
                    reject(error);
                });
        });
    }
    confirmClicked(status) {
        if (status) {
            return false;
        }
        this.goToStep('next');
        this.actionCompleted();
        return true;
    }
    confirmBooking() {

        switch (this.confirmButton['action']) {
            case 'reschedule':
                this.rescheduleWaitlist();
                break;
            default:
                this.confirmcheckin('checkin');
                break;
        }
    }
    setConfirmButton() {
        if (this.type === 'waitlistreschedule' && !this.selectedService.noDateTime) {
            this.confirmButton['caption'] = 'Reschedule';
            this.confirmButton['action'] = "reschedule";
        } else if (this.paymentDetails.amountRequiredNow > 0) {
            this.confirmButton['caption'] = 'Make Payment';
            this.confirmButton['action'] = "payment";
        } else {
            this.confirmButton['caption'] = 'Confirm';
            this.confirmButton['action'] = "confirm";
        }
    }
    setButtonVisibility() {
        if ((this.bookingPolicy && !this.checkPolicy) || this.isClickedOnce) {
            this.confirmButton['disabled'] = true;
        } else {
            this.confirmButton['disabled'] = false;
        }
    }
}    
