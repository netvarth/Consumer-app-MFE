import { AfterViewChecked, AfterViewInit, ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { MatDialog } from "@angular/material/dialog";
import { Location } from "@angular/common";
import { TranslateService } from "@ngx-translate/core";
import { MatCalendarCellCssClasses } from "@angular/material/datepicker";
import { Subscription } from "rxjs";
import { AccountService, AuthService, ConsumerService, DateTimeProcessor, ErrorMessagingService, FileService, GroupStorageService, LocalStorageService, Messages, PaytmService, projectConstantsLocal, QuestionaireService, RazorpayService, SharedService, StorageService, SubscriptionService, WordProcessor } from "jconsumer-shared";
import { CouponsComponent } from "../../shared/coupons/coupons.component";
import { ConsumerEmailComponent } from "../../shared/consumer-email/consumer-email.component";

@Component({
    selector: 'app-appointment',
    templateUrl: './appointment.component.html',
    styleUrls: ['./appointment.component.scss']
})
export class AppointmentComponent implements OnInit, OnDestroy, AfterViewInit, AfterViewChecked {

    private subs: Subscription = new Subscription();
    scheduledAppmtId  // scheduled appointment id for reschedule
    selectedTime;     // To hold the appointment time
    locationId;       // Location id where appointment to take
    dateChanged;      // To check whether appt is for current day or not
    isFutureDate;     // To know taken appt day is for future or today
    accountId;        // To hold the Account Id
    // uniqueId;         // To hold the S3 Unique Id
    appmtDate;        // Appointment Date;
    isTeleService;    // To know service is Virtual Service or not
    businessInfo: any = {}; // To hold Business Name, Location, Map Url etc.
    selectedUser;     // Appointment for which user/doctor
    selectedUserId;   // Appointment for which user/doctor id
    selectedServiceId;// Id of the appointment service
    selectedDept;     // Department of the selected service
    selectedDeptId;     // Department Id of the selected service
    departmentEnabled;// Department Enabled or not
    theme;            // Selected Theme
    customId;         // To know whether req came from customapp/qr link
    smallDevice;      // To know whether device is mobile or desktop
    serverDate;       // To store the server date
    selectedDate: Date = new Date();
    terminologies;    // To hold the terminology json
    accountType;      // To know the account type Branch/Individual SP/SP User etc
    appointmentType;  // Reschedule or not
    multipleSelection;// To allow multiple slot selection or not
    scheduledAppointment;// To store the scheduled appointment for rescheduled
    users = [];            // To store the users/providers/doctors
    selectedSlots: any = [] // To hold the appointment slots selected
    datePresent = true;
    s3CouponsList: any = { JC: [], OWN: [] };    // To store the coupons list available in s3
    showCouponWB;     // To show hide the Coupon Work Bench area

    note_placeholder; // To hold the Place holder text for note text area according to domain
    note_cap = '';    // To hold the caption for note text area
    consumerNote = '';// consumer note input

    loggedIn = true;  // To check whether user logged in or not
    loading = true;
    consumer_label: any;

    loadingService = true;   // To check whether service details is fetched or not
    isPaymentRequired;
    services: any;    // To store services json
    selectedService: any; // To store selected appointment service details
    callingModes: any = []; // To store the teleservice calling mode whatsapp/jaldee video/zoom etc
    changePhone;     // Change phone number or not
    departments: any = [];     // departments

    allSlots;       // All slots for a particular schedule
    freeSlots: any = [];      // All available slots in custom manner

    availableDates: any = []; // to show available appointment dates in calendar
    bookStep;       // To show the steps onetime info/slot selection/ take appt/questionaire etc
    callingModesDisplayName = projectConstantsLocal.CALLING_MODES; // calling modes list-whatsapp/phone/zoom/googlemeet/jaldeevideo etc.
    isSlotAvailable = false; // To set slot availability
    selectedApptsTime;
    oneTimeInfo: any; // One time information
    onetimeQuestionnaireList: any; // one time information questionaire list
    questionAnswers; // questionaire answers
    questionnaireList: any = []; // normal questionaire list
    questionnaireLoaded = false; // to check questionaire loaded or not
    appmtFor: any = []; // to hold the whom for appointment
    parentCustomer: any;// logged in customer
    commObj: any = {}; // communication object
    familyMembers: any = []; // hold the members
    providerConsumerId; // id of the selected provider consumer
    providerConsumerList: any;
    addmemberobj = { 'fname': '', 'title': '', 'lname': '', 'mobile': '', 'gender': '', 'dob': '' };
    cdnPath: string = '';
    balanceAmount: any;
    paymentDetails: any = [];

    selectedCoupons: any = [];
    trackUuid: any;
    prepayAmount: any;
    isInternational: boolean;
    paymentMode: any;
    paytmEnabled: boolean;
    razorpayEnabled: boolean;
    interNationalPaid: boolean;
    paymentmodes: any;
    isPayment: boolean;
    indian_payment_modes: any;
    non_indian_modes: any;
    shownonIndianModes: boolean;
    priceList: any;
    newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
    @ViewChild('consumer_appointment') paytmview;
    paymentRequestId;
    // paymentBtnDisabled = false;

    imgCaptions: any = [];
    @ViewChild('imagefile') fileInput: ElementRef;
    selectedMessage = {
        files: [],
        base64: [],
        caption: []
    }; // storing message to be uploaded
    @ViewChild('modal') modal; // referring modal object
    @ViewChild('membersModalTrigger') membersModalTrigger: ElementRef;
    @ViewChild('closebutton') closebutton;
    @ViewChild('paymentModeSection') paymentModeSection: ElementRef;
    action = ''; // To navigate between different actions like note/upload/add familymember/members etc
    loadedConvenientfee;
    checkPolicy = true;
    isClickedOnce = false;
    apiError = '';
    apiSuccess = '';
    emailError = null;
    phoneError: string;
    whatsappError = '';
    disable = false;
    appointmentIdsList: any[];
    wallet: any;
    pGateway: any;
    loadingPaytm: boolean;
    from: string;
    api_loading_video;
    serviceCost: any;
    prepaymentAmount: number;
    applied_inbilltime = Messages.APPLIED_INBILLTIME;
    add_member_cap = Messages.ADD_MEMBER_CAP;
    tooltipcls = '';
    slotLoaded = false;
    btnClicked = false // To avoid double click
    apptDetails_firstName;
    apptDetails_lastName;
    apptDetails_title;
    convenientPaymentModes: any = [];
    convenientFeeObj: any;
    convenientFee: any;
    paymentReqInfo: any = {}
    gatewayFee: any;
    profileId: any;
    serviceOPtionInfo: any;
    serviceOptionQuestionnaireList: any;
    groupedQnr: any;
    finalDataToSend: any;
    serviceOptionApptt = false;
    showSlot = true;
    showNext = false;
    readMore = false;
    serviceTotalPrice: number;
    paymentLength = 0;
    advPostData: any;
    accountConfig: any;
    account: any;
    accountProfile: any;
    moment;
    event: any;
    coupondialogRef: any;
    privacy = false;
    fromApp = false;
    results: any;
    isJCashSelected;
    isJCreditSelected;
    jCashInHand;
    jCreditInHand;
    balanceToPay;
    isPaymentNeeded;
    isCouponsAvailable: boolean = false;
    confirmButton = { 'caption': 'Confirm', 'disabled': false };
    payAmountLabel = '';
    amountToPayAfterJCash: any;
    bookingPolicy: boolean;
    bookingPolicyContent: any;
    bookingPolicyPath: any;
    showmoreSpec = false;
    selectedLocation: any;
    filesToUpload: any = [];
    attachments: any;
    api_loading: boolean;
    booking_firstName: any;
    booking_lastName: any;
    currentAttachment: any;
    showLumaSpinner = false;
    lumaOverlayMode: 'loading' | 'message' = 'loading';
    lumaOverlayMessage = '';
    lumaOverlayDismissible = false;
    paymentmodescroll = true;
    pendingScrollToTop = false;
    constructor(
        private activatedRoute: ActivatedRoute,
        private lStorageService: LocalStorageService,
        private subscriptionService: SubscriptionService,
        private wordProcessor: WordProcessor,
        private dateTimeProcessor: DateTimeProcessor,
        private consumerService: ConsumerService,
        // private snackbarService: SnackbarService,
        private questionaireService: QuestionaireService,
        private authService: AuthService,
        private groupService: GroupStorageService,
        private dialog: MatDialog,
        private router: Router,
        private paytmService: PaytmService,
        private razorpayService: RazorpayService,
        private ngZone: NgZone,
        private location: Location,
        private cdRef: ChangeDetectorRef,
        private fileService: FileService,
        private errorService: ErrorMessagingService,
        private accountService: AccountService,
        public translate: TranslateService,
        private storageService: StorageService,
        private sharedService: SharedService
    ) {
        this.moment = this.dateTimeProcessor.getMoment();
        this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
        this.subscriptionService.sendMessage({ ttype: 'hideBookingsAndLocations' });

        this.subs.add(this.activatedRoute.queryParams.subscribe(
            params => {
                if(params['ad_loc']) {
                    let location = this.accountService.getActiveLocation();
                    this.locationId = location.id;
                } else {
                    this.locationId = params['loc_id'];
                }
                if (params['src']) {
                    this.lStorageService.setitemonLocalStorage('source', params['src']);
                    this.lStorageService.setitemonLocalStorage('reqFrom', 'CUSTOM_WEBSITE');
                }
                if (params['ctime']) {
                    this.selectedTime = params['ctime']
                }
                this.dateChanged = params['cur'];
                if (params['sel_date']) {
                    this.appmtDate = params['sel_date'];
                }

                if (params['service_id']) { this.selectedServiceId = parseInt(params['service_id']); }
                if (params['user']) {
                    this.selectedUserId = params['user'];
                }
                this.isTeleService = params['tel_serv_stat'];
                if (params['type'] === 'reschedule') {
                    this.appointmentType = params['type'];
                    this.scheduledAppmtId = params['uuid'];
                }
            }))
    }

    @HostListener('window:resize', ['$event'])
    onResize() {
        if (window.innerWidth <= 880) {
            this.smallDevice = true;
        } else {
            this.smallDevice = false;
        }
    }

    ngOnDestroy(): void {
        this.subs.unsubscribe();
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'auto';
        }
    }
    getRescheduledInfo() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            if (!_this.scheduledAppmtId) {
                resolve(true);
            } else {
                _this.setRescheduleInfo(_this.scheduledAppmtId).then(
                    () => {
                        resolve(true);
                    }
                )
            }
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
    ngOnInit(): void {
        const _this = this;
        this.configureScrollRestoration();
        this.scrollToTop();
        this.onResize();
        let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
        this.translate.setDefaultLang(language);
        this.translate.use(language);
        if (this.appmtDate) {
            this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.appmtDate);
        }
        this.account = this.sharedService.getAccountInfo();
        this.accountConfig = this.accountService.getAccountConfig();
        this.selectedLocation = this.accountService.getActiveLocation();
        this.lStorageService.setitemonLocalStorage('c-location', this.selectedLocation.id);
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
        const deptUsers = this.accountService.getJson(this.account['departmentProviders']);
        const settings = this.accountService.getJson(this.account['settings']);
        this.departmentEnabled = settings.filterByDept;
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
        _this.slotLoaded = false;
        _this.getRescheduledInfo().then(() => {
            if (_this.selectedServiceId) { _this.getPaymentModes(); }
            _this.getServicebyLocationId(_this.locationId, _this.appmtDate);
            _this.getSchedulesbyLocationandServiceIdavailability(_this.locationId, _this.selectedServiceId, _this.accountId);
        });
        this.serviceOPtionInfo = this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
        this.getServiceOptions()
        if (this.lStorageService.getitemfromLocalStorage('reqFrom') === 'cuA') {
            this.fromApp = true;
        }
    }
    ngAfterViewInit(): void {
        this.scrollToTop();
    }
    ngAfterViewChecked(): void {
        if (this.pendingScrollToTop && this.bookStep === 5) {
            this.pendingScrollToTop = false;
            this.scrollToTop();
        }
    }
    privacyClicked(e) {
        e.preventDefault();
        this.privacy = !this.privacy;
    }
    privacyCheck(event) {
        this.checkPolicy = event.target.checked;
        this.setButtonVisibility();
    }
    private configureScrollRestoration() {
        if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
            window.history.scrollRestoration = 'manual';
        }
    }
    private scrollToTop() {
        setTimeout(() => {
            if (typeof window !== 'undefined') {
                window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
                document.body.scrollTop = 0;
                document.documentElement.scrollTop = 0;
            }
            if (this.paytmview && this.paytmview.nativeElement) {
                this.paytmview.nativeElement.scrollTop = 0;
            }
        }, 100);
    }
    private handleReviewEntry() {
        if (this.bookStep === 5) {
            this.paymentmodescroll = true;
            this.pendingScrollToTop = true;
            this.scrollToTop();
        }
    }
    setBasicProfile() {
        this.accountId = this.accountProfile.id;
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
        this.businessInfo['businessName'] = this.accountProfile.businessName;

        if (!this.businessInfo['locationName'] && !this.selectedLocation) {
            this.businessInfo['locationName'] = this.accountProfile.baseLocation?.place;
        }
        if (!this.businessInfo['locationName'] && this.selectedLocation && this.selectedLocation.place) {
                this.businessInfo['locationName'] = this.selectedLocation.place;
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
        // if (this.accountProfile.uniqueId === 128007) {
        //     this.heartfulnessAccount = true;
        // }
        // if (this.accountProfile.uniqueId === 46805) {
        //     this.heartfulnessAccount = true;
        // }
    }
    getServiceOptions() {
        this.subs.add(this.consumerService.getServiceoptionsAppt(this.selectedServiceId, this.accountId)
            .subscribe(
                (data) => {
                    if (data) {
                        this.serviceOptionQuestionnaireList = data;
                        if (this.serviceOptionQuestionnaireList.questionnaireId && this.appointmentType !== 'reschedule') {
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

    setDepartmentDetails(departmentId) {
        console.log("Departments:", this.departments);
        const deptDetail = this.departments.filter(dept => dept.departmentId === departmentId);
        this.selectedDept = deptDetail[0];
    }

    /**
     * To Fetch and Set the Current Provider User Details
     * @param selectedUserId
     */
    setUserDetails(selectedUserId) {
        const userDetail = this.users.filter(user => user.id === selectedUserId);
        this.selectedUser = userDetail[0];
    }

    goBack(type?) {
        if (type) {
            console.log(this.bookStep);
            if (this.bookStep === 5 && this.selectedService.noDateTime) {
                this.goToStep('prev');
            }
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
            this.safeCloseModal();
        }
        setTimeout(() => {
            if (this.action === 'note' || this.action === 'members' || (this.action === 'service' && !this.departmentEnabled)
                || this.action === 'attachment' || this.action === 'departments' ||
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
    dateClass(date: Date): MatCalendarCellCssClasses {
        return (this.availableDates.indexOf(this.moment(date).format('YYYY-MM-DD')) !== -1) ? 'example-custom-date-class' : '';
    }
    actionPerformed(status) {
        if (!this.serviceOptionApptt) {
            const _this = this;
            if (status === 'success') {
                _this.initAppointment().then(
                    (status) => {
                        _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                            (questions) => {
                                console.log("Questions:", questions);
                                if (questions) {
                                    _this.onetimeQuestionnaireList = questions;
                                    console.log("OneTime:", _this.onetimeQuestionnaireList);


                                    if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                        _this.bookStep = 3;
                                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        _this.handleReviewEntry();
                                        this.confirmAppointment('next');
                                    }
                                    console.log("Bookstep3:", _this.bookStep);
                                } else {
                                    if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        _this.handleReviewEntry();
                                        this.confirmAppointment('next');
                                    }
                                }
                                _this.loggedIn = true;
                            }
                        )
                    }
                );
            }
        }
        else {
            const _this = this;
            if (status === 'success') {
                _this.initAppointment().then(
                    (status) => {
                        _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                            (questions) => {
                                console.log("Questions:", questions);
                                if (questions) {
                                    _this.onetimeQuestionnaireList = questions;
                                    console.log("OneTime:", _this.onetimeQuestionnaireList);
                                    if (this.showSlot) {
                                        _this.bookStep = 2;
                                    }

                                    else if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                                        _this.bookStep = 3;
                                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        _this.handleReviewEntry();
                                        this.confirmAppointment('next');
                                    }
                                    console.log("Bookstep3:", _this.bookStep);
                                } else {
                                    if (this.showSlot) {
                                        _this.bookStep = 2;
                                    }
                                    else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                        _this.bookStep = 4;
                                    } else {
                                        _this.bookStep = 5;
                                        _this.handleReviewEntry();
                                        this.confirmAppointment('next');

                                    }
                                }
                                _this.loggedIn = true;
                            }
                        )
                    }
                );
            }
        }

    }

    getServicebyLocationId(locationId, appmtDate) {
        const _this = this;
        _this.loadingService = true;
        _this.subs.add(_this.consumerService.getServicesforAppontmntByLocationId(locationId)
            .subscribe(data => {
                _this.services = data;
                _this.selectedService = [];
                if (_this.selectedServiceId) {
                    _this.selectedServiceId = _this.selectedServiceId;
                } else {
                    if (_this.services.length > 0) {
                        _this.selectedServiceId = _this.services[0].id; // set the first service id to the holding variable
                    }
                }
                if (_this.selectedServiceId) {
                    _this.setServiceDetails(this.selectedServiceId);
                }
                _this.loadingService = false;
            },
                () => {
                    _this.loadingService = false;
                    _this.selectedServiceId = '';
                }));

    }

    setVirtualInfoServiceInfo(activeService, appointmentType) {
        if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp' || activeService.virtualCallingModes[0].callingMode === 'Phone') {
            if (appointmentType === 'reschedule') {
                if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp') {
                    this.callingModes = this.scheduledAppointment.virtualService['WhatsApp'];
                } else {
                    this.callingModes = this.scheduledAppointment.virtualService['Phone'];
                }
                const phNumber = this.scheduledAppointment.countryCode + this.scheduledAppointment.phoneNumber;
                const callMode = '+' + activeService.virtualCallingModes[0].value;
                if (callMode === phNumber) {
                    this.changePhone = false;
                } else {
                    this.changePhone = true;
                }
            }
        }
    }

    setServiceDetails(serviceId) {
        let activeService = this.services.filter(service => service.id === serviceId)[0];
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
                showPrice: activeService.showPrice,
                serviceBookingType: activeService.serviceBookingType,
                date: activeService.date,
                dateTime: activeService.dateTime,
                noDateTime: activeService.noDateTime,
                servicegallery: activeService.servicegallery
            };
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
            console.log("Active Service :", this.selectedService);
            if (this.selectedService.noDateTime) {
                if ((this.apptDetails_firstName === undefined && this.apptDetails_lastName === undefined) || this.commObj['communicationPhNo'] === undefined) {
                    console.log("If block :")
                    this.authService.goThroughLogin().then((status) => {
                        console.log("Status:", status);
                        if (status) {
                            const _this = this;
                            _this.initAppointment().then(
                                (status) => {
                                    _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                                        (questions) => {
                                            console.log("Questions:", questions);

                                            _this.bookStep = 5;
                                            _this.handleReviewEntry();
                                            _this.confirmAppointment('next');

                                            _this.loggedIn = true;
                                        }
                                    )
                                }
                            );
                        } else {
                            this.loggedIn = false;
                        }
                    });
                }
                else {
                    console.log("Else block :")
                    this.bookStep = 5;
                    this.handleReviewEntry();
                    this.confirmAppointment('next');
                    this.initAppointment();
                }

            }


            if (activeService.maxBookingsAllowed > 1 && this.appointmentType != 'reschedule') {
                this.multipleSelection = activeService.maxBookingsAllowed;
            } else {
                this.multipleSelection = 1;
            }
            if (activeService.virtualCallingModes) {
                this.setVirtualInfoServiceInfo(activeService, this.appointmentType);
            }
            if (activeService.serviceAvailability && activeService.serviceAvailability.nextAvailableDate) {
                this.appmtDate = activeService.serviceAvailability.nextAvailableDate;
            } else {
                this.appmtDate = this.dateTimeProcessor.getToday(this.serverDate);
            }
            this.getAvailableSlotByLocationandService(this.locationId, this.selectedServiceId, this.appmtDate, this.accountId, 'init');
        }
    }
    apptDateChanged(date) {
        const tdate = date;
        this.ngOnInit();
        console.log("In Appointment Date Changed Method:", tdate);
        const newdate = tdate;
        console.log("New Date :", newdate);
        const futrDte = new Date(newdate);
        console.log("Future Date :", futrDte);
        const obtmonth = futrDte.getMonth() + 1;
        let cmonth = "" + obtmonth;
        if (obtmonth < 10) {
            cmonth = "0" + obtmonth;
        }
        const seldate =
            futrDte.getFullYear() + "-" + cmonth + "-" + futrDte.getDate();
        this.appmtDate = seldate;
        console.log("selected date :", this.appmtDate);
        this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.appmtDate);
        this.slotLoaded = false;
        this.getAvailableSlotByLocationandService(this.locationId, this.selectedServiceId, this.appmtDate, this.accountId);
    }

    getAvailableSlotByLocationandService(locid, servid, appmtDate, accountid, type?) {
        const _this = this;
        _this.selectedSlots = [];
        this.slotLoaded = false;
        console.log("selectedService", _this.selectedService);
        const showOnlyAvailable = _this.selectedService.showOnlyAvailableSlots;
        _this.isSlotAvailable = showOnlyAvailable;
        console.log("showOnlyAvailable:", showOnlyAvailable);
        this.subs.add(_this.consumerService.getSlotsByLocationServiceandDate(locid, servid, appmtDate, accountid)
            .subscribe((data: any) => {
                _this.allSlots = [];
                _this.slotLoaded = true;
                for (const scheduleSlots of data) {
                    const availableSlots = scheduleSlots.availableSlots;
                    for (const slot of availableSlots) {
                        if (showOnlyAvailable && !slot.active) {
                        } else {
                            slot['date'] = scheduleSlots['date'];
                            slot['scheduleId'] = scheduleSlots['scheduleId'];
                            slot['displayTime'] = _this.getSingleTime(slot.time);
                            _this.allSlots.push(slot);
                        }
                    }
                }
                const availableSlots = _this.allSlots.filter(slot => slot.active);
                if (availableSlots && availableSlots.length > 0) {
                    _this.isSlotAvailable = true;
                }
                const timetosel = _this.allSlots.filter(slot => slot.active);
                if (timetosel && timetosel.length > 0) {
                    let apptTimes = [];
                    apptTimes.push(timetosel[0]);
                    _this.slotSelected(apptTimes);
                }
            }));
    }

    getSingleTime(slot) {
        const slots = slot.split('-');
        return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }

    /**
     *  returns Available dates for calendar
     * @param locid location id
     * @param servid service id
     * @param accountid account id
     */
    getSchedulesbyLocationandServiceIdavailability(locid, servid, accountid) {
        const _this = this;
        if (locid && servid && accountid) {
            _this.subs.add(_this.consumerService.getAvailableDatessByLocationService(locid, servid, accountid)
                .subscribe((data: any) => {
                    const availables = data.filter(obj => obj.availableSlots);
                    const availDates = availables.map(function (a) { return a.date; });
                    _this.availableDates = availDates.filter(function (elem, index, self) {
                        return index === self.indexOf(elem);
                    });
                    this.loading = false;
                }));
        }
    }

    appointmentDateChanged(appmtDate) {
        console.log("In Appointment Date Changed Method:", appmtDate);
        this.selectedSlots = [];
        this.appmtDate = appmtDate;
        this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.appmtDate);
        this.slotLoaded = false;
        this.getAvailableSlotByLocationandService(this.locationId, this.selectedServiceId, this.appmtDate, this.accountId);
    }

    slotSelected(slots) {
        const _this = this;
        console.log("Slots:", slots);
        _this.selectedSlots = slots;
        console.log("Slot Selected:", _this.selectedSlots);
        const apptTimings = _this.selectedSlots.filter(obj => obj.time);
        console.log("Appt:", apptTimings);
        const apptTimings1 = apptTimings.map(function (a) { return _this.getSingleTime(a.time) });
        console.log("Appt Timings:", apptTimings1);
        _this.selectedApptsTime = apptTimings1.join(', ');
        console.log("SelectedDate:", this.appmtDate);
        console.log("Selected Timings:", _this.selectedApptsTime);
    }

    // BookStep = 0 --- Date/Time--ServiceName
    // BookStep = 1 --- Virtual Form
    // BookStep = 2 --- Questionaire
    // BookStep = 3 --- Review/Confirm / File / Note
    goToStep(type) {
        const previousStep = this.bookStep;
        const _this = this;
        console.log("BookStep1:" + this.bookStep);
        if (type === 'next') {
            switch (this.bookStep) {
                case 1: // Date/Time--ServiceName
                    this.authService.goThroughLogin().then((status) => {
                        console.log("Status:", status);
                        if (status) {
                            _this.initAppointment().then(
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
                                                    _this.handleReviewEntry();
                                                    this.confirmAppointment('next');
                                                }
                                                console.log("Bookstep2:", _this.bookStep);
                                            } else {
                                                if (this.showSlot) {
                                                    _this.bookStep = 2;
                                                }
                                                else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    _this.handleReviewEntry();
                                                    this.confirmAppointment('next');
                                                }
                                            }
                                            _this.loggedIn = true;
                                        }
                                    )
                                }
                            );
                        } else {
                            this.loggedIn = false;
                        }
                    });
                    break;
                case 2:
                    this.authService.goThroughLogin().then((status) => {
                        console.log("Status:", status);
                        if (status) {
                            _this.initAppointment().then(
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
                                                    _this.handleReviewEntry();
                                                    this.confirmAppointment('next');
                                                }
                                                console.log("Bookstep2:", _this.bookStep);
                                            } else {
                                                if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                                                    _this.bookStep = 4;
                                                } else {
                                                    _this.bookStep = 5;
                                                    _this.handleReviewEntry();
                                                    this.confirmAppointment('next');
                                                }
                                            }
                                            _this.loggedIn = true;
                                            this.setAnalytics('dateTime_login');
                                        }
                                    )
                                }
                            );
                        } else {
                            this.loggedIn = false;
                            this.setAnalytics('dateTime_withoutlogin');
                        }
                    });
                    break;
                case 3:
                    _this.validateOneTimeInfo();
                    break;
                case 4:
                    this.validateQuestionnaire();
                    break;
                case 5:
                    console.log("4 Clicked");
                    if (this.selectedService.consumerNoteMandatory && this.consumerNote == '') {
                        // this.snackbarService.openSnackBar('Please provide ' + this.selectedService.consumerNoteTitle, { 'panelClass': 'snackbarerror' });
                        return false;
                    }
                    this.confirmAppointment('next');
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
                    } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                        _this.bookStep = 3;
                    }
                    else if (this.showSlot) {
                        _this.bookStep = 2;
                    } else {
                        this.bookStep = 1;
                    }
                }
                else if (this.bookStep === 4) {
                    if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
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
        if (this.bookStep === 5 && previousStep !== 5) {
            this.paymentmodescroll = true;
            this.scrollToTop();
        }
        if (this.bookStep === 5) {
            this.confirmAppointment('next');
        }
        return true;
    }

    actionCompleted() {
        if ((this.action === 'members' || this.action === 'addmember') && this.disable) {
            return;
        }
        if (this.action !== 'members' && this.action !== 'addmember' && this.action !== 'note' && this.action !== 'attachment') {
            if (this.appointmentType == 'reschedule' && this.scheduledAppointment.service && this.scheduledAppointment.service.priceDynamic) {
                this.subs.add(this.consumerService.getAppointmentReschedulePricelist(this.scheduledAppointment.service.id).subscribe(
                    (list: any) => {
                        this.priceList = list;
                        let oldprice;
                        let newprice;
                        for (let list of this.priceList) {
                            if (list.schedule.id == this.scheduledAppointment.schedule.id) { // appointment scheduleid
                                oldprice = list.price;
                            }
                            if (list.schedule.id == this.selectedSlots[0]['scheduleId']) { // rescheduledappointment scheduleid
                                newprice = list.price;
                            }
                        }
                        this.balanceAmount = this.scheduledAppointment.amountDue + (newprice - oldprice);
                    }));
            }
        }
        if (this.action === 'members') {
            this.saveMemberDetails();
        } else if (this.action === 'addmember') {
            this.handleSaveMember();
        } else if (this.action === 'note' || this.action === 'attachment') {
            this.goBack();
        }
    }
    handleSaveMember() {
        if (this.disable) {
            return;
        }
        this.disable = true;
        let derror = '';
        const namepattern = new RegExp(projectConstantsLocal.VALIDATOR_CHARONLY);
        const blankpattern = new RegExp(projectConstantsLocal.VALIDATOR_BLANK);
        if (!namepattern.test(this.addmemberobj.fname) || blankpattern.test(this.addmemberobj.fname)) {
            derror = 'Please enter a valid first name';
        }
        if (derror === '' && (!namepattern.test(this.addmemberobj.lname) || blankpattern.test(this.addmemberobj.lname))) {
            derror = 'Please enter a valid last name';
        }
        if (derror === '') {
            const post_data = {
                    'firstName': this.safeTrim(this.addmemberobj.fname),
                    'lastName': this.safeTrim(this.addmemberobj.lname),
                    'title': this.safeTrim(this.addmemberobj.title)
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
                    this.disable = false;
                    this.resetAddMemberObj();
                }, projectConstantsLocal.TIMEOUT_DELAY);
            },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    this.apiError = this.wordProcessor.getProjectErrorMesssages(errorObj, this.sharedService.getTerminologies());
                    this.disable = false;
                }));
        } else {
            this.apiError = derror;
            this.disable = false;
        }
        setTimeout(() => {
            this.apiError = '';
            this.apiSuccess = '';
        }, 2000);
    }
    private resetAddMemberObj() {
        this.addmemberobj = { 'fname': '', 'title': '', 'lname': '', 'mobile': '', 'gender': '', 'dob': '' };
    }
    resetApiErrors() {
        this.emailError = null;
    }
    saveMemberDetails() {
        if (this.disable) {
            return;
        }
        this.disable = true;
        const _this = this;
        this.resetApiErrors();
        this.emailError = '';
        this.phoneError = '';
        this.whatsappError = '';
        this.changePhone = true;
        if (this.safeTrim(this.commObj?.communicationPhNo) !== '') {
        } else {
            // this.snackbarService.openSnackBar('Please enter phone number', { 'panelClass': 'snackbarerror' });
            this.disable = false;
            return false;
        }
        if (this.selectedService && this.selectedService.virtualCallingModes && this.selectedService.virtualCallingModes[0].callingMode === 'WhatsApp') {
            if (this.safeTrim(this.commObj?.comWhatsappCountryCode) === '') {
                // this.snackbarService.openSnackBar('Please enter country code', { 'panelClass': 'snackbarerror' });
                this.disable = false;
                return false;
            }
            if (this.safeTrim(this.commObj?.comWhatsappNo) !== '') {
                this.callingModes = this.commObj['comWhatsappCountryCode'].replace('+', '') + this.commObj['comWhatsappNo'];
            } else {
                // this.snackbarService.openSnackBar('Please enter whatsapp number', { 'panelClass': 'snackbarerror' });
                this.disable = false;
                return false;
            }
        }
        if (this.safeTrim(this.commObj?.communicationEmail) !== '') {
            const pattern = new RegExp(projectConstantsLocal.VALIDATOR_EMAIL);
            const result = pattern.test(this.commObj['communicationEmail']);
            if (!result) {
                this.emailError = "Email is invalid";
                this.disable = false;
                return false;
            } else {
                this.appmtFor[0]['email'] = this.commObj['communicationEmail'];
            }
        }
        this.apptDetails_firstName = this.appmtFor[0].firstName;
        this.apptDetails_lastName = this.appmtFor[0].lastName;
        this.apptDetails_title = this.appmtFor[0].title;
        _this.providerConsumerId = this.appmtFor[0].id;
        this.getOneTimeInfo(_this.providerConsumerId, this.accountId).then((questions) => {
            console.log("Questions1:", questions);
            if (questions) {
                this.onetimeQuestionnaireList = questions;
                if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                    this.bookStep = 3;
                }
            }
        }).catch(() => {
            this.disable = false;
        }).finally(() => {
            this.disable = false;
        });
        this.safeCloseModal();
        setTimeout(() => {
            this.action = '';
            this.disable = false;
        }, 500);
        return true;
    }
    private safeTrim(value: any): string {
        return (value || '').toString().trim();
    }
    private safeCloseModal() {
        if (this.closebutton && this.closebutton.nativeElement) {
            this.closebutton.nativeElement.click();
        }
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
        })
    }
    getOneTimeQuestionAnswers(event) {
        this.oneTimeInfo = event;
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
        if (this.oneTimeInfo.answers) {
            const questions = this.oneTimeInfo.answers.answerLine.map(function (a) { return a.labelName; })
            const dataToSend: FormData = new FormData();
            const answer = new Blob([JSON.stringify(this.oneTimeInfo.answers)], { type: 'application/json' });
            const question = new Blob([JSON.stringify(questions)], { type: 'application/json' });
            dataToSend.append('answer', answer);
            dataToSend.append('question', question);
            this.consumerService.validateConsumerOneTimeQuestionnaire(dataToSend, this.accountId, this.providerConsumerId).subscribe((data: any) => {
                // this.shared_services.validateConsumerQuestionnaire(this.oneTimeInfo.answers, this.account_id).subscribe((data: any) => {
                if (data.length === 0) {
                    this.submitOneTimeInfo().then(
                        (status) => {
                            if (status) {
                                this.getBookStep();
                            }
                        })
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
        }
    }

    getBookStep() {
        if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
            this.bookStep = 4;
        } else {
            this.bookStep = 5;
            this.handleReviewEntry();
            this.confirmAppointment();
        }
    }
    dismissLumaOverlay() {
        this.resetConfirmState();
        // this.showLumaSpinner = false;
        this.router.navigate([this.customId,'bookings']);
    }

    initAppointment() {
        const _this = this;
        _this.appmtFor = [];
        console.log("InitAppointment:");
        return new Promise(function (resolve, reject) {
            _this.storageService.getProviderConsumer().then((spConsumer: any) => {
              _this.parentCustomer = spConsumer;
              _this.providerConsumerId = spConsumer.id;
              console.log("Parent Consumer:", spConsumer);
              _this.apptDetails_firstName = spConsumer.firstName;
              _this.apptDetails_lastName = spConsumer.lastName;
              _this.apptDetails_title = spConsumer.title;
                if (_this.appointmentType != 'reschedule') {
                    _this.appmtFor.push({ id: spConsumer.id, firstName: spConsumer.firstName, lastName: spConsumer.lastName });
                    _this.prepaymentAmount = _this.appmtFor.length * _this.selectedService.minPrePaymentAmount || 0;
                    _this.serviceCost = _this.selectedService.price;
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
                } else {
                    resolve(true);
                }
                _this.initCommunications(spConsumer);
            });
        });
    }
    getConsumerQuestionnaire() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            const consumerid = (_this.appmtFor[0].id === _this.parentCustomer.id) ? 0 : _this.appmtFor[0].id;
            _this.consumerService.getConsumerQuestionnaire(_this.selectedServiceId, consumerid, _this.accountId).subscribe(data => {
                _this.questionnaireList = data;
                _this.questionnaireLoaded = true;
                resolve(true);
            }, () => {
                resolve(false);
            });
        })
    }
    getQuestionAnswers(event) {
        this.questionAnswers = event;
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
                        this.handleReviewEntry();
                        this.confirmAppointment();
                    }
                }
                this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
            }, error => {
                let errorObj = this.errorService.getApiError(error);
                // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
            });
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

    setRescheduleInfo(uuid) {
        const _this = this;
        _this.appmtFor = [];
        return new Promise(function (resolve, reject) {
            _this.subs.add(_this.consumerService.getAppointmentByConsumerUUID(uuid, _this.accountId).subscribe(
                (appt: any) => {
                    _this.scheduledAppointment = appt;
                    console.log('Appointment:', _this.scheduledAppointment);
                    if(_this.scheduledAppointment && _this.scheduledAppointment.attachments && _this.scheduledAppointment.attachments.length > 0) {
                        _this.currentAttachment = _this.scheduledAppointment.attachments;
                    }
                    if (_this.appointmentType === 'reschedule') {
                        _this.appmtFor.push({ id: _this.scheduledAppointment.appmtFor[0].id, firstName: _this.scheduledAppointment.appmtFor[0].firstName, lastName: _this.scheduledAppointment.appmtFor[0].lastName, phoneNo: _this.scheduledAppointment.phoneNumber, apptTime: _this.scheduledAppointment.appmtFor[0].apptTime });
                        _this.commObj['communicationPhNo'] = _this.scheduledAppointment.phoneNumber;
                        _this.commObj['communicationPhCountryCode'] = _this.scheduledAppointment.countryCode;
                        _this.commObj['communicationEmail'] = _this.scheduledAppointment.appmtFor[0]['email'];
                        if (_this.scheduledAppointment.appmtFor[0].whatsAppNum) {
                            _this.commObj['comWhatsappNo'] = _this.scheduledAppointment.appmtFor[0].whatsAppNum.number;
                            _this.commObj['comWhatsappCountryCode'] = _this.scheduledAppointment.appmtFor[0].whatsAppNum.countryCode;
                        } else {
                            _this.commObj['comWhatsappNo'] = _this.parentCustomer.primaryMobileNo;
                            _this.commObj['comWhatsappCountryCode'] = _this.parentCustomer.countryCode;
                        }
                        _this.consumerNote = _this.scheduledAppointment.consumerNote;
                        if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].firstName) {
                            _this.apptDetails_firstName = _this.scheduledAppointment.appmtFor[0].firstName;
                        }
                        if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].lastName) {
                            _this.apptDetails_lastName = _this.scheduledAppointment.appmtFor[0].lastName;
                        }
                        if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].title) {
                            _this.apptDetails_title = _this.scheduledAppointment.appmtFor[0].title;
                        }

                    }
                    if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].firstName) {
                        _this.apptDetails_firstName = _this.scheduledAppointment.appmtFor[0].firstName;
                    }
                    if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].lastName) {
                        _this.apptDetails_lastName = _this.scheduledAppointment.appmtFor[0].lastName;
                    }
                    if (_this.scheduledAppointment && _this.scheduledAppointment.appmtFor[0] && _this.scheduledAppointment.appmtFor[0].title) {
                        _this.apptDetails_title = _this.scheduledAppointment.appmtFor[0].title;
                    }
                    _this.locationId = _this.scheduledAppointment.location.id;
                    _this.selectedServiceId = _this.scheduledAppointment.service.id;
                    _this.appmtDate = _this.scheduledAppointment.appmtDate;
                    console.log('ApptDate:', _this.appmtDate);
                    console.log("Server Date:", _this.serverDate);
                    _this.isFutureDate = _this.dateTimeProcessor.isFutureDate(_this.serverDate, _this.appmtDate);
                    _this.selectedServiceId = _this.scheduledAppointment.service.id;
                    _this.getServicebyLocationId(_this.locationId, _this.appmtDate);
                    _this.getSchedulesbyLocationandServiceIdavailability(_this.locationId, _this.selectedServiceId, _this.accountId);
                    resolve(true);

                }, () => {
                    resolve(false);
                }));
        })

    }

    /**
     *
     * @param commObj
    */
    setCommunications(commObj) {
        this.commObj = commObj;
    }

    getPaymentModes() {
        this.paytmEnabled = false;
        this.razorpayEnabled = false;
        this.interNationalPaid = false;
        this.consumerService.getPaymentModesofProvider(this.accountId, this.selectedServiceId, 'prePayment')
            .subscribe(
                data => {
                    this.paymentmodes = data[0];
                    this.isPayment = true;
                    this.profileId = this.paymentmodes.profileId;
                    console.log("Profile ID :", this.profileId)
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
                    // }
                },
                error => {
                    this.isPayment = false;
                }
            );
    }
    confirmClicked(status) {
        if (status) {
            return false;
        }
        this.goToStep('next');
        this.actionCompleted();
        return true;
    }

    getAttachLength() {
        let length = this.selectedMessage.files.length;
        if (this.scheduledAppointment && this.scheduledAppointment.attachments && this.scheduledAppointment.attachments[0] && this.scheduledAppointment.attachments[0].s3path) {
            length = length + this.scheduledAppointment.attachments.length;
        }
        return length;
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
              _this.consumerService.uploadFilesToS3(fileUploadtoS3,this.accountId).subscribe(
                (s3Urls: any) => {
                  if (s3Urls && s3Urls.length > 0) {
                    _this.uploadAudioVideo(s3Urls).then(
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
                //   _this.snackbarService.openSnackBar(error,
                //     { panelClass: "snackbarerror" }
                //   );
                }
              );
            }).catch((error) => {
               this.api_loading = false;
               this.confirmButton['disabled'] = false;
               this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            //   _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
            })
        }
        console.log('addWaitlistAttachment',this.filesToUpload)
      }

      uploadAudioVideo(data) {
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
            //   _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
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
    handleSideScreen(action) {
        console.log("This.action:", action);
        this.action = action;
        if (action === 'members' && this.membersModalTrigger?.nativeElement) {
            this.membersModalTrigger.nativeElement.click();
        } else if (this.modal && this.modal.nativeElement) {
            this.modal.nativeElement.click();
        }
    }

    checkCouponvalidity() {
        const post_Data = this.generateInputForAppointment();
        post_Data['appmtFor'][0]['apptTime'] = this.selectedSlots[0]['time'];
        post_Data['schedule'] = { 'id': this.selectedSlots[0]['scheduleId'] };
        const param = { 'account': this.accountId };
        console.log(JSON.stringify(post_Data))
        this.subs.add(this.consumerService.addApptAdvancePayment(param, post_Data).subscribe(data => {
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
            let errorObj = this.errorService.getApiError(error);
            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
        }));
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
        confirmAppointment(type?) {
        console.log("this.selectedService",this.selectedService);
        console.log("this.commObj",this.commObj)
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
                    this.confirmAppointment(type);
                } else {
                    this.isClickedOnce = false;
                    this.goBack('backy');
                }
            });
        } else {
            if (this.selectedService.serviceType === 'virtualService' && !this.validateVirtualCallInfo(this.callingModes)) {
                return false;
            }
            if (type === 'appt') {
                this.performAppointment();
            }
            this.addApptAdvancePayment(this.selectedSlots[0]);
        }
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
    changeJcashUse(event) {
        if (event.checked) {
            this.isJCashSelected = true;
            this.paymentDetails['amountToPay'] = this.amountToPayAfterJCash;
        } else {
            this.isJCashSelected = false;
            this.paymentDetails['amountToPay'] = this.paymentDetails.amountRequiredNow;
        }
    }
    addApptAdvancePayment(appmtSlot) {
        let post_Data = this.generateInputForAppointment();
        post_Data['appmtFor'][0]['apptTime'] = appmtSlot['time'];
        post_Data['schedule'] = { 'id': appmtSlot['scheduleId'] };
        const param = { 'account': this.accountId };
        this.subs.add(this.consumerService.addApptAdvancePayment(param, post_Data)
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
        return virtualServiceArray;
    }

    validateVirtualCallInfo(callingModes) {
        let valid = true;
        if (callingModes === '' || callingModes.length < 10) {
            for (const i in this.selectedService.virtualCallingModes) {
                if (this.selectedService.virtualCallingModes[i].callingMode === 'WhatsApp' || this.selectedService.virtualCallingModes[i].callingMode === 'Phone') {
                    if (!this.commObj['comWhatsappNo'] && this.selectedService.serviceBookingType !== 'request') {
                        // this.snackbarService.openSnackBar('Please enter valid mobile number', { 'panelClass': 'snackbarerror' });
                        valid = false;
                        break;
                    }
                }
            }
        }
        return valid;
    }

    generateInputForAppointment() {
        console.log(this.appmtFor);
        if (this.selectedService.serviceBookingType === 'request' && (this.selectedService.date || this.selectedService.dateTime || this.selectedService.noDateTime)) {
            let post_Data = {
                'service': {
                    'id': this.selectedServiceId,
                    'serviceType': this.selectedService.serviceType
                },
                'consumerNote': this.consumerNote,
                'countryCode': this.parentCustomer.countryCode,
                'coupons': this.selectedCoupons,
            };
            console.log(this.selectedMessage)

            if (!this.selectedService.noDateTime) {
                post_Data['appmtDate'] = this.appmtDate
            }
            if (this.selectedUser && this.selectedUser.firstName !== Messages.NOUSERCAP) {
                post_Data['provider'] = { 'id': this.selectedUser.id };
            } else if (this.selectedService.provider) {
                post_Data['provider'] = { 'id': this.selectedService.provider.id };
            }
            if (this.appmtFor.length !== 0) {
                for (const list of this.appmtFor) {
                    if (list.id === this.parentCustomer.id) {
                        list['id'] = 0;
                    }
                }
            }
            if (this.selectedMessage.files.length > 0) {
                post_Data['attachments'] = this.filesToUpload;
              }
            if (this.commObj['communicationEmail'] !== '' && this.appmtFor && this.appmtFor[0]) {
                this.appmtFor[0]['email'] = this.commObj['communicationEmail'];
            }
            if (this.commObj['communicationPhNo'] !== '') {
                post_Data['phoneNumber'] = this.commObj['communicationPhNo'];
            }
            post_Data['appmtFor'] = JSON.parse(JSON.stringify(this.appmtFor));
            if (this.selectedService.serviceType === 'virtualService') {
                if (this.validateVirtualCallInfo(this.callingModes)) {
                    post_Data['virtualService'] = this.getVirtualServiceInput();
                } else {
                    return false;
                }
            }

            post_Data['srvAnswers'] = this.getServiceQuestionaireAnswers();
            console.log("Posting Data request:", post_Data);
            return post_Data;
        }
        else {
            let post_Data = {
                'appmtDate': this.appmtDate,
                'service': {
                    'id': this.selectedServiceId,
                    'serviceType': this.selectedService.serviceType
                },
                'consumerNote': this.consumerNote,
                'countryCode': this.parentCustomer.countryCode,
                'phoneNumber': this.commObj['communicationPhNo'],
                'coupons': this.selectedCoupons,
            };
            if (this.selectedUser && this.selectedUser.firstName !== Messages.NOUSERCAP) {
                post_Data['provider'] = { 'id': this.selectedUser.id };
            } else if (this.selectedService.provider) {
                post_Data['provider'] = { 'id': this.selectedService.provider.id };
            }
            if (this.jCashInHand > 0 && this.isJCashSelected) {
                post_Data['useCredit'] = this.isJCreditSelected;
                post_Data['useJcash'] = this.isJCashSelected;
            }
            if (this.selectedMessage.files.length > 0) {
                post_Data['attachments'] = this.filesToUpload;
              }
            if (this.scheduledAppointment) {
                post_Data['appmtFor'] = this.scheduledAppointment['appmtFor'];
            } else {
                if (this.appmtFor.length !== 0) {
                    for (const list of this.appmtFor) {
                        if (list.id === this.parentCustomer.id) {
                            list['id'] = 0;
                        }
                    }
                }
                if (this.commObj['communicationEmail'] !== '' && this.appmtFor && this.appmtFor[0]) {
                    this.appmtFor[0]['email'] = this.commObj['communicationEmail'];
                }
                post_Data['appmtFor'] = JSON.parse(JSON.stringify(this.appmtFor));
            }
            if (this.selectedService.serviceType === 'virtualService') {
                if (this.validateVirtualCallInfo(this.callingModes)) {
                    post_Data['virtualService'] = this.getVirtualServiceInput();
                } else {
                    return false;
                }
            }
            post_Data['srvAnswers'] = this.getServiceQuestionaireAnswers();
            console.log("Posting Data Normal:", post_Data);
            return post_Data;
        }
    }
    async performAppointment() {
        const _this = this;
        if (this.selectedService && this.selectedService.isPrePayment && !this.paymentMode && this.paymentDetails.amountRequiredNow > 0) {
            // this.snackbarService.openSnackBar('Please select one payment mode', { 'panelClass': 'snackbarerror' });
            this.isClickedOnce = false;
            return false;
        }
        let count = 0;
        let hasError = false;
        for (let i = 0; i < _this.selectedSlots.length; i++) {
            const status = await _this.takeAppointment(_this.selectedSlots[i]);
            if (status) {
                count++;
                if (count === _this.selectedSlots.length) {
                    _this.paymentOperation(_this.paymentMode);
                }
            } else {
                hasError = true;
            }
        }
        return !hasError;
    }
    showSpec() {
        if (this.showmoreSpec) {
            this.showmoreSpec = false;
        } else {
            this.showmoreSpec = true;
        }
    }

    takeAppointment(appmtSlot) {
        const _this = this;
        return new Promise(function (resolve, reject) {
            console.log("Payment Req Id:", _this.paymentRequestId);
            if (_this.paymentRequestId) {
                resolve(true);
            } else {
                let post_Data = _this.generateInputForAppointment();
                if (!_this.selectedService.date && !_this.selectedService.noDateTime) {
                    // apply selected slot time to every attendee entry
                    post_Data['appmtFor'] = (post_Data['appmtFor'] || []).map((person: any, idx: number) => {
                        const cloned = { ...person };
                        cloned['apptTime'] = appmtSlot['time'];
                        return cloned;
                    });
                }
                post_Data['schedule'] = { 'id': appmtSlot['scheduleId'] };
                console.log("Post data:", post_Data);
                if (_this.selectedService.serviceBookingType === 'request' && (_this.selectedService.date || _this.selectedService.dateTime || _this.selectedService.noDateTime)) {
                    _this.subs.add(_this.consumerService.postAppointmentRequest(_this.accountId, post_Data)
                        .subscribe(data => {
                            const retData = data;
                            console.log("Request Data :", data);
                            _this.appointmentIdsList = [];
                            let parentUid;
                            Object.keys(retData).forEach(key => {
                                if (key === '_prepaymentAmount') {
                                    _this.prepayAmount = retData['_prepaymentAmount'];
                                } else {
                                    _this.trackUuid = retData[key];
                                    if (key !== 'parent_uuid') {
                                        _this.appointmentIdsList.push(retData[key]);
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

                        }, error => {
                            _this.isClickedOnce = false;
                            _this.confirmButton['disabled'] = false;
                            let errorObj = _this.errorService.getApiError(error);
                            _this.apiError = _this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies());
                            _this.wordProcessor.apiErrorAutoHide(_this, error);
                            resolve(false);

                        }));
                } else {
                    console.log("Customer Appt:", post_Data);
                    _this.subs.add(_this.consumerService.addCustomerAppointment(_this.accountId, post_Data)
                        .subscribe(data => {
                            const retData = data;
                            _this.appointmentIdsList = [];
                            let parentUid;
                            Object.keys(retData).forEach(key => {
                                if (key === '_prepaymentAmount') {
                                    _this.prepayAmount = retData['_prepaymentAmount'];
                                } else {
                                    _this.trackUuid = retData[key];
                                    if (key !== 'parent_uuid') {
                                        _this.appointmentIdsList.push(retData[key]);
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
                        }, error => {
                            _this.isClickedOnce = false;
                            _this.confirmButton['disabled'] = false;
                            let errorObj = _this.errorService.getApiError(error);
                            _this.apiError = _this.wordProcessor.getProjectErrorMesssages(errorObj, _this.sharedService.getTerminologies());
                            _this.wordProcessor.apiErrorAutoHide(_this, error);
                            resolve(false);
                        }));
                }
            }
        })
    }
    consumerNoteAndFileSave(uuid) {
        const _this = this;
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
        return new Promise(function (resolve, reject) {

            _this.subs.add(_this.consumerService.addAppointmentAttachment(_this.accountId, uuid, dataToSend)
                .subscribe(
                    () => {
                        if (_this.appointmentType !== 'reschedule') {
                            _this.submitQuestionnaire(uuid).then(
                                () => {
                                    resolve(true);
                                }
                            );
                        } else {
                            let queryParams = {
                                account_id: _this.accountId,
                                uuid: _this.scheduledAppointment.uid,
                                type: 'reschedule',
                                theme: _this.theme
                            }
                            if (_this.customId) {
                                queryParams['customId'] = _this.customId;
                            }
                            if (_this.selectedSlots.length > 1) {
                                queryParams['selectedApptsTime'] = _this.selectedApptsTime;
                                queryParams['selectedSlots'] = JSON.stringify(_this.selectedSlots);
                            }
                            let navigationExtras: NavigationExtras = {
                                queryParams: queryParams
                            };
                            _this.setAnalytics();
                            _this.router.navigate([_this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
                        }
                    }, error => {
                        _this.isClickedOnce = false;
                        _this.wordProcessor.apiErrorAutoHide(_this, error);
                    }
                ));
        })
    }
    setAnalytics(source?) {
        let analytics = {
            accId: this.accountProfile.id,
            domId: this.accountProfile.serviceSector.id,
            subDomId: this.accountProfile.serviceSubSector.id
        }
        if (source === 'dateTime_login') {
            analytics['metricId'] = 511;
        } else if (source === 'dateTime_withoutlogin') {
            analytics['metricId'] = 512;
        } else if (source === 'payment_initiated') {
            analytics['metricId'] = 516;
        } else if (source === 'payment_completed') {
            analytics['metricId'] = 519;
        } else {
            analytics['metricId'] = 501;
        }
        this.consumerService.updateAnalytics(analytics).subscribe();
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
                _this.subs.add(_this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.providerConsumerId, _this.accountId).subscribe((data: any) => {
                    resolve(true);
                },
                    error => {
                        _this.isClickedOnce = false;
                        let errorObj = _this.errorService.getApiError(error);
                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                        resolve(false);
                    }));
            } else {
                resolve(true);
            }
        });
    }
    submitQuestionnaire(uuid, paymenttype?) {
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
                _this.subs.add(_this.questionaireService.submitConsumerApptQuestionnaire(dataToSend, uuid, _this.accountId).subscribe((data: any) => {
                    let postData = {
                        urls: []
                    };
                    if (data.urls && data.urls.length > 0) {
                        for (const url of data.urls) {
                            _this.api_loading_video = true;
                            _this.subscriptionService.sendMessage({ ttype: 'loading_file_start' });
                            const file = _this.questionAnswers.filestoUpload[url.labelName][url.document];
                            _this.questionaireService.videoaudioS3Upload(file, url.url)
                                .subscribe(() => {
                                    postData['urls'].push({ uid: url.uid, labelName: url.labelName });
                                    if (data.urls.length === postData['urls'].length) {
                                        _this.questionaireService.consumerApptQnrUploadStatusUpdate(uuid, _this.accountId, postData)
                                            .subscribe((data) => {
                                                resolve(true);
                                            },
                                                error => {
                                                    _this.isClickedOnce = false;
                                                    let errorObj = _this.errorService.getApiError(error);
                                                    // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                                    _this.api_loading_video = false;
                                                    _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
                                                    resolve(false);
                                                });
                                    }
                                },
                                    error => {
                                        _this.isClickedOnce = false;
                                        let errorObj = _this.errorService.getApiError(error);
                                        // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                                        _this.api_loading_video = false;
                                        _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
                                        resolve(false);
                                    });
                        }
                    } else {
                        resolve(true);
                    }
                }, error => {
                    _this.isClickedOnce = false;
                    let errorObj = _this.errorService.getApiError(error);
                    // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                    _this.api_loading_video = false;
                    resolve(false);
                }));
            } else {
                resolve(true);
            }
        });
    }
    paymentOperation(paymenttype?) {
        if (this.paymentDetails && this.paymentDetails.amountRequiredNow > 0) {
            this.setAnalytics('payment_initiated');
            this.startPayment(paymenttype);
        } else {
            let queryParams = {
                uuid: this.trackUuid
            }
            if (this.selectedSlots.length > 1) {
                queryParams['selectedApptsTime'] = this.selectedApptsTime;
                queryParams['selectedSlots'] = JSON.stringify(this.selectedSlots);
            }
            let navigationExtras: NavigationExtras = {
                queryParams: queryParams
            };
            this.setAnalytics();
            this.router.navigate([this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
        }
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

    paywithRazorpay(pData: any) {
        pData.paymentMode = this.paymentMode;
        this.razorpayService.initializePayment(pData, this.accountId, this);
    }
    payWithPayTM(pData: any, accountId: any) {
        this.loadingPaytm = true;
        this.subscriptionService.sendMessage({ ttype: 'loading_start' });
        pData.paymentMode = this.paymentMode;
        this.paytmService.initializePayment(pData, accountId, this);
    }

    finishAppointment(status) {
        if (status) {
            this.resetConfirmState();
            // this.snackbarService.openSnackBar(Messages.PROVIDER_BILL_PAYMENT, { 'panelClass': 'snackbarnormal' });
            let queryParams = {
                uuid: this.trackUuid
            }
            if (this.from) {
                queryParams['isFrom'] = this.from;
            }
            if (this.selectedSlots.length > 1) {
                queryParams['selectedApptsTime'] = this.selectedApptsTime;
                queryParams['selectedSlots'] = JSON.stringify(this.selectedSlots);
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
        console.log("Response:", response);
        if (response.SRC) {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.razorpayService.updateRazorPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.setAnalytics('payment_completed');
                            this.finishAppointment(true);
                        }
                    })
            } else if (response.STATUS == 'TXN_FAILURE') {
                if (response.error && response.error.description) {
                    // this.snackbarService.openSnackBar(response.error.description, { 'panelClass': 'snackbarerror' });
                }
                this.finishAppointment(false);
            }
        } else {
            if (response.STATUS == 'TXN_SUCCESS') {
                this.paytmService.updatePaytmPay(payload, accountId)
                    .then((data) => {
                        if (data) {
                            this.setAnalytics('payment_completed');
                            this.finishAppointment(true);
                        }
                    })
            } else if (response.STATUS == 'TXN_FAILURE') {
                // this.snackbarService.openSnackBar(response.RESPMSG, { 'panelClass': 'snackbarerror' });
                this.finishAppointment(false);
            }
        }
    }
    viewAttachments() {
        this.action = 'attachment';
        this.modal.nativeElement.click();
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
    getImage(url, file) {
        return this.fileService.getImage(url, file);
    }
    addMember() {
        this.action = 'addmember';
        this.disable = false;
        this.resetAddMemberObj();
        this.apiError = '';
        this.apiSuccess = '';
    }
    /**
    *
    * @param selectedMembers
    */
    memberSelected(selectedMembers) {
        this.oneTimeInfo = null;
        const _this = this;
        console.log("selected Member :", selectedMembers);
        _this.appmtFor = selectedMembers;
        console.log(_this.appmtFor);
        if (_this.selectedService && _this.selectedService.minPrePaymentAmount) {
            _this.prepaymentAmount = _this.appmtFor.length * _this.selectedService.minPrePaymentAmount || 0;
        }
        _this.serviceCost = _this.appmtFor.length * _this.selectedService.price;
    }
    handleReturnDetails(obj) {
        this.addmemberobj.fname = obj.fname || '';
        this.addmemberobj.lname = obj.lname || '';
        this.addmemberobj.title = obj.title || '';
        this.addmemberobj.mobile = obj.mobile || '';
        this.addmemberobj.gender = obj.gender || '';
        this.addmemberobj.dob = obj.dob || '';
    }
    handleConsumerNote(vale) {
        this.consumerNote = vale;
    }

    popupClosed() {
        
    }
    rescheduleAppointment() {
        this.btnClicked = true;
        const post_Data = {
            'uid': this.scheduledAppmtId,
            'time': this.selectedSlots[0].time,
            'date': this.appmtDate,
            'schedule': this.selectedSlots[0]['scheduleId'],
            'consumerNote': this.consumerNote
        };
        if (this.selectedMessage.files.length > 0 && this.currentAttachment && this.currentAttachment.length > 0) {
            for (let index = 0; index < this.currentAttachment.length; index++) {
              this.filesToUpload.push(this.currentAttachment[index]);
            }
            post_Data['attachments'] = this.filesToUpload;
          } else if (this.selectedMessage.files.length > 0 && !this.currentAttachment ) {
            post_Data['attachments'] = this.filesToUpload;

          }
        this.subs.add(this.consumerService.rescheduleConsumerApptmnt(this.accountId, post_Data)
            .subscribe(
                () => {
                    this.btnClicked = false;
                    let queryParams = {
                        uuid: this.scheduledAppointment.uid,
                        type: 'reschedule'
                    }
                    let navigationExtras: NavigationExtras = {
                        queryParams: queryParams
                    };
                    this.router.navigate([this.sharedService.getRouteID(),'booking', 'confirm'], navigationExtras);
                },
                error => {
                    let errorObj = this.errorService.getApiError(error);
                    // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(errorObj, this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                    this.btnClicked = false;
                }));
    }
    closeloading() {
        this.ngZone.run(() => {
          this.resetConfirmState();
          this.btnClicked = false;
          this.loadingPaytm = false;
          this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          this.cdRef.detectChanges();
        });
        return false;
      }
    submitserviceOptionQuestionnaire(uuid) {

        const _this = this;
        this.groupedQnr = this.serviceOPtionInfo.answers.answerLine.reduce(function (rv, x) {
            (rv[x.sequenceId] = rv[x.sequenceId] || []).push(x);
            return rv;
        }, {});

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
                this.advPostData = finalList;
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
            _this.subs.add(_this.consumerService.submitConsumerApptServiceOption(dataToSend, uuid, _this.accountId).subscribe((data: any) => {
                resolve(true);
            }, error => {
                _this.isClickedOnce = false;
                let errorObj = _this.errorService.getApiError(error);
                // _this.snackbarService.openSnackBar(_this.wordProcessor.getProjectErrorMesssages(errorObj, _this.accountService.getTerminologies()), { 'panelClass': 'snackbarerror' });
                resolve(false);
            }));
        });
    }
    getserviceOptionQuestionAnswers(event) {
        this.serviceOPtionInfo = event;
        console.log(JSON.stringify(this.serviceOPtionInfo))
        if (this.serviceOPtionInfo.answers.answerLine && this.serviceOPtionInfo.answers.answerLine.length === 0) {
            console.log(this.showNext)
            this.showNext = false;
        }
        else {
            this.showNext = true;
        }
        this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.serviceOPtionInfo);
    }
    showText() {
        this.readMore = !this.readMore;
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
        if ((this.s3CouponsList.JC.length > 0) && this.appointmentType != 'reschedule' || (this.s3CouponsList.OWN.length > 0) && this.appointmentType != 'reschedule') {
            this.isCouponsAvailable = true;
        }
    }
    getBookingCoupons() {
        this.s3CouponsList = { JC: [], OWN: [] };
        this.getCoupons().then((coupons: any) => {
            if (coupons && coupons.jaldeeCoupons) {
                let jcCoupons = coupons.jaldeeCoupons.filter(coupon => coupon.couponStatus === 'ACTIVE');
                this.s3CouponsList.JC = jcCoupons;
                if (this.s3CouponsList.JC.length > 0) {
                    this.showCouponWB = true;
                }
            }
            if (coupons && coupons.providerCoupons) {
                this.s3CouponsList.OWN = coupons.providerCoupons;
                if (this.s3CouponsList.OWN.length > 0) {
                    this.showCouponWB = true;
                }
            }
            this.setCouponAvailability();
        }).catch((error) => {
            // this.snackbarService.openSnackBar(this.wordProcessor.getProjectErrorMesssages(error), { 'panelClass': 'snackbarerror' });
            this.btnClicked = false;
        });
    }
    getCoupons() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            _this.consumerService.getApptCoupons(_this.selectedServiceId, _this.locationId)
                .subscribe((res: any) => {
                    resolve(res);
                }, (error) => {
                    reject(error);
                });
        });
    }
    handleConfirmClick() {
        if (this.confirmButton['disabled']) {
            return;
        }
        this.isClickedOnce = true;
        if (this.confirmButton['action'] === 'payment') {
            this.showLumaSpinner = true;
            this.lumaOverlayMode = 'loading';
            this.lumaOverlayMessage = this.translate.instant('Please Wait...') || 'Please Wait...';
            this.lumaOverlayDismissible = false;
        }
        this.setButtonVisibility();
        this.confirmBooking();
    }
    resetConfirmState() {
        this.isClickedOnce = false;
        this.showLumaSpinner = false;
        this.lumaOverlayMode = 'loading';
        this.lumaOverlayMessage = '';
        this.lumaOverlayDismissible = false;
        this.setButtonVisibility();
    }
    confirmBooking() {
        switch (this.confirmButton['action']) {
            case 'reschedule':
                this.rescheduleAppointment();
                break;
            default:
                this.confirmAppointment('appt');
                break;
        }
    }
    setConfirmButton() {
        if (this.appointmentType !== 'reschedule' && this.selectedService['serviceBookingType'] === 'request' &&
            (this.selectedService['date'] || this.selectedService.dateTime ||
                this.selectedService.noDateTime)) {
            this.confirmButton['caption'] = 'Send Request';
            this.confirmButton['action'] = "request";
            this.paymentmodescroll = true;
            this.payAmountLabel = '';
        } else if (this.appointmentType === 'reschedule' && !this.selectedService.noDateTime) {
            this.confirmButton['caption'] = 'Reschedule';
            this.confirmButton['action'] = "reschedule";
            this.paymentmodescroll = false;
            this.payAmountLabel = '';
        } else if (this.paymentDetails.amountRequiredNow > 0) {
            const amountLabel = this.formatAmountForPayButton(this.paymentDetails.amountRequiredNow);
            this.confirmButton['caption'] = `Pay ${amountLabel}`;
            this.confirmButton['action'] = "payment";
            this.paymentmodescroll = true;
            this.payAmountLabel = amountLabel;
        } else {
            this.confirmButton['caption'] = 'Confirm';
            this.confirmButton['action'] = "confirm";
            this.paymentmodescroll = true;
            this.payAmountLabel = '';
        }
        this.setButtonVisibility();
    }
    private formatAmountForPayButton(amount: any): string {
        const numericAmount = Number(amount);
        if (isNaN(numericAmount)) {
            return '0';
        }
        return numericAmount.toLocaleString('en-IN', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
    }
    setButtonVisibility() {
        if ((this.bookingPolicy && !this.checkPolicy) || this.isClickedOnce) {
            this.confirmButton['disabled'] = true;
        } else {
            this.confirmButton['disabled'] = false;
        }
    }
     scrollToPaymentModeSection(): void {
        if (this.paymentModeSection && this.paymentModeSection.nativeElement) {
            this.paymentModeSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    getImageSrc(mode: string) {
         let cdnPath = this.sharedService.getCDNPath();
        if (!mode) {
            return '';
        }
        const normalized = mode.toString().toLowerCase();
        const fileMap: { [key: string]: string } = {
            upi: 'upiPayment.png',
            cc: 'creditcard.png',
            dc: 'debitCard.png',
            nb: 'netBanking.png',
            wallet: 'wallet.png',
            paylater: 'payLater.png'
        };
        const fileName = fileMap[normalized] || `${normalized}.png`;
        return `${cdnPath}assets/images/myjaldee/${fileName}`;
    }
     getSelectedPaymentModeLabel(): string {
        if (!this.selectedService?.isPrePayment || !this.paymentMode) {
            return '';
        }
        const modeLabelMap: { [key: string]: string } = {
            cc: 'Credit Card',
            dc: 'Debit Card',
            nb: 'Net Banking',
            upi: 'UPI',
            wallet: 'Wallet'
        };
        const mapModeLabel = (value: string) => {
            const normalized = (value || '').toLowerCase();
            return modeLabelMap[normalized] || value;
        };
        const matchedConvenientMode = (this.convenientPaymentModes || []).find((mode: any) => {
            return mode.mode === this.paymentMode && (mode.isInternational === undefined || mode.isInternational === this.shownonIndianModes);
        });
        if (matchedConvenientMode) {
            const label = matchedConvenientMode.modeDisplayName || matchedConvenientMode.displayName || matchedConvenientMode.mode;
            return mapModeLabel(label);
        }
        if (this.paymentmodes) {
            const combinedModes = [
                ...(this.paymentmodes.indiaPay || []),
                ...(this.paymentmodes.internationalPay || [])
            ];
            const fallbackMode = combinedModes.find((mode: any) => mode.mode === this.paymentMode);
            if (fallbackMode) {
                const label = fallbackMode.modeDisplayName || fallbackMode.displayName || fallbackMode.mode;
                return mapModeLabel(label);
            }
        }
        return mapModeLabel(this.paymentMode);
    }
}
