import { DOCUMENT } from "@angular/common";
import { Component, ElementRef, HostListener, Inject, OnDestroy, OnInit, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { SubSink } from "subsink";
import { AccountService } from "../../services/account-service";
import { ConsumerService } from "../../services/consumer-service";
import { interval as observableInterval, Subscription } from 'rxjs';
import { ConsumerRateServicePopupComponent } from "../consumer-rate-service-popup/consumer-rate-service-popup";
import { MeetingDetailsComponent } from "../meeting-details/meeting-details.component";
import { AddInboxMessagesComponent } from "../add-inbox-messages/add-inbox-messages.component";
import { projectConstants } from "../../constants/project-constants";
import { AuthService } from "../../services/auth-service";
import { Messages, projectConstantsLocal } from "jaldee-framework/constants";
import { WordProcessor } from "jaldee-framework/word-processor";
import { SnackbarService } from "jaldee-framework/snackbar";
import { LocalStorageService } from "jaldee-framework/storage/local";
import { GroupStorageService } from "jaldee-framework/storage/group";
import { DateTimeProcessor } from "jaldee-framework/calendar/date-time";
import { ViewRxComponent } from "jaldee-framework/view-rx";
import { SharedService } from "jaldee-framework/shared";
import { AttachmentPopupComponent } from "../attachment-popup/attachment-popup.component";
import { GalleryService } from "../gallery/galery-service";
import { GalleryImportComponent } from "../gallery/import/gallery-import.component";
import { InvoiceListComponent } from "../invoice-list/invoice-list.component";
import { OrderService } from "../../services/order.service";

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit, OnDestroy {

  send_msg_cap = Messages.SEND_MSG_CAP;
  make_pay_cap = Messages.MAKE_PAYMENT_CAP;
  bill_cap = Messages.BILL_CAPTION;
  rate_visit = Messages.RATE_VISIT;
  get_token_btn = Messages.GET_TOKEN;
  server_date;
  waitlists;
  appointments: any = [];
  history;
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
  monthFormat = projectConstantsLocal.DATE_FORMAT_STARTS_MONTH;
  dateFormatSp = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT_WITH_DAY;
  timeFormat = projectConstantsLocal.PIPE_DISPLAY_TIME_FORMAT;
  loadcomplete = { waitlist: false, history: false, donations: false, appointment: false };
  tooltipcls = projectConstantsLocal.TOOLTIP_CLS;
  pagination: any = {
    startpageval: 1,
    totalCnt: 0,
    perPage: projectConstantsLocal.PERPAGING_LIMIT
  };
  panelOpenState = false;
  total_requests: any = [];
  apptRequests: any = [];
  moreApptRequest: any = [];
  more_requestShow = false;
  isRequest: boolean = false;
  s3url = null;
  settingsjson = null;
  settings_exists = false;
  futuredate_allowed = false;
  reload_history_api = { status: true };
  subscription: Subscription;
  cronHandle: Subscription;
  countercronHandle: Subscription;
  cronStarted;
  refreshTime = projectConstantsLocal.CONSUMER_DASHBOARD_REFRESH_TIME;
  refreshTimeForTracking = 600000;
  counterrefreshTime = 60; // seconds, set to reduce the counter every minute, if required
  open_fav_div = null;
  hideShowAnimator = false;
  nextavailableCaption = Messages.NXT_AVAILABLE_TIME_CAPTION;
  estimatesmallCaption = Messages.ESTIMATED_TIME_SMALL_CAPTION;
  notificationdialogRef;
  addnotedialogRef;
  checkindialogRef;
  ratedialogRef;
  privacydialogRef;
  canceldialogRef;
  servicesjson: any = [];
  public time = 300;
  public mode = 'horizontal';
  public perspective = 2000;
  public init = 0;
  isCheckinEnabled = true;
  coupondialogRef: MatDialogRef<{}, any>;
  nextAvailDate;
  terminologiesJson: any = [];
  mins;
  status: Boolean;
  callingModesDisplayName = projectConstantsLocal.CALLING_MODES;
  donations: any = [];
  rupee_symbol = 'Ã¢â€šÂ¹';
  appttime_arr: any = [];
  api_error: any;
  api_loading = false;
  futureAllowed = true;
  usr_details: any;
  login_details: any;
  future_appointments: any = [];
  future_waitlists: any = [];
  todayDate = new Date();
  tDate: any;
  path = projectConstants.PATH;
  locationholder: any;
  today_totalbookings: any = [];
  future_totalbookings: any = [];
  todayBookings: any = [];
  todayBookings_more: any = [];
  more_tdybookingsShow = false;
  futureBookings: any = [];
  futureBookings_more: any = [];
  more_futrbookingsShow = false;
  appointmentslist: any = [];
  tdyDate: string;
  loading = true;
  provider_label: any;
  viewrxdialogRef;
  tomorrowDate: Date;
  screenWidth: number;
  no_of_grids: number;
  bookingStatusClasses = projectConstantsLocal.BOOKING_STATUS_CLASS;
  display_dateFormat = projectConstantsLocal.DATE_FORMAT_WITH_MONTH;
  galleryDialog: any;
  extras: any;
  private subs = new SubSink();
  accountId: any;
  customAppid: any;
  customId: any;
  countryCode: any;
  chatId: any;
  showTeleBt = false;
  tele_popUp;
  @ViewChild('popupforApp') popUp: ElementRef;
  showattachmentDialogRef: MatDialogRef<unknown, any>;
  theme: any;
  fromApp = false;
  homeView: any;
  customLink: boolean = false;
  accountProfile: any;
  accountConfig: any;
  account: any;
  moment: any;
  loggedIn: boolean = true;
  ivrEnabled = false;
  callBackList: any = [];
  callBackHistoryList: ArrayBuffer;
  invoiceDetailsById: any;
  allInvocies: any;
  selectedInoviceId: any;
  uuid: any;
  showOrder = false;
  more_tdyOrdersShow: boolean;
  more_futrOrdersShow: boolean;
  total_tdy_order: any[];
  todayOrderslst: any[];
  todayOrderslst_more: any[];
  total_future_order: any[];
  futureOrderslst: any[];
  futureOrderslst_more: any[];
  future_orders: any = [];
  orders: any = [];
  myOrders: any;
  onlineOrder: any = false;
  limit = 3;
  orderLimit = 3;
  settings: any;
  apptSettings: any;
  enabledWaitlist: any;
  enableAppt: any;
  isPartnerLogin: any;
  constructor(private consumerService: ConsumerService,
    private accountService: AccountService,
    public translate: TranslateService,
    private sharedService: SharedService,
    private dialog: MatDialog, private router: Router,
    @Inject(DOCUMENT) public document,
    private activated_route: ActivatedRoute,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private wordProcessor: WordProcessor,
    private snackbarService: SnackbarService,
    private galleryService: GalleryService,
    private dateTimeProcessor: DateTimeProcessor,
    private authService: AuthService,
    private orderService: OrderService,
    public _sanitizer: DomSanitizer) {
    if (this.lStorageService.getitemfromLocalStorage('onlineOrder')) {
      this.onlineOrder = this.lStorageService.getitemfromLocalStorage('onlineOrder');
    }
    if (this.lStorageService.getitemfromLocalStorage('partner')) {
      this.isPartnerLogin = this.lStorageService.getitemfromLocalStorage('partner')
    }
    this.account = this.accountService.getAccountInfo();
    this.settings = this.accountService.getJson(this.account['settings']);
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    this.enableAppt = this.apptSettings.enableAppt;
    this.enabledWaitlist = this.settings.enabledWaitlist;
    console.log("this.apptSettings",this.enableAppt)
    console.log("this.apptSettingsthis.settings",this.enabledWaitlist)

    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    if(!this.enableAppt && !this.enabledWaitlist ) {
      this.showOrders();
    }
    this.onResize();
    this.subs.sink = this.activated_route.queryParams.subscribe(qparams => {
      if (qparams['source'] && (qparams['source'] === 'checkin_prepayment' || qparams['source'] === 'appt_prepayment')) {
        this.api_loading = true;
        setTimeout(() => {
          this.api_loading = false;
        }, 8000);
      }
    });
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    let divider;
    const divident = this.screenWidth / 37.8;
    if (this.screenWidth > 1000) {
      divider = divident / 3;
    } else if (this.screenWidth > 600 && this.screenWidth < 1000) {
      divider = divident / 2;
    } else if (this.screenWidth < 600) {
      divider = divident / 1;
    }
    this.no_of_grids = Math.round(divident / divider);
  }

  actionPerformed(event) {
    this.accountService.sendMessage({ ttype: 'refresh' });
    this.initConsumer();
  }
  initConsumer() {
    this.authService.goThroughLogin().then((status) => {
      console.log("Status:", status);
      if (status) {
        this.api_loading = false;
        if (this.lStorageService.getitemfromLocalStorage('reqFrom') === 'cuA') {
          this.fromApp = true;
        }
        this.usr_details = this.groupService.getitemFromGroupStorage('ynw-user');
        this.login_details = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('ynw-credentials'));
        this.tele_popUp = this.lStorageService.getitemfromLocalStorage('showTelePop');
        let login = this.login_details;
        if (login && login.countryCode && login.countryCode.startsWith('+')) {
          this.countryCode = login.countryCode.substring(1);
          this.consumerService.consumertelegramChat(this.countryCode, login.loginId).subscribe(
            data => {
              this.chatId = data;
              if (this.chatId === null) {
                this.showTeleBt = true;
                if (this.tele_popUp) {
                  this.popUp.nativeElement.style.display = 'block';
                  this.lStorageService.removeitemfromLocalStorage('showTelePop');
                }
              }
            });
        }
        this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
        this.locationholder = this.lStorageService.getitemfromLocalStorage('ynw-locdet');
        this.moment = this.dateTimeProcessor.getMoment();
        this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
        this.getAppointmentToday();
        this.subs.sink = observableInterval(this.refreshTime * 1000).subscribe(x => {
          this.reloadAPIs();
        });
        this.subs.sink = observableInterval(this.counterrefreshTime * 1000).subscribe(x => {
          this.recheckwaitlistCounters();
        });
        this.getApptRequests();
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
        this.api_loading = false;
      }
    });
  }
  ngOnInit() {
    const _this = this;
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };
    this.api_loading = true;
    this.accountService.sendMessage({ ttype: 'showLocation' });
    this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig.ivrEnabled) {
      this.ivrEnabled = true;
    }
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig && this.accountConfig['mode']) {
      this.homeView = this.accountConfig['mode'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountService.getCustomId();
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    if (this.accountConfig && this.accountConfig.ivrEnabled) {
      this.getCallbackRequestList();
      this.getCallbackRequestHistoryList();
    }
    _this.initConsumer();
    this.subs.sink = this.galleryService.getMessage().subscribe(input => {
      console.log("Reached Here:", input);
      if (input && input.accountId && input.uuid && input.type === 'appt') {
        this.consumerService.addAppointmentAttachment(input.accountId, input.uuid, input.value)
          .subscribe(
            () => {
              this.snackbarService.openSnackBar(Messages.ATTACHMENT_SEND, { 'panelClass': 'snackbarnormal' });
              this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
            },
            error => {
              this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
              this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
            }
          );
      } else {
        if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.snackbarService.openSnackBar(Messages.ATTACHMENT_SEND, { 'panelClass': 'snackbarnormal' });
                this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
              },
              error => {
                this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
                this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        }
      }
    });
  }
  goBack() {
    this.lStorageService.setitemonLocalStorage('tabIndex', "Home")
    this.router.navigate([this.accountService.getCustomId(), this.accountService.getTemplateJson().template]);
  }
  getApptRequests() {
    this.loading = true;
    this.consumerService.getApptRequestList(this.accountId).subscribe((res: any) => {
      console.log("Requestsss :", res);
      this.waitlists = res;
      this.total_requests = this.waitlists;
      this.isRequest = true;
      this.loading = false;
      this.apptRequests = [];
      this.moreApptRequest = [];
      //tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < this.total_requests.length; i++) {
        if (i <= 2) {
          this.apptRequests.push(this.total_requests[i]);
          console.log("For 3 only", this.apptRequests);
        } else {
          this.moreApptRequest.push(this.total_requests[i]);
          console.log("more than 3", this.moreApptRequest);
        }
      }
    })
  }
  redirectto(mod) {
    switch (mod) {
      case 'profile':
        this.router.navigate([this.customId, 'profile']);
        break;
    }
  }
  paymentsClicked(types) {
    let queryParams = {};
    queryParams['type'] = types
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'payments'], navigationExtras);
  }
  showcheckindetails(waitlist) {
    let queryParams = {};
    queryParams['uuid'] = waitlist.ynwUuid;
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'checkindetails'], navigationExtras);
  }
  showApptdetails(apptlist) {
    let queryParams = {};
    queryParams['uuid'] = apptlist.uid;
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'apptdetails'], navigationExtras);
  }
  showBookingDetails(booking, type?) {
    let queryParams = {};
    if (booking.apptStatus) {
      queryParams['uuid'] = booking.uid;
      queryParams['type'] = type;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'apptdetails'], navigationExtras);
    } else if (booking.waitlistStatus) {
      queryParams['uuid'] = booking.ynwUuid;
      queryParams['type'] = type;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'checkindetails'], navigationExtras);
    }
  }
  closeCounters() {
    if (this.cronHandle) {
      this.cronHandle.unsubscribe();
    }
    if (this.countercronHandle) {
      this.countercronHandle.unsubscribe();
    }
  }
  ngOnDestroy() {
    if (this.notificationdialogRef) {
      this.notificationdialogRef.close();
    }
    if (this.addnotedialogRef) {
      this.addnotedialogRef.close();
    }
    if (this.checkindialogRef) {
      this.checkindialogRef.close();
    }
    if (this.ratedialogRef) {
      this.ratedialogRef.close();
    }
    if (this.privacydialogRef) {
      this.privacydialogRef.close();
    }
    if (this.canceldialogRef) {
      this.canceldialogRef.close();
    }
    this.subs.unsubscribe();
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
  getCallbackRequestHistoryList() {
    this.tDate = this.dateTimeProcessor.transformToYMDFormat(this.todayDate);
    let callData = {
      'createdDate-lt': this.tDate
    };
    this.consumerService.getCallbackRequestList(callData).subscribe((data) => {
      this.callBackHistoryList = data;
    })
  }
  getCallbackRequestList() {
    let params = {
      'callStatus-eq': "callBackRequested"
    };
    this.consumerService.getCallbackRequestList(params).subscribe((data) => {
      this.callBackList = data;
    })
  }
  getWaitlist() {
    this.loadcomplete.waitlist = false;
    this.tDate = this.dateTimeProcessor.transformToYMDFormat(this.todayDate);
    let params = {
      'waitlistStatus-neq': 'failed,prepaymentPending', 'date-eq': this.tDate
    };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getWaitlist(params).subscribe(data => {
      this.waitlists = data;
      this.today_totalbookings = this.appointments.concat(this.waitlists);
      this.loading = false;
      this.getAppointmentFuture();
      // more case
      this.todayBookings = [];
      console.log(this.todayBookings);
      this.todayBookings_more = [];
      // tslint:disable-next-line:no-shadowed-variable
      for (let i = 0; i < this.today_totalbookings.length; i++) {
        if (i <= 2) {
          this.todayBookings.push(this.today_totalbookings[i]);
          console.log(this.todayBookings);
        } else {
          this.todayBookings_more.push(this.today_totalbookings[i]);
        }
      }
      const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
      const today = new Date(todaydt);
      let i = 0;
      let retval;
      for (const waitlist of this.waitlists) {
        const waitlist_date = new Date(waitlist.date);
        today.setHours(0, 0, 0, 0);
        waitlist_date.setHours(0, 0, 0, 0);
        this.waitlists[i].future = false;
        retval = this.getAppxTime(waitlist);
        if (today.valueOf() < waitlist_date.valueOf()) {
          this.waitlists[i].future = true;
          this.waitlists[i].estimated_time = retval.time;
          this.waitlists[i].estimated_timenow = retval.timenow;
          this.waitlists[i].estimated_timeslot = retval.timeslot;
          this.waitlists[i].estimated_caption = retval.caption;
          this.waitlists[i].estimated_date = retval.date;
          this.waitlists[i].estimated_date_type = retval.date_type;
          this.waitlists[i].estimated_autocounter = retval.autoreq;
        } else {
          this.waitlists[i].estimated_time = retval.time;
          this.waitlists[i].estimated_timenow = retval.timenow;
          this.waitlists[i].estimated_timeslot = retval.timeslot;
          this.waitlists[i].estimated_caption = retval.caption;
          this.waitlists[i].estimated_date = retval.date;
          this.waitlists[i].estimated_date_type = retval.date_type;
          this.waitlists[i].estimated_autocounter = retval.autoreq;
          this.waitlists[i].estimated_timeinmins = retval.time_inmins;
        }
        this.waitlists[i].cancelled_caption = retval.cancelled_caption;
        this.waitlists[i].cancelled_date = retval.cancelled_date;
        this.waitlists[i].cancelled_time = retval.cancelled_time;
        i++;
      }
      this.loadcomplete.waitlist = true;
    }, () => {
      this.loadcomplete.waitlist = true;
    }
    );
  }
  getAppxTime(waitlist) {
    const appx_ret = { 'caption': '', 'date': '', 'date_type': 'string', 'time': '', 'timenow': '', 'timeslot': '', 'autoreq': false, 'time_inmins': waitlist.appxWaitingTime, 'cancelled_time': '', 'cancelled_date': '', 'cancelled_caption': '' };
    if (waitlist.waitlistStatus !== 'cancelled') {
      if (waitlist.hasOwnProperty('serviceTime') || waitlist.calculationMode === 'NoCalc') {
        appx_ret.caption = 'Checked in for'; // 'Check-In Time';
        if (waitlist.calculationMode === 'NoCalc') {
          appx_ret.time = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
        } else {
          appx_ret.time = waitlist.serviceTime;
        }
        const waitlist_date = new Date(waitlist.date);
        const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
        const today = new Date(todaydt);
        today.setHours(0, 0, 0, 0);
        waitlist_date.setHours(0, 0, 0, 0);
        appx_ret.date = waitlist.date;
        appx_ret.date_type = 'date';
        appx_ret.timeslot = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
      } else {
        if (waitlist.appxWaitingTime === 0) {
          appx_ret.caption = this.estimatesmallCaption; // 'Estimated Time';
          appx_ret.time = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
          appx_ret.timenow = 'Now';
        } else if (waitlist.appxWaitingTime !== 0) {
          appx_ret.caption = this.estimatesmallCaption; // 'Estimated Time';
          appx_ret.date = '';
          appx_ret.time = this.dateTimeProcessor.convertMinutesToHourMinute(waitlist.appxWaitingTime);
          appx_ret.autoreq = true;
        }
      }
    } else {
      let time = [];
      let time1 = [];
      let t2;
      appx_ret.caption = 'Checked in for';
      appx_ret.date = waitlist.date;
      appx_ret.time = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
      appx_ret.cancelled_date = this.moment(waitlist.statusUpdatedTime, 'YYYY-MM-DD').format();
      time = waitlist.statusUpdatedTime.split('-');
      time1 = time[2].trim();
      t2 = time1.slice(2);
      appx_ret.cancelled_time = t2;
      appx_ret.cancelled_caption = 'Cancelled on ';
    }
    return appx_ret;
  }

  getApptlist() {
    this.loadcomplete.appointment = false;
    const params = { 'apptStatus-neq': 'failed,prepaymentPending' };
    this.subs.sink = this.consumerService.getApptlist(params)
      .subscribe(
        data => {
          this.appointments = data;
          console.log("appointments", this.appointments)
          const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
          const today = new Date(todaydt);
          let i = 0;
          let retval;
          for (const appointment of this.appointments) {
            const waitlist_date = new Date(appointment.appmtDate);
            today.setHours(0, 0, 0, 0);
            waitlist_date.setHours(0, 0, 0, 0);
            this.appointments[i].future = false;
            retval = this.getApptAppxTime(appointment);
            if (today.valueOf() < waitlist_date.valueOf()) {
              this.appointments[i].future = true;
              this.appointments[i].estimated_time = retval.time;
              this.appointments[i].estimated_timeslot = retval.timeslot;
              this.appointments[i].estimated_caption = retval.caption;
              this.appointments[i].estimated_date = retval.date;
              this.appointments[i].estimated_date_type = retval.date_type;
              this.appointments[i].estimated_autocounter = retval.autoreq;
            } else {
              this.appointments[i].estimated_time = retval.time;
              this.appointments[i].estimated_timeslot = retval.timeslot;
              this.appointments[i].estimated_caption = retval.caption;
              this.appointments[i].estimated_date = retval.date;
              this.appointments[i].estimated_date_type = retval.date_type;
              this.appointments[i].estimated_autocounter = retval.autoreq;
            }
            this.appointments[i].cancelled_caption = retval.cancelled_caption;
            this.appointments[i].cancelled_date = retval.cancelled_date;
            this.appointments[i].cancelled_time = retval.cancelled_time;
            i++;
          }
          this.loadcomplete.appointment = true;
        }, () => {
          this.loadcomplete.appointment = true;
        }
      );
  }

  getApptAppxTime(appointment) {
    const appx_ret = { 'caption': '', 'date': '', 'date_type': 'string', 'time': '', 'timeslot': '', 'autoreq': false, 'cancelled_time': '', 'cancelled_date': '', 'cancelled_caption': '' };
    if (appointment.apptStatus !== 'Cancelled' && appointment.apptStatus !== 'Rejected') {
      appx_ret.caption = 'Appointment for'; // 'Check-In Time';
      appx_ret.time = appointment.appmtTime;
      const waitlist_date = new Date(appointment.appmtDate);
      const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
      const today = new Date(todaydt);
      today.setHours(0, 0, 0, 0);
      waitlist_date.setHours(0, 0, 0, 0);
      appx_ret.date = appointment.appmtDate;
      appx_ret.date_type = 'date';
      appx_ret.timeslot = appointment.schedule.apptSchedule.timeSlots[0].sTime + ' - ' + appointment.schedule.apptSchedule.timeSlots[0].eTime;
    } else {
      let time = [];
      let time1 = [];
      let t2;
      appx_ret.caption = 'Appointment for';
      appx_ret.date = appointment.appmtDate;
      appx_ret.time = appointment.appmtTime;
      if (appointment.statusUpdatedTime) {
        appx_ret.cancelled_date = this.moment(appointment.statusUpdatedTime, 'YYYY-MM-DD').format();
        time = appointment.statusUpdatedTime.split('-');
        time1 = time[2].trim();
        t2 = time1.slice(2);
        appx_ret.cancelled_time = t2;
      }
      if (appointment.apptStatus === 'Rejected') {
        appx_ret.cancelled_caption = 'Rejected on ';
      } else {
        appx_ret.cancelled_caption = 'Cancelled on ';
      }
    }
    return appx_ret;
  }

  doCancelWaitlist(waitlist, type) {
    this.sharedService.doCancelWaitlist(waitlist, type, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist' && type === 'checkin') {
            this.today_totalbookings = [];
            this.future_totalbookings = [];
            this.todayBookings = [];
            this.todayBookings_more = [];
            this.futureBookings = [];
            this.futureBookings_more = [];
            this.appointmentslist = [];
            this.total_requests = [];
            this.apptRequests = [];
            this.moreApptRequest = [];
            this.getAppointmentToday();
            this.getAppointmentFuture();
            this.getApptRequests();
          } else if (data === 'reloadlist' && type === 'appointment') {
            this.today_totalbookings = [];
            this.future_totalbookings = [];
            this.todayBookings = [];
            this.todayBookings_more = [];
            this.futureBookings = [];
            this.futureBookings_more = [];
            this.appointmentslist = [];
            this.getAppointmentToday();
            this.getAppointmentFuture();
          }
        }, error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  goWaitlistDetail(waitlist) {
    this.router.navigate([this.customId, 'waitlist', waitlist.providerAccount.id, waitlist.ynwUuid]);
  }
  gotoAptmtReschedule(apptlist) {
    let queryParams = {
      uuid: apptlist.uid,
      type: 'reschedule',
      service_id: apptlist.service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'appointment'], navigationExtras);
  }
  gotoWaitlistReschedule(waitlist) {
    let queryParams = {
      uuid: waitlist.ynwUuid,
      type: 'waitlistreschedule',
      service_id: waitlist.service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'checkin'], navigationExtras);
  }

  addWaitlistMessage(waitlist, type?) {
    console.log("uuuiddd", waitlist);
    console.log("typeee", type);
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = waitlist.providerAccount.id;
    pass_ob['userId'] = waitlist.providerAccount.uniqueId;
    pass_ob['name'] = waitlist.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    if (type === 'appt') {
      pass_ob['appt'] = type;
      pass_ob['uuid'] = waitlist.uid;
    } else {
      pass_ob['uuid'] = waitlist.ynwUuid;
    }
    pass_ob['theme'] = this.theme;
    this.addNote(pass_ob);
  }

  addCommonMessage(provider) {
    const pass_ob = {};
    pass_ob['source'] = 'consumer-common';
    pass_ob['user_id'] = provider.id;
    pass_ob['name'] = provider.businessName;
    pass_ob['theme'] = this.theme;
    this.addNote(pass_ob);
  }

  addNote(pass_ob) {
    this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }

  handle_pageclick(pg) {
    this.pagination.startpageval = pg;
    // this.getHistroy();
  }

  setPaginationFilter() {
    const api_filter = {};
    api_filter['from'] = (this.pagination.startpageval) ? (this.pagination.startpageval - 1) * this.pagination.perPage : 0;
    api_filter['count'] = this.pagination.perPage;
    return api_filter;
  }

  providerDetail(provider, event) {
    this.router.navigate([this.customId]);
  }

  goCheckin(data, location, type) {
    let provider_data = null;
    if (type === 'fav_provider') {
      provider_data = data;
    } else {
      provider_data = data.provider || null;
    }
    let chdatereq;
    if (location['onlineCheckIn'] && location['isAvailableToday'] && location['availableToday']) {
      chdatereq = false;
    } else {
      chdatereq = false;
    }
    this.setCheckinData(provider_data, location, location['estimatedtime_det']['cdate'], chdatereq);
  }
  setCheckinData(provider, location, currdate, chdatereq = false) {
    let queryParams = {
      loc_id: location.id,
      sel_date: currdate,
      cur: chdatereq,
      tel_serv_stat: provider.virtulServiceStatus
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'checkin'], navigationExtras);
  }
  reloadAPIs() {
    this.getAppointmentToday();
    this.getAppointmentFuture();
    this.getApptRequests();
    this.reload_history_api = { status: true };
  }

  recheckwaitlistCounters() {
    if (this.waitlists && this.waitlists.length > 0) {
      for (let i = 0; i < this.waitlists.length; i++) {
        if (this.waitlists[i].estimated_autocounter) {
          if (this.waitlists[i].estimated_timeinmins > 0) {
            this.waitlists[i].estimated_timeinmins = (this.waitlists[i].estimated_timeinmins - 1);
            if (this.waitlists[i].estimated_timeinmins === 0) {
              this.waitlists[i].estimated_time = 'Now';
            } else {
              this.waitlists[i].estimated_time = this.dateTimeProcessor.convertMinutesToHourMinute(this.waitlists[i].estimated_timeinmins);
            }
          }
        }
      }
    }
  }
  btnJoinVideoClicked(checkin, event) {
    event.stopPropagation();
    if (checkin.videoCallButton && checkin.videoCallButton !== 'DISABLED') {
      if (checkin.uid) {
        this.router.navigate([this.customId, 'meeting', this.usr_details.primaryPhoneNumber, checkin.uid]);
      } else {
        this.router.navigate([this.customId, 'meeting', this.usr_details.primaryPhoneNumber, checkin.ynwUuid]);
      }
    } else {
      return false;
    }

  }
  getInvociesBybooking() {
    return new Promise((resolve, reject) => {
      this.consumerService.getInvoiceDetailsByuuid(this.uuid).subscribe(
        data => {
          resolve(data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          reject(error)
        }
      )
    })
  }
  goToInvoiceList() {
    return new Promise((resolve, reject) => {
      this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
        width: '50%',
        panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
        disableClose: true,
        autoFocus: true,
        data: this.allInvocies
      });
      this.addnotedialogRef.afterClosed().subscribe(result => {
        resolve(result);
      });
    })
  }
  viewBill(checkin, type, event) {
    event.stopPropagation();
    if (type === 'appointment') {
      this.uuid = checkin.uid;
      if (checkin.invoiceCreated) {
        this.getInvociesBybooking().then((data: any) => {

          this.allInvocies = data;

          if (this.allInvocies && this.allInvocies.length === 1) {
            let queryParams = {
              uuid: checkin.uid,
              type: 'appointment',
              'paidStatus': false,
              invoiceInfo: checkin.invoiceCreated,
              invoiceId: this.allInvocies[0].invoiceUid
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
          }
          else {

            this.goToInvoiceList().then((result: any) => {
              this.selectedInoviceId = result;
              if (this.selectedInoviceId) {
                let queryParams = {
                  uuid: checkin.uid,
                  type: 'appointment',
                  'paidStatus': false,
                  invoiceInfo: checkin.invoiceCreated,
                  invoiceId: this.selectedInoviceId
                }
                const navigationExtras: NavigationExtras = {
                  queryParams: queryParams
                };
                this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
              }
            });
          }
        })
      } else if (!checkin.invoiceCreated) {

        let queryParams = {
          uuid: checkin.uid,
          type: 'appointment',
          'paidStatus': false,
          invoiceInfo: checkin.invoiceCreated,
        }
        const navigationExtras: NavigationExtras = {
          queryParams: queryParams
        };
        this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
      }
    } else if (type === 'checkin') {
      this.uuid = checkin.ynwUuid;
      if (checkin.invoiceCreated) {
        this.getInvociesBybooking().then((data: any) => {
          this.allInvocies = data;
          if (this.allInvocies && this.allInvocies.length === 1) {
            let queryParams = {
              uuid: checkin.ynwUuid,
              type: 'waitlist',
              'paidStatus': false,
              invoiceInfo: checkin.invoiceCreated,
              invoiceId: this.allInvocies[0].invoiceUid
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
          }
          else {
            this.goToInvoiceList().then((result: any) => {
              this.selectedInoviceId = result;
              if (this.selectedInoviceId) {
                let queryParams = {
                  uuid: checkin.ynwUuid,
                  type: 'waitlist',
                  'paidStatus': false,
                  invoiceInfo: checkin.invoiceCreated,
                  invoiceId: this.selectedInoviceId
                }
                const navigationExtras: NavigationExtras = {
                  queryParams: queryParams
                };
                this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
              }
            });
          }
        })
      } else if (!checkin.invoiceCreated) {
        let queryParams = {
          uuid: checkin.ynwUuid,
          type: 'waitlist',
          'paidStatus': false,
          invoiceInfo: checkin.invoiceCreated,
        }
        const navigationExtras: NavigationExtras = {
          queryParams: queryParams
        };
        this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
      }
    }
  }
  getMapUrl(latitude, longitude) {
    const mapurl = projectConstantsLocal.MAP_BASE_URL + latitude + ',' + longitude + '/@' + latitude + ',' + longitude + ',15z';
    return mapurl;
  }
  rateService(waitlist, type) {
    this.ratedialogRef = this.dialog.open(ConsumerRateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': waitlist,
        'isFrom': type,
        'theme': this.theme
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist' && type === 'checkin') {
        this.getWaitlist();
      } else if (result === 'reloadlist' && type === 'appointment') {
        this.getApptlist();
      }
    });
  }
  makeFailedPayment(waitlist) {
    this.router.navigate([this.customId, 'checkin', 'payment', waitlist.ynwUuid]);
  }
  makeApptFailedPayment(waitlist) {
    this.router.navigate([this.customId, 'appointment', 'payment', waitlist.uid]);
  }
  goAppointment(data, location, type) {
    this.futureAllowed = true;
    let provider_data = null;
    if (type === 'fav_provider') {
      provider_data = data;
    } else {
      provider_data = data.provider || null;
    }
    let chdatereq;
    if (location.todayAppt && location['apptAvailableToday']) {
      chdatereq = false;
    } else {
      chdatereq = true;
    }
    if (!location.futureAppt) {
      this.futureAllowed = false;
    }
    this.setAppointmentData(provider_data, location, location['estimatedtime_det']['cdate'], chdatereq);
  }
  setAppointmentData(provider, location, currdate, chdatereq = false) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        loc_id: location.id,
        sel_date: currdate,
        cur: chdatereq,
        tel_serv_stat: provider.virtulServiceStatus,
        futureAppt: this.futureAllowed
      }
    };
    this.router.navigate([this.customId, 'appointment'], navigationExtras);
  }
  gotoHistory() {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        is_orderShow: 'false'
      }
    };
    this.router.navigate([this.customId, 'history'],navigationExtras);
  }
  gotoApptmentHistory() {
    this.router.navigate([this.customId, 'appointment', 'history']);
  }
  getAppointmentToday() {
    let params = { 'apptStatus-neq': 'failed,prepaymentPending' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getAppointmentToday(params)
      .subscribe(
        data => {
          this.appointmentslist = data;
          this.appointments = [];
          this.appointments = this.appointmentslist;
          this.getWaitlist();
          this.getApptRequests();
        });
  }
  getAppointmentFuture() {
    let params = { 'apptStatus-neq': 'failed,prepaymentPending' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getAppointmentFuture(params)
      .subscribe(
        data => {
          this.future_appointments = data;
          this.getWaitlistFuture();
        });
  }
  getWaitlistFuture() {
    let params = { 'waitlistStatus-neq': 'failed,prepaymentPending' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getWaitlistFuture(params)
      .subscribe(
        data => {
          this.future_waitlists = data;
          this.future_totalbookings = this.future_waitlists.concat(this.future_appointments);
          this.loading = false;
          this.futureBookings = [];
          this.futureBookings_more = [];
          for (let i = 0; i < this.future_totalbookings.length; i++) {
            if (i <= 2) {
              this.futureBookings.push(this.future_totalbookings[i]);
            } else {
              this.futureBookings_more.push(this.future_totalbookings[i]);
            }
          }
        });
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  getMeetingDetails(details, source) {
    const passData = {
      'type': source,
      'details': details,
      'theme': this.theme
    };
    this.addnotedialogRef = this.dialog.open(MeetingDetailsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: passData
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
    });
  }

  showMoreTdyBookings() {
    this.more_tdybookingsShow = true;
  }
  showlessTdyBookings() {
    this.more_tdybookingsShow = false;
  }
  showMoreFutrBookings() {
    this.more_futrbookingsShow = true;
  }
  showlessFutrBookings() {
    this.more_futrbookingsShow = false;
  }
  showMoreRequest() {
    this.more_requestShow = true;
  }
  showLessRequest() {
    this.more_requestShow = false;
  }
  stopprop(event) {
    event.stopPropagation();
  }
  getTimeToDisplay(min) {
    return this.dateTimeProcessor.convertMinutesToHourMinute(min);
  }
  viewprescription(checkin) {
    console.log("Checkin:", checkin);
    this.viewrxdialogRef = this.dialog.open(ViewRxComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: {
        theme: this.theme,
        accencUid: checkin.prescShortUrl ? (window.location.origin + checkin.prescShortUrl) : checkin.prescUrl
      }
    });
  }
  getBookingStatusClass(status) {
    const retdet = this.bookingStatusClasses.filter(
      soc => soc.value === this.wordProcessor.firstToUpper(status));
    if (retdet[0]) {
      return retdet[0].class;
    } else {
      return '';
    }
  }
  sendAttachment(booking, type) {
    console.log(booking);
    console.log(type);
    const pass_ob = {};
    pass_ob['user_id'] = booking.providerAccount.id;
    if (type === 'appt') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.uid;
    } else if (type === 'checkin') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.ynwUuid;
    } else {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.uid;
    }
    this.addattachment(pass_ob);
  }

  addattachment(pass_ob) {
    console.log(pass_ob);
    this.galleryDialog = this.dialog.open(GalleryImportComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: {
        source_id: 'consumerimages',
        accountId: pass_ob.user_id,
        uid: pass_ob.uuid,
        type: pass_ob.type,
        theme: this.theme
      }
    });
    this.galleryDialog.afterClosed().subscribe(result => {
      this.reloadAPIs();
    });
  }
  viewAttachment(booking, type) {
    if (type === 'appt') {
      console.log(type);
      this.subs.sink = this.consumerService.getAppointmentAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
        (communications: any) => {
          console.log("Communicaitons:", communications);
          this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
            width: '50%',
            panelClass: ['popup-class', 'commonpopupmainclass'],
            disableClose: true,
            data: {
              attachments: communications,
              type: 'appt',
              theme: this.theme
            }
          });
          this.showattachmentDialogRef.afterClosed().subscribe(result => {
            if (result === 'reloadlist') {
            }
          });
        });
    } else if (type === 'checkin') {
      this.subs.sink = this.consumerService.getWaitlistAttachmentsByUuid(booking.ynwUuid, booking.providerAccount.id).subscribe(
        (communications: any) => {
          this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
            width: '50%',
            panelClass: ['popup-class', 'commonpopupmainclass'],
            disableClose: true,
            data: {
              attachments: communications,
              type: 'checkin',
              theme: this.theme
            }
          });
          this.showattachmentDialogRef.afterClosed().subscribe(result => {
            if (result === 'reloadlist') {
            }
          });
        });
    }
  }
  gotoQuestionnaire(booking) {
    console.log(booking);
    let uuid;
    let type;
    if (booking.waitlistingFor) {
      uuid = booking.ynwUuid;
      type = 'consCheckin';
    } else {
      uuid = booking.uid;
      type = 'consAppt';
    }
    const navigationExtras: NavigationExtras = {
      queryParams: {
        uuid: uuid,
        providerId: booking.providerAccount.id,
        type: type
      }
    };
    this.router.navigate([this.customId, 'questionnaire'], navigationExtras);
  }

  cardClicked(actionObj) {
    console.log(actionObj);
    switch (actionObj['type']) {
      case 'appt':
        this.performApptActions(actionObj['action'], actionObj['booking'], actionObj['event'], actionObj['timetype']);
        break;
      case 'wl':
        this.performWLActions(actionObj['action'], actionObj['booking'], actionObj['event'], actionObj['timetype']);
        break;
    }
  }
  performWLActions(actionString, booking, event, timetype) {
    switch (actionString) {
      case 'details':
        this.showBookingDetails(booking, timetype);
        break;
      case 'reschedule':
        this.gotoWaitlistReschedule(booking);
        break;
      case 'rating':
        this.rateService(booking, 'checkin');
        break;
      case 'cancel':
        this.doCancelWaitlist(booking, 'checkin');
        break;
      case 'communicate':
        this.addWaitlistMessage(booking);
        break;
      case 'sendAttachment':
        this.sendAttachment(booking, 'checkin');
        break;
      case 'viewAttachment':
        this.viewAttachment(booking, 'checkin');
        break;
      case 'meetingDetails':
        this.getMeetingDetails(booking, 'waitlist');
        break;
      case 'moreInfo':
        this.gotoQuestionnaire(booking);
        break;
      case 'viewPrescription':
        this.viewprescription(booking);
        break;
      case 'viewBill':
        this.viewBill(booking, 'checkin', event);
        break;
      case 'joinVideo':
        this.btnJoinVideoClicked(booking, event);
        break;
      case 'providerDetails':
        this.providerDetail(booking.providerAccount, event);
        break;
    }
  }
  performApptActions(actionString, booking, event, timetype) {
    switch (actionString) {
      case 'details':
        this.showBookingDetails(booking, timetype);
        break;
      case 'reschedule':
        this.gotoAptmtReschedule(booking);
        break;
      case 'rating':
        this.rateService(booking, 'appointment');
        break;
      case 'cancel':
        this.doCancelWaitlist(booking, 'appointment');
        break;
      case 'communicate':
        this.addWaitlistMessage(booking, 'appt');
        break;
      case 'sendAttachment':
        this.sendAttachment(booking, 'appt');
        break;
      case 'viewAttachment':
        this.viewAttachment(booking, 'appt');
        break;
      case 'meetingDetails':
        this.getMeetingDetails(booking, 'appt');
        break;
      case 'moreInfo':
        this.gotoQuestionnaire(booking);
        break;
      case 'viewPrescription':
        this.viewprescription(booking);
        break;
      case 'viewBill':
        this.viewBill(booking, 'appointment', event);
        break;
      case 'joinVideo':
        this.btnJoinVideoClicked(booking, event);
        break;
      case 'providerDetails':
        this.providerDetail(booking.providerAccount, event);
        break;
    }
  }
  gotoDetails() {
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log(source);
    if (source) {
      window.location.href = source;
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      this.lStorageService.removeitemfromLocalStorage('source');
    } else {
      this.router.navigate([this.customId]);
    }
  }
  closeModal() {
    this.popUp.nativeElement.style.display = 'none';
  }

  // getTdyOrder() {
  //   this.orders = [];
  //   this.total_tdy_order = [];
  //   this.todayOrderslst = [];
  //   this.todayOrderslst_more = [];
  //   this.tDate = this.dateTimeProcessor.transformToYMDFormat(this.todayDate);
  //   const params = {
  //     'orderDate-eq': this.tDate,
  //     'account-eq': this.accountId
  //   };
  //   this.subs.sink = this.consumerService.getConsumerOrders(params).subscribe(data => {
  //     console.log("Orders:", data);
  //     this.orders = data; // saving todays orders
  //     console.log('orders' + JSON.stringify(this.orders));
  //     this.total_tdy_order = this.orders;
  //     if (data) {
  //       this.getFutureOrder();
  //     }
  //     // show more
  //     this.todayOrderslst = [];
  //     this.todayOrderslst_more = [];
  //     for (let i = 0; i < this.total_tdy_order.length; i++) {
  //       if (i <= 2) {
  //         this.todayOrderslst.push(this.total_tdy_order[i]);
  //       } else {
  //         this.todayOrderslst_more.push(this.total_tdy_order[i]);
  //       }
  //     }
  //   });
  // }

  initMyOrders() {
    // this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    this.loading = true;
    this.api_loading = true;
    let filters = {
      'accountId-eq': this.accountId,
      'orderStatus-eq': 'ORDER_CONFIRMED,ORDER_COMPLETED,ORDER_CANCELED'
    };
    this.subs.sink = this.orderService.getOrders(filters).subscribe((orders: any) => {
      this.myOrders = orders;
      this.loading = false;
      this.api_loading = false;
      // this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
    });
  }

  showMoreTdyOrders() {
    this.more_tdyOrdersShow = true;
  }
  showlessTdyOrders() {
    this.more_tdyOrdersShow = false;
  }
  showMoreFutOrders() {
    this.more_futrOrdersShow = true;
  }
  showlessFutOrders() {
    this.more_futrOrdersShow = false;
  }
  showOrders() {
    this.showOrder = true;
    this.initMyOrders();
    // this.lStorageService.setitemonLocalStorage('orderStat', true);
  }
  showBookings() {
    this.showOrder = false;
    // this.lStorageService.setitemonLocalStorage('orderStat', false);
  }

  showMore() {
    if (this.myOrders.length > this.limit) {
      this.orderLimit = this.myOrders.length;
    }
  }

  showLess() {
    if (this.myOrders.length > this.limit) {
      this.orderLimit = this.limit;
    }
  }
  showOrderDetails(order) {
    let queryParams = {};
    queryParams['uuid'] = order.uid;
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'orderdetails'], navigationExtras);
    this.accountService.sendMessage({ ttype: 'hideItemSearch', value: 0 });
  }
  setOrderStatus(original) {
    let modifiedStr = original.replace(/_/g, ' ');
    return modifiedStr
  }
}
