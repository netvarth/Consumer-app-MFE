import { ChangeDetectorRef, Component, ElementRef, HostListener, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatStepper } from '@angular/material/stepper';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AccountService, AuthService, ConsumerService, DateTimeProcessor, ErrorMessagingService, FileService, GroupStorageService, LocalStorageService, Messages, PaytmService, projectConstantsLocal, QuestionaireService, RazorpayService, SharedService, StorageService, SubscriptionService, ToastService, WordProcessor } from 'jconsumer-shared';
import { Subscription } from 'rxjs';
import { BookingService } from '../booking.service';
import { CouponsComponent } from '../../shared/coupons/coupons.component';
import { ConsumerEmailComponent } from '../../shared/consumer-email/consumer-email.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit, OnDestroy{
  smallDevice;            // To know whether device is mobile or desktop
  serverDate;             // To store the server date
  businessInfo: any = {}; // To hold Business Name, Location, Map Url etc.
  selectedLocation;
  departmentEnabled;      // Department Enabled or not
  departments: any = [];  // departments
  selectedServiceId;      // Id of the appointment service
  selectedService: any;   // To store selected appointment service details
  users = [];             // To store the users/providers/doctors
  activeUsers = [];       // Available users 
  account: any;           // whole account Information
  accountId;              // To hold the Account Id
  accountProfile: any;    // Business profile json
  note_placeholder;       // To hold the Place holder text for note text area according to domain
  note_cap = '';          // To hold the caption for note text area
  consumerNote = '';      // consumer note input
  loggedIn = true;        // To check whether user logged in or not
  action = '';            // To navigate between different actions like note/upload/add familymember/members etc
  commObj: any = {};      // communication object
  parentCustomer: any;    // logged in customer
  spConsumer: any;
  // parentJaldeeId;
  bookingFor: any = [];   // to hold the whom for appointment
  isFutureDate;           // To know taken appt day is for future or today
  availableDates: any = []; // to show available appointment dates in calendar
  modalOpen: boolean = false;
  loadingPaytm: boolean;
  apiError = '';
  apiSuccess = '';
  @ViewChild('stepper') stepper: MatStepper;
  @ViewChild('modal', { static: true }) modal; // referring modal object
  @ViewChild('closebutton') closebutton;
  @ViewChild('bookingContainer') paytmview;
  consumer_label: any;
  provider_label: any;
  heartfulnessAccount = false; // This one should be removed
  bookingType;
  bookingId;
  bookingMode: any;
  bookStep;
  step;
  booking_title: any;
  booking_firstName: any;
  booking_lastName: any;
  theme;
  coupondialogRef: any;
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
  paymentProfileId;
  paymentLength = 0;
  payAmount: number;
  remainingadvanceamount;
  paymentDetails: any = [];
  paymentRequestId;
  serviceOptionInfo: any;
  serviceOptionQuestionnaireList: any;
  private subs: Subscription = new Subscription();
  btnClicked = false // To avoid double click
  oneTimeInfo: any; // One time information
  onetimeQuestionnaireList: any; // one time information questionaire list
  questionAnswers; // questionaire answers
  questionnaireList: any = []; // normal questionaire list
  questionnaireLoaded = false; // to check questionaire loaded or not
  providerConsumerId; // id of the selected provider consumer
  familyMembers: any = []; // hold the members
  selectedSlots: any = [] // To hold the appointment slots selected
  showSlot = true;
  serviceOption = false;
  isClickedOnce: boolean = false;
  serviceCost: any;
  prepaymentAmount: number;
  slotLoaded: boolean;
  allSlots: any[];
  isSlotAvailable: any;
  selectedApptsTime: any;
  moment;
  priceList: any;
  balanceAmount: any;
  emailError: string;
  callingModes: any = [];
  phoneError: string;
  whatsappError: string;
  changePhone: boolean;
  disable: boolean;
  addmemberobj = { 'fname': '', 'lname': '', 'title': '', 'mobile': '', 'gender': '', 'dob': '' };
  scheduledBooking: any;
  couponError: string;
  selectedCoupon: string;
  s3CouponsList: any = { JC: [], OWN: [] };    // To store the coupons list available in s3
  selectedCoupons: any = [];
  couponsList: any = [];
  couponValid: boolean;
  coupon_notes = projectConstantsLocal.COUPON_NOTES;
  convenientFee: any;
  convenientFeeObj: any;
  convenientPaymentModes: any;
  checkJcash: boolean;
  jcreditamount: any;
  jcashamount: any;
  total_servicefee: any;
  serviceTotalPrice: any;
  checkJcredit: any;
  selectedUser: any;
  selectedMessage = {
    files: [],
    base64: [],
    caption: []
  };

  imgCaptions: any = [];
  bookingDate: any;
  showLocation = true;
  applied_inbilltime = Messages.APPLIED_INBILLTIME;
  confirm_pageTitle = '';
  appointmentIdsList: any[];
  finalDataToSend: any;
  advPostData: any;
  groupedQnr: any;
  trackUuid: any;
  prepayAmount: any;
  api_loading_video;
  paymentReqInfo: any = {}
  wallet: any;
  pGateway: any;
  privacyChecked: any;
  privacy = false;
  gatewayFee: any;
  showCouponWB;     // To show hide the Coupon Work Bench area
  couponChecked: any;
  enterd_partySize = 1;
  holdenterd_partySize = 0;
  maxsize = 1;
  subscription: Subscription;
  partysizejson: any = [];
  multipleMembers_allowed = false;
  partySize = false;
  partySizeRequired = null;
  readMore = false;
  queueId: any;
  uuidList: any = [];
  selectedQTime: any;
  showNext = false;
  passedService: any;
  target: any; // Target page
  serviceId: any;
  passedLocationId: any;
  locations;
  isCouponsAvailable: boolean = false;
  isJCashSelected;
  isJCreditSelected;
  jCashInHand;
  jCreditInHand;
  balanceToPay;
  confirmButton = { 'caption': 'Confirm', 'disabled': false };
  amountToPayAfterJCash: any;
  bookingPolicy: boolean;
  bookingPolicyContent: any;
  bookingPolicyPath: any;
  loadedConvenientfee;
  checkPolicy = true;
  passedUserId;
  passedDepartmentID;
  showBackArrow = true;
  add_member_cap = Messages.ADD_MEMBER_CAP;
  showmoreSpec = false;
  login_countryCode: any;
  api_loading: boolean;
  filesToUpload: any = [];
  attachments = false;
  @ViewChild('imagefile') fileInput: ElementRef;
  @ViewChild('imagefiles') fileInputs: ElementRef;
  providerCustomerID: any;
  ynwUser: any;
  bookingDetails: any;
  currentAttachment: any;
  constructor(
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private lStorageService: LocalStorageService,
    private accountService: AccountService,
    private sharedService: SharedService,
    private wordProcessor: WordProcessor,
    private bookingService: BookingService,
    private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private errorService: ErrorMessagingService,
    private toastService: ToastService,
    private authService: AuthService,
    private groupService: GroupStorageService,
    private location: Location,
    private questionaireService: QuestionaireService,
    private razorpayService: RazorpayService,
    private paytmService: PaytmService,
    private cdRef: ChangeDetectorRef,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private fileService: FileService,
    private subscriptionService: SubscriptionService,
    private storageService: StorageService
  ) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activatedRoute.queryParams.subscribe(
      params => {
        if (params['type'] === 'reschedule') {
          this.bookingType = params['type'];
          this.bookingId = params['uuid'];
          let booking = this.bookingId.split('_');
          if (booking[1] == 'appt') {
            this.bookingMode = 'Appointment';
          } else {
            this.bookingMode = 'Waitlist';
          }
          this.bookingService.setBookingType(params['type']);
        } else {
          this.bookingMode = params['type'];
        }
        this.passedLocationId = params['loc_id'];
        if (this.passedLocationId) {
          this.showLocation = false;
        }
        if (params['service_id']) {
          this.serviceId = params['service_id'];
          this.passedService = this.serviceId;
          this.target = 'service';
        }
        if (params['userId']) {
          this.passedUserId = params['userId'];
          this.target = 'user';
        }
        if (params['dept']) {
          this.passedDepartmentID = params['dept'];
          this.target = 'dept';
        }
      }
    );
    this.subscriptionService.sendMessage({ ttype: 'hideLocation' });
  }
  changeLocation(loc: any, fromLocation) {
    this.selectedLocation = loc;
    this.bookingService.clear();
    this.bookingService.setSelectedUser(null);
    this.bookingService.setLocationId(this.selectedLocation.id);
    this.initializeBookingPage(fromLocation);
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  setCouponAvailability() {
    this.isCouponsAvailable = false;
    if ((this.s3CouponsList.JC.length > 0) && this.bookingType != 'reschedule' || (this.s3CouponsList.OWN.length > 0) && this.bookingType != 'reschedule') {
      this.isCouponsAvailable = true;
    }
  }
  initializeBookingPage(fromLocation?) {
    const _this = this;
    this.loadingPaytm = true;
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    _this.consumerService.getUsersByLocation(_this.selectedLocation.id, _this.accountProfile.uniqueId, 'departmentProviders').subscribe(
      (users) => {
        console.log("Users:", users);
        const deptUsers = this.sharedService.getJson(this.account['departmentProviders']);
        console.log("Dept Users:", deptUsers);
        this.bookingService.setUsers(users['departmentProviders']);
        if (!this.departmentEnabled) {
          this.users = users['departmentProviders'];
          this.activeUsers = this.users;
        } else {
          this.departments = deptUsers;
          this.bookingService.setDepartments(this.departments);          
        }
      }, () => {
      })
    _this.bookingService.getRescheduledInfo(_this.bookingId, _this.accountId, _this.bookingMode).then(
      (booking) => {
        console.log("booking-details", booking)
        _this.bookingDetails = booking;
        if (_this.bookingDetails && _this.bookingDetails.attachments && _this.bookingDetails.attachments.length > 0) {
          _this.currentAttachment = _this.bookingDetails.attachments;
        }
        _this.bookingService.getServicebyLocationId(_this.selectedLocation.id).then(
          (services) => {
            console.log("Servicesddddd:", services);
            this.bookingService.setServices(services);
            _this.initBooking(booking, fromLocation);
            _this.loadingPaytm = false;
            this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          }
        )
      });
  }
  ngOnInit(): void {
    const _this = this;
    _this.onResize();
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    console.log("Terminologies", this.sharedService.getTerminologies());
    
    this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
    this.consumer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider')
    const settings = this.sharedService.getJson(this.account['settings']);
    this.departmentEnabled = settings.filterByDept;
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.bookingService.setAccountId(this.accountProfile.id);
    this.locations = this.sharedService.getJson(this.account['location']);
    if (this.target === 'service') {
      this.bookingService.getLocationsByServiceId(this.passedService).subscribe(
        (locations) => {
          this.continueToBooking(locations);
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
        }
      )
      this.subscriptionService.sendMessage({ ttype: 'restrict' });
    } else {
      this.continueToBooking();
    }
  }

  continueToBooking(locations?) {
    console.log("Locations continueToBooking:", this.locations);
    let fromLocation = false;
    if (locations) {
      this.locations = locations;
      this.accountService.setActiveLocation(this.locations[0]);
    }
    this.bookingService.setLocations(this.locations);
    this.selectedLocation = this.accountService.getActiveLocation();
    if (this.passedLocationId) {
      this.setActiveLocation(this.passedLocationId);
    }
    this.bookingService.setSelectedLocation(this.selectedLocation);
    this.bookingService.setLocationId(this.selectedLocation.id);
    this.setBasicProfile();
    if (this.bookingId) {
      this.authService.goThroughLogin().then((status) => {
        if (status) {
          this.changeLocation(this.selectedLocation, fromLocation);
        } else {
          this.loggedIn = false;
        }
      })
    } else {
      this.changeLocation(this.selectedLocation, fromLocation);
    }
  }
  setActiveLocation(locationId) {
    let currentLocation = this.locations.filter(location => location.id === locationId);
    if (currentLocation.length > 0) {
      this.accountService.setActiveLocation(currentLocation);
    }
  }
  initializeValues() {
    this.activeUsers = this.bookingService.getUsers();
    if (this.departmentEnabled) {
      this.bookStep = 7;
    } else if (this.users.length > 0) {
      this.bookStep = 8;
    } else {
      this.bookStep = 6;
    }
  }
  initBooking(booking, fromLocation) {
    if (booking) {
      this.setRescheduledBooking(booking);
      let services = this.bookingService.getServices();
      let activeService = [];
      activeService = services.filter(service => service.id == booking.service.id && this.bookingMode == service.bType);
      this.serviceSelected(activeService[0]);
      this.bookStep = 6;
      this.goToStep('next');
    } else {
      if (this.target === 'service') {
        let serviceId;
        if (this.selectedServiceId) {
          serviceId = this.selectedServiceId;
        } else {
          serviceId = this.serviceId;
        }
        let services = this.bookingService.getActiveServices();
        if (services) {
          let activeService = [];
          if (this.bookingMode) {
            activeService = services.filter(service => service.id == serviceId && this.bookingMode == service.bType);
          } else {
            activeService = services.filter(service => service.id == serviceId);
            this.bookingService.setActiveServices(activeService);
          }
          if (activeService.length > 0) {
            this.serviceSelected(activeService[0]);
            if (this.bookStep === 0) {
              this.bookStep = 6;
            } else {
              this.bookStep = 6;
              this.goToStep('next');
            }
          } else {
            this.bookStep = 0;
            this.toastService.showError('service not available in this location');
          }
        }
      } else if (this.target === 'user') {
        let users = this.bookingService.getUsers();
        this.selectedUser = users.filter(user => user.id == this.passedUserId)[0];
        this.bookingService.setSelectedUser(this.selectedUser);
        this.bookingService.getServicesByUser(this.passedUserId);
        this.bookStep = 8;
        this.goToStep('next');
      } else if (this.target === 'dept') {
        if (this.passedDepartmentID){
          let selectedDepartment = this.departments.filter(dept=>dept.departmentId == this.passedDepartmentID)[0];
          this.bookingService.setSelectedDepartment(selectedDepartment); 
          // this.bookStep = 7;
          this.goToStep(7);
        }
      } else {
        this.navigateToPage(fromLocation);
      }
    }
    this.subscriptionService.sendMessage({ ttype: 'refresh' });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  navigateToPage(fromLocation?) {
    switch (this.step) {
      case 6: this.bookStep = 6;
        break;
      case 7: this.bookStep = 7;
        break;
      case 8: this.bookStep = 8;
        break;
      default:
        if (this.locations.length > 1 && !fromLocation) {
          this.bookStep = 0;
        } else if (this.departmentEnabled) {
          this.bookStep = 7;
        } else if (this.users && this.users.length > 0) {
          this.bookStep = 8;
        } else {
          this.bookStep = 6;
        }
        break;
    }
  }
  bookingReschedule() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        const post_Data = {
          'uid': _this.bookingId,
          'time': _this.selectedSlots[0].time,
          'date': _this.bookingDate,
          'schedule': _this.selectedSlots[0]['scheduleId'],
          'consumerNote': _this.consumerNote
        };
        if (_this.selectedMessage.files.length > 0 && _this.currentAttachment && _this.currentAttachment.length > 0) {
          for (let index = 0; index < _this.currentAttachment.length; index++) {
            _this.filesToUpload.push(_this.currentAttachment[index]);
          }
          post_Data['attachments'] = _this.filesToUpload;
        } else if (_this.selectedMessage.files.length > 0 && !_this.currentAttachment) {
          post_Data['attachments'] = _this.filesToUpload;

        }
        _this.consumerService.rescheduleConsumerApptmnt(_this.accountId, post_Data)
          .subscribe(
            () => {
              resolve(true);
            }, error => {
              let errorObj = _this.errorService.getApiError(error);
              _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
              _this.subscriptionService.sendMessage({ttype:'loading_stop'});
            });
      } else {
        const post_Data = {
          'ynwUuid': _this.bookingId,
          'date': _this.bookingDate,
          'queue': _this.queueId,
          'consumerNote': _this.consumerNote
        }
        if (_this.selectedMessage.files.length > 0 && _this.currentAttachment && _this.currentAttachment.length > 0) {
          for (let index = 0; index < _this.currentAttachment.length; index++) {
            _this.filesToUpload.push(_this.currentAttachment[index]);
          }
          post_Data['attachments'] = _this.filesToUpload;
        } else if (_this.selectedMessage.files.length > 0 && !_this.currentAttachment) {
          post_Data['attachments'] = _this.filesToUpload;

        }
        _this.consumerService.rescheduleConsumerWaitlist(_this.accountId, post_Data)
          .subscribe(
            () => {
              resolve(true);
            }, error => {
              let errorObj = _this.errorService.getApiError(error);
              _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
              _this.subscriptionService.sendMessage({ttype:'loading_stop'});
            });
      }
    });
  }
  rescheduleBooking() {
    const _this = this;
    _this.btnClicked = true;
    _this.bookingReschedule().then(() => {
      _this.btnClicked = false;
      _this.bookingCompleted();
    }, error => {
      let errorObj = _this.errorService.getApiError(error);
      _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
      _this.subscriptionService.sendMessage({ttype:'loading_stop'});
      _this.btnClicked = false;
    });
  }
  setRescheduledBooking(booking) {
    const _this = this;
    console.log('bookingbooking', booking)
    _this.scheduledBooking = booking;
    if (_this.bookingMode === 'Appointment') {
      _this.bookingFor.push({ id: booking.appmtFor[0].id, firstName: booking.appmtFor[0].firstName, title: booking.appmtFor[0].title, lastName: booking.appmtFor[0].lastName, phoneNo: booking.phoneNumber, apptTime: booking.appmtFor[0].apptTime });
      _this.commObj['communicationEmail'] = booking.appmtFor[0]['email'];
      _this.commObj['communicationPhNo'] = booking.phoneNumber;
      _this.commObj['communicationPhCountryCode'] = booking.countryCode;
      if (booking.appmtFor[0].whatsAppNum) {
        _this.commObj['comWhatsappNo'] = booking.appmtFor[0].whatsAppNum.number;
        _this.commObj['comWhatsappCountryCode'] = booking.appmtFor[0].whatsAppNum.countryCode;
      } else {
        _this.commObj['comWhatsappNo'] = _this.parentCustomer.phoneNo;
        _this.commObj['comWhatsappCountryCode'] = _this.parentCustomer.countryCode;
      }
      if (booking && booking.appmtFor[0] && booking.appmtFor[0].firstName) {
        _this.booking_firstName = booking.appmtFor[0].firstName;
      }
      if (booking && booking.appmtFor[0] && booking.appmtFor[0].lastName) {
        _this.booking_lastName = booking.appmtFor[0].lastName;
      }
      if (booking && booking.appmtFor[0] && booking.appmtFor[0].title) {
        _this.booking_title = booking.appmtFor[0].title;
      }
      _this.bookingService.setBookingDate(booking.appmtDate);
    } else {
      _this.bookingFor.push({ id: booking.waitlistingFor[0].id, firstName: booking.waitlistingFor[0].firstName, title: booking.waitlistingFor[0].title, lastName: booking.waitlistingFor[0].lastName, phoneNo: booking.phoneNumber });
      _this.commObj['communicationEmail'] = booking.waitlistingFor[0]['email'];
      _this.commObj['communicationPhNo'] = booking.waitlistPhoneNumber;
      _this.commObj['communicationPhCountryCode'] = booking.countryCode;
      if (booking.waitlistingFor[0].whatsAppNum) {
        _this.commObj['comWhatsappNo'] = booking.waitlistingFor[0].whatsAppNum.number;
        _this.commObj['comWhatsappCountryCode'] = booking.waitlistingFor[0].whatsAppNum.countryCode;
      } else {
        _this.commObj['comWhatsappNo'] = _this.parentCustomer.phoneNo;
        _this.commObj['comWhatsappCountryCode'] = _this.parentCustomer.countryCode;
      }
      if (booking && booking.waitlistingFor[0] && booking.waitlistingFor[0].firstName) {
        _this.booking_firstName = booking.waitlistingFor[0].firstName;
      }
      if (booking && booking.waitlistingFor[0] && booking.waitlistingFor[0].lastName) {
        _this.booking_lastName = booking.waitlistingFor[0].lastName;
      }
      if (booking && booking.waitlistingFor[0] && booking.waitlistingFor[0].title) {
        _this.booking_title = booking.waitlistingFor[0].title;
      }
      _this.bookingService.setBookingDate(booking.date);
    }
    _this.consumerNote = booking.consumerNote;
    if (_this.bookingMode === 'Appointment') {
      _this.selectedLocation = booking.location;
    } else {
      _this.selectedLocation = booking.queue.location;
    }

    _this.selectedServiceId = booking.service.id;
  }
  setBasicProfile() {
    this.accountId = this.accountProfile.id;
    this.businessInfo['businessName'] = this.accountProfile.businessName;
    this.businessInfo['locationName'] = this.selectedLocation.place;
    this.businessInfo['googleMapUrl'] = this.selectedLocation.googleMapUrl;
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
    if (this.accountProfile.uniqueId === 128007) {
      this.heartfulnessAccount = true;
    }
    this.getPartysizeDetails(this.accountProfile.serviceSector.domain, this.accountProfile.serviceSubSector.subDomain);
  }
  popupClosed() {
    this.modalOpen = false;
  }
  actionPerformed(status) {
    if (this.bookingId) {
      this.initializeBookingPage();
    } else {
      if (!this.serviceOption) {
        const _this = this;
        if (status === 'success') {
          this.showBackArrow = true;
          _this.initAppointment().then((status) => {
            _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
              (questions) => {
                if (questions) {
                  _this.onetimeQuestionnaireList = questions;
                  if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                    _this.bookStep = 3;
                  } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                    _this.bookStep = 4;
                  } else {
                    _this.bookStep = 5;
                    this.confirmBooking('next');
                  }
                  console.log("Bookstep3:", _this.bookStep);
                } else {
                  if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                    _this.bookStep = 4;
                  } else {
                    _this.bookStep = 5;
                    this.confirmBooking('next');
                  }
                }
                _this.loggedIn = true;
              }
            )
          }
          );
        }
      } else {
        const _this = this;
        if (status === 'success') {
          this.showBackArrow = true;
          _this.initAppointment().then(
            (status) => {
              _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                (questions) => {
                  if (questions) {
                    _this.onetimeQuestionnaireList = questions;
                    if (this.showSlot) {
                      _this.bookStep = 2;
                    } else if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                      _this.bookStep = 3;
                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                      _this.bookStep = 4;
                    } else {
                      _this.bookStep = 5;
                      this.confirmBooking('next');
                    }
                    console.log("Bookstep3:", _this.bookStep);
                  } else {
                    if (this.showSlot) {
                      _this.bookStep = 2;
                    } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                      _this.bookStep = 4;
                    } else {
                      _this.bookStep = 5;
                      this.confirmBooking('next');
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
  }
  getOneTimeQuestionAnswers(event) {
    this.oneTimeInfo = event;
  }
  bookingActionPerformed(data) {
    console.log("In Booking Action Performed:", data);
    if (data['action'] === 'back') {
      this.goBack('back');
    } else if (data['action'] === 'next') {
      this.goToStep('next');
    } else if (data['action'] === 'setTimings') {
      this.selectedSlots = data['selectedSlots'];
      this.selectedApptsTime = this.bookingService.getTimings();
      this.bookingDate = this.bookingService.getBookingDate();
      this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.bookingDate);
    } else if (data['action'] === 'setQ') {
      this.bookingDate = this.bookingService.getBookingDate();
      this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.bookingDate);
      this.queueId = data['selectedQ'];
      this.selectedQTime = data['selectedQTime'];
    }
  }
  actionPerformedstep(data) {
    if (data && data === 'location') {
      this.bookStep = 0;
    }
    if (data && data === 'dept') {
      this.bookStep = 7;
    }
    else if (data && data === 'service') {
      this.bookStep = 6;
      this.activeUsers = this.bookingService.getActiveUsers();
    }
    else if (data && data === 'dateTime') {
      this.goToStep('next');
    }
    else if (data && data === 'item') {
      this.bookStep = 1;
    }
    else if (data && data === 'doctor') {
      this.bookStep = 8;
    }
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
  actionCompleted() {
    if (this.action !== 'members' && this.action !== 'addmember' && this.action !== 'note' && this.action !== 'attachment' && this.action !== 'coupons') {
      if (this.bookingType == 'reschedule' && this.scheduledBooking.service && this.scheduledBooking.service.priceDynamic) {
        const subs = this.consumerService.getAppointmentReschedulePricelist(this.scheduledBooking.service.id).subscribe(
          (list: any) => {
            this.priceList = list;
            let oldprice;
            let newprice;
            for (let list of this.priceList) {
              if (list.schedule.id == this.scheduledBooking.schedule.id) { // appointment scheduleid
                oldprice = list.price;
              }
              if (list.schedule.id == this.selectedSlots[0]['scheduleId']) { // rescheduledappointment scheduleid
                newprice = list.price;
              }
            }
            this.balanceAmount = this.scheduledBooking.amountDue + (newprice - oldprice);
          });
          this.subs.add(subs);
      }
    }
    if (this.action === 'members') {
      this.saveMemberDetails();
    } else if (this.action === 'addmember') {
      this.handleSaveMember();
    } else if (this.action === 'note' || this.action === 'attachment') {
      this.goBack();
    } else if (this.action === 'coupons') {
      this.applyCoupons();
    }
  }

  applyCoupons() {
    this.couponError = null;
    this.couponValid = true;
    const couponInfo = {
      'couponCode': '',
      'instructions': ''
    };
    if (this.selectedCoupon) {
      const jaldeeCoupn = this.selectedCoupon.trim();
      if (this.checkCouponExists(jaldeeCoupn)) {
        this.couponError = 'Coupon already applied';
        this.couponValid = false;
        return false;
      }
      this.couponValid = false;
      let found = false;
      for (let couponIndex = 0; couponIndex < this.s3CouponsList.JC.length; couponIndex++) {
        if (this.s3CouponsList.JC[couponIndex].jaldeeCouponCode.trim() === jaldeeCoupn) {
          this.selectedCoupons.push(this.s3CouponsList.JC[couponIndex].jaldeeCouponCode);
          couponInfo.couponCode = this.s3CouponsList.JC[couponIndex].jaldeeCouponCode;
          couponInfo.instructions = this.s3CouponsList.JC[couponIndex].consumerTermsAndconditions;
          this.couponsList.push(couponInfo);
          found = true;
          this.selectedCoupon = '';
          break;
        }
      }
      for (let couponIndex = 0; couponIndex < this.s3CouponsList.OWN.length; couponIndex++) {
        if (this.s3CouponsList.OWN[couponIndex].couponCode.trim() === jaldeeCoupn) {
          this.selectedCoupons.push(this.s3CouponsList.OWN[couponIndex].couponCode);
          couponInfo.couponCode = this.s3CouponsList.OWN[couponIndex].couponCode;
          if (this.s3CouponsList.OWN[couponIndex].consumerTermsAndconditions) {
            couponInfo.instructions = this.s3CouponsList.OWN[couponIndex].consumerTermsAndconditions;
          }
          this.couponsList.push(couponInfo);
          found = true;
          this.selectedCoupon = '';
          break;
        }
      }
      if (found) {
        this.couponValid = true;
        setTimeout(() => {
          this.action = '';
        }, 500);
        this.modalOpen = false;
        this.closebutton.nativeElement.click();
        this.addAdvancePayment(this.selectedSlots[0]); //coupon validation
      } else {
        this.couponError = 'Coupon invalid';
      }
    } else {
      this.modalOpen = false;
      this.closebutton.nativeElement.click();
    }
    return true;
  }
  generateInputForBooking() {
    console.log("Selected Coupon:", this.selectedCoupons);
    let post_Data = {
      'service': {
        'id': this.selectedServiceId,
        'serviceType': this.selectedService.serviceType
      },
      'consumerNote': this.consumerNote,
      'countryCode': this.parentCustomer.countryCode,
      'coupons': this.selectedCoupons
    };
    if (this.selectedService.serviceType === 'virtualService') {
      if (this.bookingService.validateVirtualCallInfo(this.callingModes, this.selectedService, this.commObj)) {
        post_Data['virtualService'] = this.bookingService.getVirtualServiceInput(this.selectedService, this.callingModes, this.commObj);
      } else {
        this.toastService.showError('Please enter valid mobile number');
        return false;
      }
    }
    if (this.selectedUser && this.selectedUser.firstName !== Messages.NOUSERCAP) {
      post_Data['provider'] = { 'id': this.selectedUser.id };
    } else if (this.selectedService.provider) {
      post_Data['provider'] = { 'id': this.selectedService.provider.id };
    }
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      if (this.selectedService.serviceBookingType === 'request' && (this.selectedService.date || this.selectedService.dateTime || (this.selectedService && this.selectedService.noDateTime))) {
        if (this.selectedService && !this.selectedService.noDateTime) {
          post_Data['appmtDate'] = this.bookingService.getBookingDate();
        }
        this.bookingFor = this.appointmentForWhom(this.bookingFor, this.parentCustomer, this.commObj);
        post_Data['appmtFor'] = JSON.parse(JSON.stringify(this.bookingFor));
        if (this.commObj['communicationPhNo'] !== '') {
          post_Data['phoneNumber'] = this.commObj['communicationPhNo'];
        }
      } else {
        post_Data['appmtDate'] = this.bookingService.getBookingDate();
        post_Data['phoneNumber'] = this.commObj['communicationPhNo'];
        if (this.jcashamount > 0 && this.checkJcash) {
          post_Data['useCredit'] = this.checkJcredit;
          post_Data['useJcash'] = this.checkJcash;
        }
        if (this.scheduledBooking) {
          post_Data['appmtFor'] = this.scheduledBooking['appmtFor'];
        } else {
          this.bookingFor = this.appointmentForWhom(this.bookingFor, this.parentCustomer, this.commObj);
          post_Data['appmtFor'] = JSON.parse(JSON.stringify(this.bookingFor));
        }
      }
      if (this.selectedMessage.files.length > 0) {
        post_Data['attachments'] = this.filesToUpload;
      }
    } else {
      post_Data['queue'] = { 'id': this.queueId };
      post_Data['date'] = this.bookingDate;
      if (this.commObj['communicationEmail'] !== '') {
        this.bookingFor[0]['email'] = this.commObj['communicationEmail'];
      }
      post_Data['waitlistingFor'] = JSON.parse(JSON.stringify(this.bookingFor));
      if (this.commObj['communicationPhNo'] !== '') {
        post_Data['waitlistPhoneNumber'] = this.commObj['communicationPhNo'];
      }
      if (this.partySizeRequired) {
        this.holdenterd_partySize = this.enterd_partySize;
        post_Data['partySize'] = Number(this.holdenterd_partySize);
      }
      post_Data['consumer'] = { id: this.parentCustomer.id };
      if (this.jcashamount > 0 && this.checkJcash) {
        post_Data['useCredit'] = this.checkJcredit;
        post_Data['useJcash'] = this.checkJcash;
      }
      if (this.selectedMessage.files.length > 0) {
        post_Data['attachments'] = this.filesToUpload;
      }
    };
    return post_Data;
  }
  appointmentForWhom(appmtFor, parentCustomer, commObj) {
    console.log("parentCustomerappmtfor", appmtFor)
    console.log("parentCustomer", parentCustomer)
    if (appmtFor.length !== 0) {
      for (const list of appmtFor) {
        if (list.id === parentCustomer.id) {
          list['id'] = 0;
        }
      }
    }
    if (commObj['communicationEmail'] !== '') {
      appmtFor[0]['email'] = commObj['communicationEmail'];
    }
    return appmtFor;
  }
  getAttachLength() {
    let length = this.selectedMessage.files.length;
    if (this.scheduledBooking && this.scheduledBooking.attachments && this.scheduledBooking.attachments[0] && this.scheduledBooking.attachments[0].s3path) {
      length = length + this.scheduledBooking.attachments.length;
    }
    return length;
  }
  removeJCoupon(i) {
    console.log("selectedCoupons List:", this.selectedCoupons);
    this.selectedCoupons.splice(i, 1);
    console.log("selcoupons:", this.selectedCoupons);
    this.couponsList.splice(i, 1);
    console.log("Coupons List:", this.couponsList);
    this.addAdvancePayment();
  }
  addAdvancePayment(appmtSlot?) {
    const _this = this;
    let post_Data = _this.generateInputForBooking();
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      appmtSlot = this.selectedSlots[0];
      post_Data['appmtFor'][0]['apptTime'] = appmtSlot['time'];
      post_Data['schedule'] = { 'id': appmtSlot['scheduleId'] };
    }
    _this.getAdvancePayment(post_Data).then(
      (data) => {
        _this.paymentDetails = data;
        _this.paymentLength = Object.keys(_this.paymentDetails).length;
        _this.jCashInHand = _this.paymentDetails.eligibleJcashAmt.jCashAmt;
        if (_this.jCashInHand > 0) {
          _this.isJCashSelected = true;
        }
        _this.jCreditInHand = _this.paymentDetails.eligibleJcashAmt.creditAmt;
        _this.paymentDetails['amountToPay'] = _this.paymentDetails.amountRequiredNow;
        if (_this.isJCashSelected && _this.paymentDetails.amountRequiredNow > _this.jCashInHand) {
          _this.paymentDetails['amountToPay'] = _this.paymentDetails.amountRequiredNow - _this.jCashInHand;
        } else if (_this.isJCashSelected && _this.paymentDetails.amountRequiredNow <= _this.jCashInHand) {
          _this.paymentDetails['amountToPay'] = 0;
        }
        _this.amountToPayAfterJCash = _this.paymentDetails['amountToPay'];
        if (_this.paymentDetails['amountToPay'] > 0) {
          _this.setConvenientFee();
        }
        _this.setConfirmButton();
      }
    ).catch((error) => {
      _this.isClickedOnce = false;
      this.confirmButton['disabled'] = false;
      let errorObj = _this.errorService.getApiError(error);
      _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
      _this.subscriptionService.sendMessage({ttype:'loading_stop'});
      this.confirmButton['disabled'] = false;
    })
  }
  toggleterms(i) {
    if (this.couponsList[i].showme) {
      this.couponsList[i].showme = false;
    } else {
      this.couponsList[i].showme = true;
    }
  }
  checkCouponExists(couponCode) {
    let found = false;
    console.log("selectedCoupons:", this.selectedCoupons);
    for (let index = 0; index < this.selectedCoupons.length; index++) {
      if (couponCode === this.selectedCoupons[index]) {
        found = true;
        break;
      }
    }
    return found;
  }
  showText() {
    this.readMore = !this.readMore;
  }
  couponCheck(event) {
    this.couponChecked = event.target.checked;
  }
  handleSaveMember() {
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
        'firstName': this.addmemberobj.fname.trim(),
        'lastName': this.addmemberobj.lname.trim(),
        'title': this.addmemberobj.title.trim(),
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
      const subs = fn.subscribe(() => {
        this.apiSuccess = this.wordProcessor.getProjectMesssages('MEMBER_CREATED');
        this.setConsumerFamilyMembers(this.parentCustomer).then();
        setTimeout(() => {
          this.goBack();
        }, projectConstantsLocal.TIMEOUT_DELAY);
      }, error => {
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
        this.disable = false;
      });
      this.subs.add(subs);
    } else {
      this.apiError = derror;
      this.disable = false;
    }
    setTimeout(() => {
      this.apiError = '';
      this.apiSuccess = '';
    }, 2000);
  }
  resetApiErrors() {
    this.emailError = null;
  }
  saveMemberDetails() {
    const _this = this;
    console.log("this.bookingFor[0]", this.bookingFor)
    this.resetApiErrors();
    this.emailError = '';
    this.phoneError = '';
    this.whatsappError = '';
    this.changePhone = true;
    if (this.commObj['communicationPhNo'] && this.commObj['communicationPhNo'].trim() !== '') {
    } else {
      this.toastService.showError('Please enter phone number');
      return false;
    }
    if (this.selectedService && this.selectedService.virtualCallingModes && this.selectedService.virtualCallingModes[0].callingMode === 'WhatsApp') {
      if (!this.commObj['comWhatsappCountryCode'] || (this.commObj['comWhatsappCountryCode'] && this.commObj['comWhatsappCountryCode'].trim() === '')) {
        this.toastService.showError('Please enter country code');
        return false;
      }
      if (this.commObj['comWhatsappNo'] && this.commObj['comWhatsappNo'].trim() !== '') {
        this.callingModes = this.commObj['comWhatsappCountryCode'].replace('+', '') + this.commObj['comWhatsappNo'];
      } else {
        this.toastService.showError('Please enter whatsapp number');
        return false;
      }
    }
    if (this.commObj['communicationEmail'] && this.commObj['communicationEmail'].trim() !== '') {
      const pattern = new RegExp(projectConstantsLocal.VALIDATOR_EMAIL);
      const result = pattern.test(this.commObj['communicationEmail']);
      if (!result) {
        this.emailError = "Email is invalid";
        return false;
      } else {
        this.bookingFor[0]['email'] = this.commObj['communicationEmail'];
      }
    }
    this.booking_firstName = this.bookingFor[0].firstName;
    this.booking_lastName = this.bookingFor[0].lastName;
    this.booking_title = this.bookingFor[0].title;
    _this.providerConsumerId = this.bookingFor[0].id;
    this.getOneTimeInfo(_this.providerConsumerId, this.accountId).then((questions) => {
      if (questions) {
        _this.onetimeQuestionnaireList = questions;
        if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
          _this.bookStep = 3;
        }
      }
    })
    this.modalOpen = false;
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
    this.oneTimeInfo = null;
    const _this = this;
    console.log("selected Member :", selectedMembers);
    this.confirmButton['disabled'] = false;
    _this.bookingFor = selectedMembers;
    console.log(_this.bookingFor);
    if (_this.selectedService && _this.selectedService.minPrePaymentAmount) {
      _this.prepaymentAmount = _this.bookingFor.length * _this.selectedService.minPrePaymentAmount || 0;
      _this.setConfirmPageTitle(_this.selectedService, _this.prepaymentAmount);
    }
    _this.serviceCost = _this.bookingFor.length * _this.selectedService.price;
  }
  setConfirmPageTitle(selectedService: any, prepaymentAmount: number) {
    if (prepaymentAmount > 0 && selectedService['serviceBookingType'] !== 'request') {
      this.confirm_pageTitle = 'Confirm & Pay';
    }
  }
  initService(selectedService) {
    console.log("Service:", selectedService);
    this.confirm_pageTitle = 'Confirm';
    const _this = this;
    if ((this.selectedService && this.selectedService.bType && selectedService.bType === 'Appointment') && selectedService['serviceBookingType'] === 'request') {
      this.confirm_pageTitle = 'Send Request'
    }
    _this.couponsList = [];
    _this.selectedCoupons = [];
    _this.selectedCoupon = '';
    _this.paymentLength = 0;
    _this.paymentDetails = [];
    if (selectedService && selectedService.id) {
      _this.selectedServiceId = selectedService.id;
    }

    _this.getPaymentModes();
    _this.getBookingCoupons();
    _this.setServiceDetails(selectedService);
    _this.serviceOptionInfo = _this.lStorageService.getitemfromLocalStorage('serviceOPtionInfo');
    if (selectedService && selectedService.id) {
      _this.getServiceOptions(selectedService.id, _this.accountId);
    }

    if ((this.selectedService && this.selectedService.bType && selectedService.bType === 'Appointment')) {
      _this.availableDates = _this.bookingService.getSchedulesbyLocationandServiceIdavailability(_this.selectedLocation.id, _this.selectedServiceId, _this.accountId);
    } else {
      _this.availableDates = _this.bookingService.getQueuesbyLocationandServiceIdAvailableDates(_this.selectedLocation.id, _this.selectedServiceId, _this.accountId);
    }
  }
  setServiceDetails(selectedService: any) {
    const _this = this;
    this.selectedService = selectedService;
    console.log("Selected Service:", selectedService);
    
    if ((this.selectedService && this.selectedService.bType && selectedService.bType === 'Appointment')) {
      if (selectedService.virtualCallingModes) {
        this.setVirtualInfoServiceInfo(selectedService, _this.bookingType);
      }
      if (selectedService && selectedService.serviceAvailability && selectedService.serviceAvailability.nextAvailableDate) {
        _this.bookingService.setBookingDate(selectedService.serviceAvailability.nextAvailableDate);
      } else {
        _this.bookingService.setBookingDate(_this.dateTimeProcessor.getToday(_this.serverDate));
      }
      if (selectedService && selectedService.noDateTime) {
        if ((_this.booking_firstName === undefined && _this.booking_lastName === undefined) || _this.commObj['communicationPhNo'] === undefined) {
          _this.authService.goThroughLogin().then((status) => {
            if (status) {
              _this.initAppointment().then(
                (status) => {
                  _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                    (questions) => {
                      _this.bookStep = 5;
                      _this.confirmBooking('next');
                      _this.loggedIn = true;
                    }
                  )
                }
              );
            } else {
              _this.loggedIn = false;
            }
          });
        } else {
          console.log("Else block :")
          _this.bookStep = 5;
          _this.confirmBooking('next');
          _this.initAppointment();
        }
      }
    } else {
      if (selectedService && selectedService.serviceAvailability && selectedService.serviceAvailability.availableDate) {
        _this.bookingService.setBookingDate(selectedService.serviceAvailability.availableDate);
      } else {
        _this.bookingService.setBookingDate(_this.dateTimeProcessor.getToday(_this.serverDate));
      }
      _this.bookingDate = _this.bookingService.getBookingDate();
    }
    this.setConfirmButton();
  }
  handleSideScreen(action) {
    this.action = action;
  }
  getPaymentModes() {
    this.paytmEnabled = false;
    this.razorpayEnabled = false;
    this.interNationalPaid = false;
    const subs = this.consumerService.getPaymentModesofProvider(this.accountId, this.selectedServiceId, 'prePayment')
      .subscribe(data => {
        this.paymentmodes = data[0];
        this.isPayment = true;
        this.paymentProfileId = this.paymentmodes.profileId;
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
        this.isPayment = false;
      });
      this.subs.add(subs);
  }
  getServiceOptions(selectedServiceId, accountId) {
    const _this = this;
    const subs = this.consumerService.getServiceoptionsAppt(selectedServiceId, accountId)
      .subscribe(
        (data) => {
          if (data) {
            this.serviceOptionQuestionnaireList = data;
            if (this.serviceOptionQuestionnaireList.questionnaireId && this.bookingType !== 'reschedule') {
              this.serviceOption = true;
              this.bookStep = 1;
            } else {
              _this.bookStep = 2
            }
          }
        },
        error => {
          let errorObj = this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          this.btnClicked = false;
        });
        this.subs.add(subs);
  }
  setVirtualInfoServiceInfo(activeService, bookingType) {
    if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp' || activeService.virtualCallingModes[0].callingMode === 'Phone') {
      if (bookingType === 'reschedule') {
        if (activeService.virtualCallingModes[0].callingMode === 'WhatsApp') {
          this.callingModes = this.scheduledBooking.virtualService['WhatsApp'];
        } else {
          this.callingModes = this.scheduledBooking.virtualService['Phone'];
        }
        const phNumber = this.scheduledBooking.countryCode + this.scheduledBooking.phoneNumber;
        const callMode = '+' + activeService.virtualCallingModes[0].value;
        if (callMode === phNumber) {
          this.changePhone = false;
        } else {
          this.changePhone = true;
        }
      }
    }

  }
  /*
    Step1: -> Service Options
    Step2: -> Date/Time Selection
    Step3: -> One Time Info Collection
    Step4: -> Normal Questionaire
    Step5: -> Upload Files
    Step6: -> Services
    Step7: -> Departments
    Step8: -> Users
  */
  goToStep(type) {
    const _this = this;
    console.log("Type:", type);
    console.log("BookStep1:" + this.bookStep);
    if (type === 'next') {
      this.showBackArrow = true;
      switch (this.bookStep) {
        case 0:
          this.bookingService.setSelectedLocation(this.selectedLocation);
          this.lStorageService.setitemonLocalStorage('c-location', this.selectedLocation.id);
          this.changeLocation(this.selectedLocation, true);
          this.subscriptionService.sendMessage({ ttype: 'changeLocation', value: this.selectedLocation });
          this.setBasicProfile();
          break;
        case 1: //Service Options
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
                        else if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                          _this.bookStep = 3;
                        } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                          _this.bookStep = 4;
                        } else {
                          _this.bookStep = 5;
                          this.confirmBooking('next');
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
                          this.confirmBooking('next');
                        }
                      }
                      _this.loggedIn = true;
                    }
                  )
                }
              );
            } else {
              this.loggedIn = false;
              this.showBackArrow = false;
            }
          });
          break;
        case 2: // Date/Time Selection
          this.authService.goThroughLogin().then((status) => {
            console.log("Status:", status);
            if (status) {
              _this.initAppointment().then(
                (status) => {
                  // const activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
                  _this.getOneTimeInfo(_this.providerConsumerId, _this.accountId).then(
                    (questions) => {
                      console.log("Questions:", questions);
                      if (questions) {
                        _this.onetimeQuestionnaireList = questions;
                        console.log("OneTime:", _this.onetimeQuestionnaireList);
                        if (_this.onetimeQuestionnaireList && _this.onetimeQuestionnaireList.labels && _this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
                          _this.bookStep = 3;
                        } else if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                          _this.bookStep = 4;
                        } else {
                          if (_this.selectedService && _this.selectedService['serviceBookingType'] === 'request') {
                            if ((_this.selectedService['date'] === false) && (_this.selectedService['dateTime'] === false)) {
                              _this.bookStep = 5;
                            }
                            else if ((_this.selectedService['date'] === true) && (_this.selectedService['dateTime'] === false)) {
                              _this.bookStep = 2;
                            }
                          }
                          else {
                            _this.bookStep = 2;
                          }
                          _this.bookStep = 5;
                          this.confirmBooking('next');
                        }
                        console.log("Bookstep3:", _this.bookStep);
                      } else {
                        if (_this.questionnaireList && _this.questionnaireList.labels && _this.questionnaireList.labels.length > 0) {
                          _this.bookStep = 4;
                        } else {
                          _this.bookStep = 5;
                          this.confirmBooking('next');
                        }
                      }
                      _this.loggedIn = true;
                    }
                  )
                }
              );
            } else {
              _this.bookStep = 2;
              this.loggedIn = false;
              this.showBackArrow = false;
            }
          });
          break;
        case 3: //One time info
          _this.validateOneTimeInfo();
          break;
        case 4: // Normal Quetionaire
          this.validateQuestionnaire();
          break;
        case 5: // Upload files
          console.log("4 Clicked");
          if (this.selectedService.consumerNoteMandatory && this.consumerNote == '') {
            this.toastService.showError('Please provide ' + this.selectedService.consumerNoteTitle);
            return false;
          }
          this.bookingDate = this.bookingService.getBookingDate();
          this.isFutureDate = this.dateTimeProcessor.isFutureDate(this.serverDate, this.bookingDate);
          this.confirmBooking('next');
          break;
        case 6: // Services
          this.initService(this.bookingService.getSelectedService());
          this.bookStep = 2;
          break;
        case 7: // Department
          let activeDept = this.bookingService.getSelectedDepartment();
          if (activeDept && activeDept.departmentId) {
            this.bookingService.getServicesByDepartment(activeDept.departmentId);
          }
          this.bookingService.setSelectedUser(null);
          if (this.activeUsers && this.activeUsers.length > 0) {
            this.bookStep = 8;
          } else {
            this.bookStep = 6;
          }
          break;
        case 8: // User
          this.selectedUser = this.bookingService.getSelectedUser();
          if (this.selectedUser) {
            this.bookingService.getServicesByUser(this.selectedUser.id);
          }
          this.bookStep = 6;
          break;
      }
    } else if (type === 'prev') {
      console.log("Previouse");
      if (!this.serviceOption) {
        if (this.bookStep === 5) {
          if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
            this.bookStep = 4;
          } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
            _this.bookStep = 3;
          } else if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 2;
          }
        } else if (this.bookStep === 4) {
          if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
            _this.bookStep = 3;
          } else if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 2;
          }
        } else if (this.bookStep === 3) {
          if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 2;
          }
        } else if (this.bookStep === 1) {
          this.bookStep = 6;
        } else if (this.bookStep === 6) {
          if ((this.passedUserId || this.passedService) && this.locations && this.locations.length > 1) {
            this.showLocation = true;
            this.bookStep = 0;
          } else if ((this.passedUserId || this.passedService) && this.locations && this.locations.length === 1) {
            this.showBackArrow = false;
          } else if (this.activeUsers && this.activeUsers.length > 0) {
            this.bookStep = 8;
          } else if (this.departments && this.departments.length > 0) {
            this.bookStep = 7;
          } else if (this.locations && this.locations.length > 1) {
            this.bookStep = 0;
          } else {
            this.location.back();
          }
        } else if (this.bookStep === 8) {
          if (this.departments && this.departments.length > 0) {
            this.bookStep = 7;
          } else if (this.locations && this.locations.length > 1) {
            this.bookStep = 0;
          } else {
            this.location.back();
          }
        } else if (this.bookStep === 2) {
          if (this.bookingId) {
            _this.router.navigate([this.sharedService.getRouteID(), 'bookings']);
          } else {
            this.bookStep = 6;
            if (this.locations && this.locations.length == 1 && this.users.length === 0 && this.departments && this.departments.length === 0) {
              this.showBackArrow = false;
            }
          }
        } else if (this.bookStep === 7 && this.locations && this.locations.length > 1) {
          this.bookStep = 0;
        } else {
          this.router.navigate([this.sharedService.getRouteID()]);
        }
      } else {
        if (this.bookStep === 5) {
          if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
            this.bookStep = 4;
          } else if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
            _this.bookStep = 3;
          } else if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 1;
          }
        } else if (this.bookStep === 4) {
          if (this.onetimeQuestionnaireList && this.onetimeQuestionnaireList.labels && this.onetimeQuestionnaireList.labels.length > 0 && _this.onetimeQuestionnaireList.labels[0].questions && _this.onetimeQuestionnaireList.labels[0].questions.length > 0) {
            _this.bookStep = 3;
          } else if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 1;
          }
        } else if (this.bookStep === 3) {
          if (this.showSlot) {
            _this.bookStep = 2;
          } else {
            this.bookStep = 1;
          }
        } else if (this.bookStep === 1) {
          this.bookStep = 6;
        } else if (this.bookStep === 6) {
          if ((this.passedUserId || this.passedService) && this.locations && this.locations.length > 1) {
            this.showLocation = true;
            this.bookStep = 0;
            this.showBackArrow = false;
          } else if ((this.passedUserId || this.passedService) && this.locations && this.locations.length === 1) {
            this.showBackArrow = false;
          } else if (this.activeUsers && this.activeUsers.length > 0) {
            this.bookStep = 8;
          } else if (this.departments && this.departments.length > 0) {
            this.bookStep = 7;
          } else if (this.locations && this.locations.length > 1) {
            this.bookStep = 0;
          } else {
            this.location.back();
          }
        } else if (this.bookStep === 8) {
          if (this.departments && this.departments.length > 0) {
            this.bookStep = 7;
          } else if (this.locations && this.locations.length > 1) {
            this.bookStep = 0;
          } else {
            this.location.back();
          }
        } else if (this.bookStep === 2) {
          if (this.bookingId) {
            _this.router.navigate([this.sharedService.getRouteID(), 'bookings']);
          } else {
            this.bookStep = 6;
            if (this.locations && this.locations.length == 1 && this.users && this.users.length === 0 && this.departments && this.departments.length === 0) {
              this.showBackArrow = false;
            }
          }
        } else if (this.bookStep === 7 && this.locations && this.locations.length > 1) {
          this.bookStep = 0;
        } else {
          this.location.back();
        }
      }
    } else {
      this.bookStep = type;
    }
    if (this.bookStep === 5) {
      this.confirmBooking('next');
    }
    return true;
  }
  initAppointment() {
    const _this = this;
    _this.bookingFor = [];
    return new Promise(function (resolve, reject) {
      _this.storageService.getProviderConsumer().then((spConsumer: any) => {
        _this.parentCustomer = spConsumer;
        _this.providerConsumerId = spConsumer.id;
        console.log("Parent Consumer:", spConsumer);
        if (_this.bookingType != 'reschedule') {
          _this.booking_title = spConsumer.title;
          _this.booking_firstName = spConsumer.firstName;
          _this.booking_lastName = spConsumer.lastName;
          _this.bookingFor.push({ id: spConsumer.id, firstName: spConsumer.firstName, title: spConsumer.title, lastName: spConsumer.lastName });
          _this.prepaymentAmount = _this.bookingFor.length * _this.selectedService.minPrePaymentAmount || 0;
          _this.setConfirmPageTitle(_this.selectedService, _this.prepaymentAmount);
          _this.serviceCost = _this.selectedService.price;
          _this.setConsumerFamilyMembers(spConsumer.id).then(); // Load Family Members
          if (!_this.questionnaireLoaded) {
            _this.getConsumerQuestionnaire().then(
              () => {
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
              console.log('this.familyMembers:', _this.familyMembers)
            }
          }
          resolve(_this.familyMembers);
        }
      )
    })
  }
  getConsumerQuestionnaire() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.getConsumerQuestionnaire(_this.bookingService.getSelectedService().id, _this.bookingFor[0].id, _this.accountId).subscribe(data => {
        _this.questionnaireList = data;
        _this.questionnaireLoaded = true;
        resolve(true);
      }, () => {
        resolve(false);
      });
    })
  }
  initCommunications(spConsumer) {
    console.log("spConsumer.email", spConsumer.email, this.commObj['communicationEmail'])
    const _this = this;
    if (spConsumer.email && (this.commObj['communicationEmail'] == '' || !this.commObj['communicationEmail'])) {
      _this.commObj['communicationEmail'] = spConsumer.email;
    }
    _this.commObj['communicationPhNo'] = spConsumer.phoneNo;
    _this.commObj['communicationPhCountryCode'] = spConsumer.countryCode;
    if (spConsumer.whatsAppNum && spConsumer.whatsAppNum.number && spConsumer.whatsAppNum.number.trim() != '') {
      _this.commObj['comWhatsappNo'] = spConsumer.whatsAppNum.number;
      _this.commObj['comWhatsappCountryCode'] = spConsumer.whatsAppNum.countryCode;
    } else {
      _this.commObj['comWhatsappNo'] = _this.commObj['communicationPhNo'];
      _this.commObj['comWhatsappCountryCode'] = _this.commObj['communicationPhCountryCode']
    }
    this.storageService.clear();
  }
  getOneTimeInfo(providerConsumerID, accountId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      _this.consumerService.getProviderCustomerOnetimeInfo(
        providerConsumerID, accountId).subscribe(
          (questions) => {
            resolve(questions);
          }, () => {
            resolve(false);
          });
    });
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
            this.toastService.showError('Please provide ' + this.selectedService.consumerNoteTitle);
          } else {
            this.bookStep++;
            this.confirmBooking();
          }
        }
        this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
      }, error => {
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
      });
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
                this.getBookStep();
              }
            })
        }
        this.questionaireService.sendMessage({ type: 'qnrValidateError', value: data });
      }, error => {
        let errorObj = this.errorService.getApiError(error);
        this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
      });
    }
  }
  getBookStep() {
    if (this.questionnaireList && this.questionnaireList.labels && this.questionnaireList.labels.length > 0) {
      this.bookStep = 4;
    } else {
      this.bookStep = 5;
      this.confirmBooking();
    }
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
        const subs = _this.consumerService.submitCustomerOnetimeInfo(dataToSend, _this.providerConsumerId, _this.accountId).subscribe((data: any) => {
          resolve(true);
        },
          error => {
            _this.isClickedOnce = false;
            let errorObj = _this.errorService.getApiError(error);
            _this.toastService.showError(errorObj);
            resolve(false);
          });
          _this.subs.add(subs);
      } else {
        resolve(true);
      }
    });
  }
  goBack(type?) {
    this.confirmButton['disabled'] = false;
    if (type) {
      console.log(this.bookStep);
      console.log(this.selectedService);
      if (this.bookStep === 5 && (this.selectedService && this.selectedService.noDateTime)) {
        this.goToStep('prev');
      }
      if (this.bookStep === 2 && !this.serviceOption) {
        let source = this.lStorageService.getitemfromLocalStorage('source');
        if (source) {
          window.location.href = source;
          this.lStorageService.removeitemfromLocalStorage('reqFrom');
          this.lStorageService.removeitemfromLocalStorage('source');
        } else {
          this.goToStep('prev');
        }
      } else {
        this.goToStep('prev');
      }
    }
    if (this.action !== 'addmember') {
      console.log(this.closebutton);
      this.closebutton.nativeElement.click();
      this.modalOpen = false;
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
  confirm() {
    const _this = this;
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    this.isClickedOnce = true;
    this.confirmButton['disabled'] = true;
    switch (this.confirmButton['action']) {
      case 'reschedule':
        _this.bookingReschedule().then(
          () => {
            this.bookingCompleted();            
          }, (error) => {
            this.confirmButton['disabled'] = false;
            let errorObj = _this.errorService.getApiError(error);
            _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
            _this.router.navigate([this.sharedService.getRouteID(), 'dashboard'])
          }
        );
        break;
      default:
        this.confirmBooking('booking');
        break;
    }
  }
  confirmBooking(type?) {
    if (this.selectedService.isPrePayment && (!this.commObj['communicationEmail'] || this.commObj['communicationEmail'] === '')) {
      const emaildialogRef = this.dialog.open(ConsumerEmailComponent, {
        width: '40%',
        panelClass: ['loginmainclass', 'popup-class'],
        data: {
        }
      });
      emaildialogRef.afterClosed().subscribe(result => {
        if (result !== '' && result !== undefined) {
          this.commObj['communicationEmail'] = result;
          this.confirmBooking(type);
        } else {
          this.isClickedOnce = false;
          this.goBack('backy');
          this.subscriptionService.sendMessage({ ttype: 'loading_start' });
        }
      });
    } else {
      console.log("this.bookingFor", this.bookingFor)
      if (this.bookingFor.length !== 0) {
        for (const list of this.bookingFor) {
          if (list.id === this.parentCustomer.id) {
            list['id'] = 0;
          }
        }
      }
      console.log("this.bookingFor2", this.bookingFor)
      if (this.selectedService.serviceType === 'virtualService' && !this.bookingService.validateVirtualCallInfo(this.callingModes, this.selectedService, this.commObj)) {
        this.toastService.showError('Please enter valid mobile number');
        this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
        return false;
      }
      if (type === 'booking') {
        if (this.jcashamount > 0 && this.checkJcash) {
          this.consumerService.getRemainingPrepaymentAmount(this.checkJcash, this.checkJcredit, this.paymentDetails.amountRequiredNow)
            .subscribe(data => {
              this.remainingadvanceamount = data;
              this.performBooking();
            });
        } else {
          this.performBooking();
        }
      } else if (this.selectedService.isPrePayment) {
        this.addAdvancePayment(this.selectedSlots[0]);
      }
    }
    return true;
  }
  performBooking(): void { // Indicating that no return value is expected
    const _this = this;

    // Checking if pre-payment is required but no payment mode is selected
    if (this.selectedService.isPrePayment && !this.paymentMode && this.paymentDetails.amountRequiredNow > 0) {
      this.toastService.showError('Please select one payment mode');
      this.isClickedOnce = false;
      this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
      return; // Early return in case of error
    }

    // If it's an appointment type service
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      this.performAppointment();
      return; // Explicit return after performing appointment
    }

    // If it's not an appointment, perform check-in and payment operation
    this.performCheckin().then(() => {
      _this.paymentOperation(this.paymentMode);
    });
  }
  performCheckin() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      console.log("Payment Req Id:", _this.paymentRequestId);
      if (_this.paymentRequestId) {
        resolve(true);
      } else {
        let post_Data = _this.generateInputForBooking();
        const subs = _this.consumerService.addCheckin(_this.accountId, post_Data)
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


            _this.submitQuestionnaire(parentUid).then(() => {
              resolve(true);
            });
            if (_this.serviceOptionInfo && _this.serviceOptionInfo.answers) {
              _this.submitserviceOptionQuestionnaire(parentUid).then(() => {
                resolve(true);
              });
            }

          }, error => {
            _this.isClickedOnce = false;
            _this.confirmButton['disabled'] = false;
            let errorObj = _this.errorService.getApiError(error);
            _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          });
          _this.subs.add(subs);
      }
    });
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
  getAdvancePayment(post_Data) {
    const param = { 'account': this.accountId };
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        _this.bookingService.addApptAdvancePayment(param, post_Data).subscribe(
          (data) => {
            resolve(data);
          }, (error) => {
            reject(error);
          }
        )
      } else {
        _this.bookingService.addWaitlistAdvancePayment(param, post_Data).subscribe(
          (data) => {
            resolve(data);
          }, (error) => {
            reject(error);
          }
        )
      }
    })
  }
  async performAppointment() {
    const _this = this;
    let count = 0;
    for (let i = 0; i < this.selectedSlots.length; i++) {
      await _this.takeAppointment(this.selectedSlots[i]).then(
        () => {
          count++;
          if (count === this.selectedSlots.length) {
            this.paymentOperation(this.paymentMode);
          }
        }
      );
    }
  }
  paymentOperation(paymenttype?) {
    if (this.paymentDetails && this.paymentDetails.amountRequiredNow > 0) {
      this.setAnalytics('payment_initiated');
      this.payuPayment(paymenttype);
    } else {
      this.bookingCompleted();
    }
  }
  payuPayment(paymenttype?) {
    this.makeFailedPayment(paymenttype);
  }
  makeFailedPayment(paymentMode) {
    this.paymentReqInfo = {
      'amount': this.paymentDetails.amountRequiredNow,
      'paymentMode': null,
      'uuid': this.trackUuid,
      'accountId': this.accountId,
      'purpose': 'prePayment'
    };
    this.paymentReqInfo.paymentMode = paymentMode;
    this.paymentReqInfo['serviceId'] = this.selectedServiceId;
    this.paymentReqInfo['isInternational'] = this.isInternational;
    if (this.paymentRequestId) {
      this.paymentReqInfo['paymentRequestId'] = this.paymentRequestId;
    }
    this.convenientPaymentModes.map((res: any) => {
      this.convenientFeeObj = res;
      if (this.convenientFeeObj && this.convenientFeeObj.isInternational && this.isInternational) {
        if (this.paymentMode === this.convenientFeeObj.mode) {
          this.paymentReqInfo['convenientFee'] = this.convenientFeeObj.consumerGatewayFee;
          this.paymentReqInfo['convenientFeeTax'] = this.convenientFeeObj.consumerGatewayFeeTax;
          this.paymentReqInfo['jaldeeConvenienceFee'] = this.convenientFeeObj.convenienceFee;
          this.paymentReqInfo['profileId'] = this.paymentmodes.profileId;
          this.paymentReqInfo['paymentSettingsId'] = this.convenientFeeObj.paymentSettingsId
          this.paymentReqInfo['paymentGateway'] = this.convenientFeeObj.gateway
          console.log("Non-Indian Payment Info", this.paymentReqInfo);
        }
      }
      if (this.convenientFeeObj && !this.convenientFeeObj.isInternational && !this.isInternational) {
        if (this.paymentMode === this.convenientFeeObj.mode) {
          this.paymentReqInfo['convenientFee'] = this.convenientFeeObj.consumerGatewayFee;
          this.paymentReqInfo['convenientFeeTax'] = this.convenientFeeObj.consumerGatewayFeeTax;
          this.paymentReqInfo['jaldeeConvenienceFee'] = this.convenientFeeObj.convenienceFee;
          this.paymentReqInfo['profileId'] = this.paymentmodes.profileId;
          this.paymentReqInfo['paymentSettingsId'] = this.convenientFeeObj.paymentSettingsId
          this.paymentReqInfo['paymentGateway'] = this.convenientFeeObj.gateway
          console.log("Indian Payment Info", this.paymentReqInfo)
        }
      }
    })
    this.lStorageService.setitemonLocalStorage('uuid', this.trackUuid);
    this.lStorageService.setitemonLocalStorage('acid', this.accountId);
    this.lStorageService.setitemonLocalStorage('p_src', 'c_c');
    console.log("paymentReqInfo:", this.paymentReqInfo);
    if (this.remainingadvanceamount == 0 && this.checkJcash) {
      const postData = {
        'amountToPay': this.paymentDetails.amountRequiredNow,
        'accountId': this.accountId,
        'uuid': this.trackUuid,
        'paymentPurpose': 'prePayment',
        'isJcashUsed': true,
        'isreditUsed': false,
        'isRazorPayPayment': false,
        'isPayTmPayment': false,
        'paymentMode': "JCASH"
      };
      this.consumerService.PayByJaldeewallet(postData)
        .subscribe(data => {
          this.wallet = data;
          this.confirmButton['disabled'] = false;
          if (!this.wallet.isGateWayPaymentNeeded && this.wallet.isJCashPaymentSucess) {
            this.bookingCompleted();
          }
        }, error => {
          this.isClickedOnce = false;
          this.confirmButton['disabled'] = false;
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
        });
    } else if (this.remainingadvanceamount > 0 && this.checkJcash) {
      const postData: any = {
        'amountToPay': this.paymentDetails.amountRequiredNow,
        'accountId': this.accountProfile.id,
        'uuid': this.trackUuid,
        'paymentPurpose': 'prePayment',
        'isJcashUsed': true,
        'isreditUsed': false,
        'isRazorPayPayment': false,
        'isPayTmPayment': false,
        'paymentMode': null
      };
      postData.paymentMode = paymentMode;
      postData.isInternational = this.isInternational;
      postData.serviceId = this.selectedServiceId;
      this.consumerService.PayByJaldeewallet(postData)
        .subscribe((pData: any) => {
          this.confirmButton['disabled'] = false;
          if (pData.isGateWayPaymentNeeded == true && pData.isJCashPaymentSucess == true) {
            if (pData.paymentGateway == 'PAYTM') {
              this.payWithPayTM(pData.response, this.accountId);
            } else {
              this.paywithRazorpay(pData.response);
            }
          }
        }, error => {
          this.isClickedOnce = false;
          this.confirmButton['disabled'] = false;
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
        });
    } else {
      const subs = this.consumerService.consumerPayment(this.paymentReqInfo)
        .subscribe((pData: any) => {
          console.log(JSON.stringify(pData));
          this.paymentRequestId = pData['paymentRequestId'];
          this.pGateway = pData.paymentGateway;
          this.confirmButton['disabled'] = false;
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
          this.confirmButton['disabled'] = false;
          let errorObj = this.errorService.getApiError(error);    
          this.toastService.showError(this.wordProcessor.getProjectErrorMesssages(errorObj));
        });
        this.subs.add(subs);
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
  bookingCompleted() {
    let queryParams = {};
    if (this['from']) {
      queryParams['isFrom'] = this['from'];
    }
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      if (this.bookingType === 'reschedule') {
        queryParams['type'] = this.bookingType;
        queryParams['uuid'] = this.bookingId;
      } else {
        queryParams['uuid'] = this.trackUuid;
      }
      if (this.selectedSlots.length > 1) {
        queryParams['selectedApptsTime'] = this.selectedApptsTime;
        queryParams['selectedSlots'] = JSON.stringify(this.selectedSlots);
      }
    } else {
      if (this.bookingType === 'reschedule') {
        queryParams['type'] = this.bookingType;
        queryParams['uuid'] = this.bookingId;
      } else {
        let multiple;
        if (this.uuidList.length > 1) {
          multiple = true;
        } else {
          multiple = false;
        }
        queryParams['uuid'] = this.uuidList;
        queryParams['multiple'] = multiple;
      }
    }
    let navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.setAnalytics();
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      this.ngZone.run(() => this.router.navigate([this.sharedService.getRouteID(), 'booking', 'confirm'], navigationExtras));
    } else {
      this.ngZone.run(() => this.router.navigate([this.sharedService.getRouteID(), 'booking', 'confirm'], navigationExtras));
    }
  }
  finishBooking(status) {
    if (status) {
      this.isClickedOnce = false;
      this.toastService.showSuccess(Messages.PROVIDER_BILL_PAYMENT);
      this.bookingCompleted();
    } else {
      this.closeloading();
    }
  }
  closeloading() {
    this.ngZone.run(() => {
      this.btnClicked = false;
      this.loadingPaytm = false;
      this.isClickedOnce = false;
      this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
      this.cdRef.detectChanges();
    });
    return false;
  }

  filesSelected(event, type) {
    console.log("event", event)
    let loggedUser = this.groupService.getitemFromGroupStorage('jld_scon');
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
              this.confirmButton['disabled'] = false;
              this.api_loading = false;
              _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
              this.toastService.showError(error);

            }
          );
        }).catch((error) => {
          this.api_loading = false;
          this.confirmButton['disabled'] = false;
          this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
          this.toastService.showError(error);
        })
    }
    console.log('addWaitlistAttachment', this.filesToUpload)
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
          _this.toastService.showError(error);
          resolve(false);
        });
    })
  }
  deleteTempImage(i, file) {
    console.log('this.selectedFiles[type]', file);
    console.log('file', file);
    delete file['s3path'];
    delete file['uid'];
    if (file.driveId) {
      file['action'] = 'remove';
      this.filesToUpload.push(file);
    }
    let files = this.filesToUpload.filter((fileObj: any) => {
      // Ensure that selectedMessage and selectedFile exist
      const selectedFile = this.selectedMessage?.files[i];

      // If any required field is missing, exclude this file (return false)
      if (!fileObj?.fileName || !selectedFile?.name || !fileObj.type) {
        return false; // Explicitly return false when conditions are not met
      }

      // If the file names match, include this file (return true)
      return fileObj.fileName === selectedFile.name;
    });
    if (files && files.length > 0) {
      let fileIndex = this.filesToUpload.indexOf(files[0]);
      if (!file.driveId) {
        this.filesToUpload.splice(fileIndex, 1);
      }
    }
    console.log('this.filesToUpload', this.filesToUpload);
    this.selectedMessage.files.splice(i, 1);
    this.selectedMessage.base64.splice(i, 1);
    this.selectedMessage.caption.splice(i, 1);
    this.fileInputs.nativeElement.value = '';
  }
  transactionCompleted(response, payload, accountId) {
    console.log("Response:", response);
    if (response.SRC) {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.razorpayService.updateRazorPay(payload, accountId)
          .then((data) => {
            if (data) {
              this.setAnalytics('payment_completed');
              this.finishBooking(true);
            }
          })
      } else if (response.STATUS == 'TXN_FAILURE') {
        if (response.error && response.error.description) {
          this.toastService.showError(response.error.description);
        }
        this.finishBooking(false);
      }
    } else {
      if (response.STATUS == 'TXN_SUCCESS') {
        this.paytmService.updatePaytmPay(payload, accountId)
          .then((data) => {
            if (data) {
              this.setAnalytics('payment_completed');
              this.finishBooking(true);
            }
          })
      } else if (response.STATUS == 'TXN_FAILURE') {
        this.toastService.showError(response.RESPMSG);
        this.finishBooking(false);
      }
    }
  }
  takeAppointment(appmtSlot) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      console.log("Payment Req Id:", _this.paymentRequestId);
      if (_this.paymentRequestId) {
        resolve(true);
      } else {
        let post_Data = _this.generateInputForBooking();
        // post_Data['appmtSlot'] = appmtSlot;
        if (!_this.selectedService.date && (_this.selectedService && !_this.selectedService.noDateTime)) {
          post_Data['appmtFor'][0]['apptTime'] = appmtSlot['time'];
        }
        post_Data['schedule'] = { 'id': appmtSlot['scheduleId'] };
        console.log("Post data:", post_Data);
        if (_this.selectedService.serviceBookingType === 'request' && (_this.selectedService.date || _this.selectedService.dateTime || (_this.selectedService && _this.selectedService.noDateTime))) {
          const subs = _this.consumerService.postAppointmentRequest(_this.accountId, post_Data)
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
              if (_this.serviceOptionInfo && _this.serviceOptionInfo.answers) {
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
              _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
            });
            _this.subs.add(subs);
        }
        else {
          const subs = _this.consumerService.addCustomerAppointment(_this.accountId, post_Data)
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
              if (_this.serviceOptionInfo && _this.serviceOptionInfo.answers) {
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
              _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
              _this.subscriptionService.sendMessage({ttype:'loading_stop'});
            });
            _this.subs.add(subs);
        }
      }
    })
  }
  privacyCheck(event) {
    this.checkPolicy = event.target.checked;
    this.setButtonVisibility();
  }

  consumerNoteAndFileSave(uuid) {
    const saveAttachment_data = {
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
      _this.sendAttachment(_this.accountId, uuid, saveAttachment_data).then(
        () => {
          if (_this.bookingType !== 'reschedule') {
            _this.submitQuestionnaire(uuid).then(() => {
              resolve(true);
            }
            );
          } else {
            _this.bookingCompleted();
          }
        }
      ).then((error) => {
        _this.isClickedOnce = false;
        _this.wordProcessor.apiErrorAutoHide(_this, error);
      });
    })
  }
  sendAttachment(accountid, uuid, input) {
    console.log('input', input)
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (input && _this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        _this.consumerService.addAppointmentAttachment(accountid, uuid, input)
          .subscribe(
            () => {
              resolve(true);
            }, (error) => {
              reject(error);
            });
      } else {
        _this.consumerService.addWaitlistAttachment(accountid, uuid, input)
          .subscribe(
            () => {
              resolve(true);
            }, (error) => {
              reject(error);
            });
      }
    });
  }

  getserviceOptionQuestionAnswers(event) {
    this.serviceOptionInfo = event;
    if (this.serviceOptionInfo.answers.answerLine && this.serviceOptionInfo.answers.answerLine.length === 0) {
      this.showNext = false;
    } else {
      this.showNext = true;
    }
    this.lStorageService.setitemonLocalStorage('serviceOPtionInfo', this.serviceOptionInfo);
  }
  submitBookingQuestionaire(dataToSend, uuid, accountId) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        _this.questionaireService.submitConsumerApptQuestionnaire(dataToSend, uuid, accountId).subscribe((data: any) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
      } else {
        _this.questionaireService.submitConsumerWaitlistQuestionnaire(dataToSend, uuid, accountId).subscribe((data: any) => {
          resolve(data);
        }, (error) => {
          reject(error);
        });
      }
    })
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
        _this.submitBookingQuestionaire(dataToSend, uuid, _this.accountId).then((data: any) => {
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
                    if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
                      _this.questionaireService.consumerApptQnrUploadStatusUpdate(uuid, _this.accountId, postData)
                        .subscribe(() => {
                          resolve(true);
                        }, (error) => {
                          _this.isClickedOnce = false;
                          let errorObj = _this.errorService.getApiError(error);
                          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
                          _this.api_loading_video = false;
                          _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
                          resolve(false);
                        });
                    } else {
                      _this.questionaireService.consumerWaitlistQnrUploadStatusUpdate(uuid, _this.accountId, postData)
                        .subscribe(() => {
                          resolve(true);
                        }, (error) => {
                          _this.isClickedOnce = false;
                          let errorObj = _this.errorService.getApiError(error);
                          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
                          _this.api_loading_video = false;
                          _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
                          resolve(false);
                        });
                    }
                  }
                }, error => {
                  _this.isClickedOnce = false;
                  let errorObj = _this.errorService.getApiError(error);
                  _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
                  _this.api_loading_video = false;
                  _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
                });
            }
          } else {
            resolve(true);
          }
        }).catch((error) => {
          _this.isClickedOnce = false;
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          _this.api_loading_video = false;
          _this.subscriptionService.sendMessage({ ttype: 'loading_file_stop' });
          resolve(false);
        });
      } else {
        resolve(true);
      }
    });
  }
  submitserviceOptionQuestionnaire(uuid) {
    const _this = this;
    _this.groupedQnr = _this.serviceOptionInfo.answers.answerLine.reduce(function (rv, x) {
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
          } else {
            finalSubList[0].answer.dataGridList.push(element.dgList[0].answer.dataGridList[0])
          }

        });
        finalList.push(finalSubList[0]);
        this.advPostData = finalList;
        finalSubList = [];
      }
    }
    _this.finalDataToSend = {
      'questionnaireId': _this.serviceOptionInfo.answers.questionnaireId,
      'answerLine': finalList
    }
    const data = this.finalDataToSend;
    return new Promise(function (resolve, reject) {
      const dataToSend: FormData = new FormData();
      if (data.files) {
        for (const pic of data.files) {
          dataToSend.append('files', pic, pic['name']);
        }
      }
      const blobpost_Data = new Blob([JSON.stringify(data)], { type: 'application/json' });
      dataToSend.append('question', blobpost_Data);

      if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        const subs = _this.consumerService.submitConsumerApptServiceOption(dataToSend, uuid, _this.accountId).subscribe((data: any) => {
          resolve(true);
        }, error => {
          _this.isClickedOnce = false;
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          resolve(false);
        });
        _this.subs.add(subs);
      } else {
        const subs = _this.consumerService.submitConsumerWaitlistServiceOption(dataToSend, uuid, _this.accountId).subscribe((data: any) => {
          resolve(true);
        }, error => {
          _this.isClickedOnce = false;
          let errorObj = _this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          resolve(false);
        });
        _this.subs.add(subs);
      }
    });
  }
  setAnalytics(source?) {
    let analytics = {
      accId: this.accountProfile.id,
      domId: this.accountProfile.serviceSector.id,
      subDomId: this.accountProfile.serviceSubSector.id
    }
    if (this.selectedService && this.selectedService.bType && this.selectedService.bType === 'Appointment') {
      if (source === 'dateTime_login') {
        analytics['metricId'] = 513;
      } else if (source === 'dateTime_withoutlogin') {
        analytics['metricId'] = 514;
      } else if (source === 'payment_initiated') {
        analytics['metricId'] = 517;
      } else if (source === 'payment_completed') {
        analytics['metricId'] = 520;
      } else {
        analytics['metricId'] = 502;
      }
    } else {
      if (source === 'dateTime_login') {
        analytics['metricId'] = 525;
      } else if (source === 'dateTime_withoutlogin') {
        analytics['metricId'] = 526;
      } else if (source === 'payment_initiated') {
        analytics['metricId'] = 529;
      } else if (source === 'payment_completed') {
        analytics['metricId'] = 532;
      } else {
        analytics['metricId'] = 505;
      }
    }
    this.consumerService.updateAnalytics(analytics).subscribe();
  }
  locationClicked(location) {
    this.selectedLocation = location;
  }
  departmentClicked(department) {
    this.selectedUser = null;
    this.bookingService.setSelectedUser(null);
    this.bookingService.getServicesByDepartment(department['departmentId']);
    let users = this.bookingService.getUsers();
    if (department && department.departmentId && users) {
      this.activeUsers = users.filter(user => user.deptId === department.departmentId);
    }
    this.bookingService.setActiveUsers(this.activeUsers);
  }
  userClicked(user) {
    this.bookingService.getServicesByUser(user.id);
  }

  serviceSelected(service) {
    this.paymentRequestId = '';
    if (service && service.id) {
      this.selectedServiceId = service.id;
    }
    if (service && service.bType && service.bType === 'Appointment') {
      if (service.maxBookingsAllowed > 1 && this.bookingType != 'reschedule') {
        service['multipleSelection'] = service.maxBookingsAllowed;
      } else {
        service['multipleSelection'] = 1;
      }
    }
    this.bookingService.setActiveService(service);
    this.selectedService = service;
  }
  viewAttachments() {
    this.action = 'attachment';
    this.modalOpen = true;
    console.log(this.modal)
    this.modal.nativeElement.click();
  }
  getPartysizeDetails(domain, subdomain) {
    const subs = this.consumerService.getPartysizeDetails(domain, subdomain)
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
      });
        this.subs.add(subs);
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
  getImage(url, file) {
    return this.fileService.getImage(url, file);
  }
  clearCouponErrors() {
    this.couponValid = true;
    this.couponError = null;
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
      this.toastService.showError(error);
      this.btnClicked = false;
    });
  }
  getCoupons() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
        _this.bookingService.getApptCoupons(_this.selectedServiceId, _this.selectedLocation.id)
          .subscribe((res: any) => {
            resolve(res);
          }, (error) => {
            reject(error);
          });
      } else {
        _this.bookingService.getCheckinCoupons(_this.selectedServiceId, _this.selectedLocation.id)
          .subscribe((res: any) => {
            resolve(res);
          }, (error) => {
            reject(error);
          });
      }
    })
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
  getQuestionAnswers(event) {
    this.questionAnswers = event;
  }
  checkCouponvalidity() {
    const _this = this;
    const post_Data = this.generateInputForBooking();
    if (_this.selectedService && _this.selectedService.bType && _this.selectedService.bType === 'Appointment') {
      post_Data['appmtFor'][0]['apptTime'] = this.selectedSlots[0]['time'];
      post_Data['schedule'] = { 'id': this.selectedSlots[0]['scheduleId'] };
      const param = { 'account': this.accountId };
      const subs = this.consumerService.addApptAdvancePayment(param, post_Data).subscribe(data => {
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
        _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
      });
      this.subs.add(subs);
    }
    else {
      const post_Data = this.generateInputForBooking();
      const param = { 'account': this.accountId };
      const subs = this.consumerService.addWaitlistAdvancePayment(param, post_Data)
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
          let errorObj = this.errorService.getApiError(error);
          _this.toastService.showError(_this.wordProcessor.getProjectErrorMesssages(errorObj));
          _this.subscriptionService.sendMessage({ttype:'loading_stop'});
        });
        this.subs.add(subs);
    }
  }
  setConfirmButton() {
    if (this.bookingType !== 'reschedule' && this.selectedService['serviceBookingType'] === 'request' &&
      (this.selectedService['date'] || this.selectedService.dateTime ||
        (this.selectedService && this.selectedService.noDateTime))) {
      this.confirmButton['caption'] = 'Send Request';
      this.confirmButton['action'] = "request";
    } else if (this.bookingType === 'reschedule' && (this.selectedService && !this.selectedService.noDateTime)) {
      this.confirmButton['caption'] = 'Reschedule';
      this.confirmButton['action'] = "reschedule";
    } else if (this.paymentDetails.amountRequiredNow > 0) {
      this.confirmButton['caption'] = 'Make Payment';
      this.confirmButton['action'] = "payment";
    } else {
      this.confirmButton['caption'] = 'Confirm';
      this.confirmButton['action'] = "confirm";
    }
    this.setButtonVisibility();
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
    console.log("indian_payment_mode_onchange", event);
    this.isInternational = false;
    this.setTotalAmountWithConvenientFee();
  }
  non_indian_modes_onchange(event) {
    this.paymentMode = event.value;
    this.isInternational = true;
    this.setTotalAmountWithConvenientFee();
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
          this.convenientFee = this.convenientFeeObj.convenienceFee;
          this.paymentDetails['amountToPay'] = this.convenientFeeObj.amountWithAllCharges;
          console.log("Convenient feea:", this.convenientFeeObj.amountWithAllCharges);
          console.log("gatewayFee for  non-indian:", this.gatewayFee, res.mode)
        }
      }
    })
  }
  setConvenientFee() {
    const _this = this;
    let convienientPaymentObj = {}
    convienientPaymentObj = {
      "profileId": _this.paymentProfileId,
      "amount": _this.paymentDetails.amountRequiredNow
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
      _this.setTotalAmountWithConvenientFee();
    });
  }
  setButtonVisibility() {
    if ((this.bookingPolicy && !this.checkPolicy) || this.isClickedOnce) {
      this.confirmButton['disabled'] = true;
    } else {
      this.confirmButton['disabled'] = false;
    }
  }
  addMember() {
    this.action = 'addmember';
    this.disable = false;
  }
  handleReturnDetails(obj) {
    this.addmemberobj.fname = obj.fname || '';
    this.addmemberobj.lname = obj.lname || '';
    this.addmemberobj.title = obj.title || '';
    this.addmemberobj.mobile = obj.mobile || '';
    this.addmemberobj.gender = obj.gender || '';
    this.addmemberobj.dob = obj.dob || '';
    this.disable = false;
  }
  showSpec() {
    if (this.showmoreSpec) {
      this.showmoreSpec = false;
    } else {
      this.showmoreSpec = true;
    }
  }
  handleConsumerNote(vale) {
    this.consumerNote = vale.trim();
  }
}
