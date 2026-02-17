import { AfterViewInit, Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AccountService, AuthService, BookingService, ConsumerService, DateTimeProcessor, ErrorMessagingService, GroupStorageService, JGalleryService, LocalStorageService, Messages, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { AddInboxMessagesComponent } from '../../shared/add-inbox-messages/add-inbox-messages.component';
import { MeetingDetailsComponent } from '../../shared/meeting-details/meeting-details.component';
import { ViewRxComponent } from '../../shared/view-rx/view-rx.component';
import { InvoiceListComponent } from '../../shared/invoice-list/invoice-list.component';
import { RateServicePopupComponent } from '../../shared/rate-service-popup/rate-service-popup';
import { TeleBookingService } from '../../shared/tele-bookings-service';
import { GalleryImportComponent } from '../../shared/gallery/import/gallery-import.component';
import { AttachmentPopupComponent } from '../../shared/attachment-popup/attachment-popup.component';
import { GalleryService } from '../../shared/gallery/galery-service';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit, OnDestroy, AfterViewInit {
  basicProfile: any = {};
  templateJson: any;
  locationjson: any;
  showDepartments: any;
  terminologiesjson: any;
  apptSettings: any;
  accountProfile: any;
  donationServices: any;
  selectedLocation: any;
  accountConfig: any;
  loaded_donations = false;
  loaded_orders = false;
  loaded_appointments = false;
  loaded_checkins = false;
  donationServicesJson: any;
  apptServices: any = [];
  checkinServices: any = [];
  comingSoonCards: any[] = [];
  blogFilters: Array<{ key: string; label: string }> = [];
  blogPosts: any[] = [];
  filteredBlogs: any[] = [];
  activeBlogFilter = 'all';
  s3CouponList: any = {
    JC: [], OWN: []
  };
  filteredApptServices: any;
  filteredCheckinServices: any;
  departments: any;
  galleryJson: any;
  onlineUsers: any;
  settings: any;
  waitlisttime_arr: any = [];
  appttime_arr: any = [];
  deptUsers: any;
  selectedIndex;
  nextavailableCaption = Messages.NXT_AVAILABLE_TIME_CAPTION;
  account: any;
  theme: any;
  extras: any = {
    'enquiry': true,
    'share': false,
    'icons': true,
    'more': true
  };
  today_totalbookings: any[] = [];
  future_totalbookings: any[] = [];
  todayBookings: any[] = [];
  futureBookings: any[] = [];
  private todaysAppointments: any[] = [];
  private todaysWaitlists: any[] = [];
  private futureAppointments: any[] = [];
  private futureWaitlists: any[] = [];
  bgCover: any;
  serverDate: any;
  callback: any;
  accountId: any;
  users_loaded: boolean;
  smallDevice: boolean;
  bookingsLimit = 2;
  blogs: any = [];
  videos: any = [];
  image_list_popup: any = [];
  private subscriptions: Subscription = new Subscription();
  heroSection: any;
  blogConfig: any;
  assetBasePath = '{{ASSET_BASE_PATH}}';
  homeDesign: any = {};
  categories: any[] = [];
  visibleCategories: any[] = [];
  preBookingCollection: any[] = [];
  visiblePreBookingCollection: any[] = [];
  reels: any[] = [];
  visibleReels: any[] = [];
  newArrivals: any[] = [];
  visibleNewArrivals: any[] = [];
  customerReviews: any[] = [];
  visibleCustomerReviews: any[] = [];
  socialLinks: any[] = [];
  footerColumns: any[] = [];
  selectedCatalogs: any[] = [];
  activeReviewIndex = 0;
  readonly reelsBatchSize = 4;
  readonly listBatchSize = 4;
  brandName = 'Kanishta';
  logoUrl = '';
  private sectionObserver: IntersectionObserver | null = null;
  notificationdialogRef;
  addnotedialogRef;
  checkindialogRef;
  ratedialogRef;
  privacydialogRef;
  canceldialogRef;
  viewrxdialogRef;
  allInvocies: any;
  galleryDialog: any;
  showattachmentDialogRef: MatDialogRef<unknown, any>;
  nextBooking: any = null;
  nextBookingType: 'today' | 'future' | null = null;
  constructor(
    private accountService: AccountService,
    private consumerService: ConsumerService,
    private bookingService: BookingService,
    private dateTimeProcessor: DateTimeProcessor,
    private authService: AuthService,
    private dialog: MatDialog,
    private lStorageService: LocalStorageService,
    private router: Router,
    public translate: TranslateService,
    private activatedRoute: ActivatedRoute,
    private subscriptionService: SubscriptionService,
    private sharedService: SharedService,
    private jGalleryService: JGalleryService,
    private galleryService: GalleryService,
    private errorService: ErrorMessagingService,
    private toastService: ToastService,
    private teleService: TeleBookingService,
    private groupService: GroupStorageService
  ) {
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.subscriptions.add(this.activatedRoute.queryParams.subscribe(qparams => {
      console.log("QParams :", qparams)
      if (qparams && qparams['callback']) {
        this.callback = qparams['callback'];
      }
      this.subscriptions.add(this.subscriptionService.getMessage().subscribe(
        (response) => {
          if (response.ttype === 'locationChanged') {
            this.changeLocation(this.accountService.getActiveLocation());
          }
        }));
    }));
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
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
      this.sectionObserver = null;
    }
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.settings = this.sharedService.getJson(this.account['settings']);
    this.showDepartments = this.settings.filterByDept;
    this.apptSettings = this.sharedService.getJson(this.account['appointmentsettings']);
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.donationServicesJson = this.sharedService.getJson(this.account['donationServices']);
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.terminologiesjson = this.account['terminologies'];
    this.setBasicProfile();
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.deptUsers = this.sharedService.getJson(this.account['departmentProviders']);
    if (this.showDepartments) {
      this.setDepartments(this.deptUsers);
    }
    this.selectedLocation = this.accountService.getActiveLocation();
    this.templateJson = this.sharedService.getTemplateJSON();
    this.selectedCatalogs = this.templateJson?.extras?.selectedCatalogs || [];

    let notification = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('appNotification'));

    // let isFirstTime = this.lStorageService.getitemfromLocalStorage('dash_visible');
    // console.log("isFirstTime",isFirstTime)
    if (notification) {
      this.handleNotification(notification);
    } else {
      this.resumeLoadingHome();      
    }

  }
  ngAfterViewInit(): void {
    this.setupScrollReveal();
  }
  private fetchFutureAppointments() {
    const params: any = { 'apptStatus-neq': 'failed,prepaymentPending,Cancelled,Rejected' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    const sub = this.consumerService.getAppointmentFuture(params).subscribe((appointments) => {
      this.futureAppointments = Array.isArray(appointments) ? appointments : [];
      this.fetchFutureWaitlists();
    }, () => {
      this.futureAppointments = [];
      this.fetchFutureWaitlists();
    });
    this.subscriptions.add(sub);
  }
  private fetchFutureWaitlists() {
    const params: any = { 'waitlistStatus-neq': 'failed,prepaymentPending,cancelled' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    const sub = this.consumerService.getWaitlistFuture(params).subscribe((waitlists) => {
      this.futureWaitlists = Array.isArray(waitlists) ? waitlists : [];
      this.mergeFutureBookings();
    }, () => {
      this.futureWaitlists = [];
      this.mergeFutureBookings();
    });
    this.subscriptions.add(sub);
  }
  private mergeFutureBookings() {
    const combined = [...(this.futureAppointments || []), ...(this.futureWaitlists || [])];
    const activeBookings = combined.filter(b => !this.isBookingCancelled(b) && !this.isBookingCompleted(b));
    this.future_totalbookings = activeBookings;
    this.futureBookings = activeBookings.slice(0, 3);
    this.updateNextBooking();
  }
  private resetTodayBookings() {
    this.todaysAppointments = [];
    this.todaysWaitlists = [];
    this.today_totalbookings = [];
    this.todayBookings = [];
  }
  private resetFutureBookings() {
    this.futureAppointments = [];
    this.futureWaitlists = [];
    this.future_totalbookings = [];
    this.futureBookings = [];
  }
  private loadTodayBookings() {
    this.authService.goThroughLogin().then((status) => {
      if (status) {
        this.fetchTodayAppointments();
      } else {
        this.resetTodayBookings();
      }
    }).catch(() => {
      this.resetTodayBookings();
    });
  }
  private loadFutureBookings() {
    this.authService.goThroughLogin().then((status) => {
      if (status) {
        this.fetchFutureAppointments();
      } else {
        this.resetFutureBookings();
      }
    }).catch(() => {
      this.resetFutureBookings();
    });
  }
  private fetchTodayAppointments() {
    const params: any = { 'apptStatus-neq': 'failed,prepaymentPending,Cancelled,Rejected' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    const sub = this.consumerService.getAppointmentToday(params).subscribe((appointments) => {
      this.todaysAppointments = Array.isArray(appointments) ? appointments : [];
      this.fetchTodayWaitlists();
    }, () => {
      this.todaysAppointments = [];
      this.fetchTodayWaitlists();
    });
    this.subscriptions.add(sub);
  }
  private fetchTodayWaitlists() {
    const today = this.serverDate ? new Date(this.serverDate.split(' ')[0]) : new Date();
    const params: any = {
      'waitlistStatus-neq': 'failed,prepaymentPending,cancelled',
      'date-eq': this.dateTimeProcessor.transformToYMDFormat(today)
    };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    const sub = this.consumerService.getWaitlist(params).subscribe((waitlists) => {
      this.todaysWaitlists = Array.isArray(waitlists) ? waitlists : [];
      this.mergeTodayBookings();
    }, () => {
      this.todaysWaitlists = [];
      this.mergeTodayBookings();
    });
    this.subscriptions.add(sub);
  }
  private mergeTodayBookings() {
    const combined = [...(this.todaysAppointments || []), ...(this.todaysWaitlists || [])];
    const activeBookings = combined.filter(b => !this.isBookingCancelled(b) && !this.isBookingCompleted(b));
    this.today_totalbookings = activeBookings;
    this.todayBookings = activeBookings.slice(0, 3);
    this.updateNextBooking();
  }

  setDepartments(depts) {
    let departmentsS3 = [];
    let checkinServices = this.sharedService.getJson(this.account['services']);
    let apptServices = this.sharedService.getJson(this.account['apptServices']);
    for (let dIndex = 0; dIndex < depts.length; dIndex++) {
      let curDeptServices = [];
      if (checkinServices && checkinServices.length > 0) {
        curDeptServices = checkinServices.filter(dept => (depts[dIndex].departmentId === dept.departmentId && dept.services.length > 0));
      }
      if (curDeptServices.length === 0 && apptServices && apptServices.length > 0) {
        curDeptServices = apptServices.filter(dept => (depts[dIndex].departmentId === dept.departmentId && dept.services.length > 0));
      }
      if ((depts[dIndex] && depts[dIndex].users.length > 0) || curDeptServices.length > 0) {
        departmentsS3.push({ 'type': 'department', 'item': depts[dIndex] });
      }
    }
    this.departments = departmentsS3;
  }
  setJaldeeCoupons(res) {
    if (res !== undefined) {
      this.s3CouponList.JC = res;
    } else {
      this.s3CouponList.JC = [];
    }
    this.extras['coupons'] = this.s3CouponList;
  }
  setAccountCoupons(res) {
    if (res !== undefined) {
      this.s3CouponList.OWN = res;
    } else {
      this.s3CouponList.OWN = [];
    }
    this.extras['coupons'] = this.s3CouponList;
  }
  menuSelected(section) {
    console.log(section.title);
    if (section.type !== 'action') {
      this.selectedIndex = section.title;
      this.lStorageService.setitemonLocalStorage('tabIndex', this.selectedIndex);
    } else {
      console.log(section.link);
      const link = this.resolveSectionLink(section);
      let url = this.sharedService.getRouteID() + '/' + link;
      console.log("Url:", url);

      this.router.navigateByUrl(url);
    }
  }
  quickActionPerformed(action) {
    if (action['key']) {
      this.selectedIndex = action['key'];
      this.lStorageService.setitemonLocalStorage('tabIndex', this.selectedIndex);
      if (action['target']) {
        let e1 = '#' + action['target'];
        setTimeout(() => {
          document.querySelector(e1).scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    }
  }
  cardActionPerformed(action) {
    if (action.link && action.link.startsWith('http')) {
      window.open(action.link, "_system");
    } else if (action.link) {
      const link = this.resolveSectionLink(action);
      let url = this.sharedService.getRouteID() + '/' + link;
      console.log("Url:", url);
      this.router.navigateByUrl(url);
    } else if (action.type === 'menu') {
      this.actionPerformed(action);
    }
  }

  private resolveSectionLink(section: any): string {
    const rawLink = (section?.link || '').toString().replace(/^\/+|\/+$/g, '');
    const normalizedLink = rawLink.toLowerCase();
    const title = (section?.title || '').toString().toLowerCase();
    const routeAliasMap: { [key: string]: string } = {
      paboutus: 'about',
      aboutus: 'about',
      pfaq: 'faq',
      psupport: 'support'
    };
    if (routeAliasMap[normalizedLink]) {
      return routeAliasMap[normalizedLink];
    }
    const isOrderHistoryTitle =
      title.includes('order history') || title.includes('my orders') || title === 'orders';
    if (isOrderHistoryTitle && (normalizedLink === 'dashboard' || normalizedLink === 'bookings')) {
      return 'orders';
    }
    return rawLink;
  }

  onViewAllBookings() {
    this.router.navigate([this.sharedService.getRouteID(), 'bookings']);
  }

  updateNextBooking() {
    const nowTs = this.getCurrentTimestamp();
    const candidates: Array<{ booking: any; type: 'today' | 'future'; ts: number }> = [];

    for (const booking of this.today_totalbookings || []) {
      if (this.isBookingCancelled(booking) || this.isBookingCompleted(booking)) { continue; }
      const ts = this.getBookingTimestamp(booking);
      if (Number.isFinite(ts)) { candidates.push({ booking, type: 'today', ts }); }
    }
    for (const booking of this.future_totalbookings || []) {
      if (this.isBookingCancelled(booking) || this.isBookingCompleted(booking)) { continue; }
      const ts = this.getBookingTimestamp(booking);
      if (Number.isFinite(ts)) { candidates.push({ booking, type: 'future', ts }); }
    }

    const upcoming = candidates.filter(c => c.ts >= nowTs);
    const pool = upcoming.length ? upcoming : [];

    if (!pool.length) {
      this.nextBooking = null;
      this.nextBookingType = null;
      return;
    }

    pool.sort((a, b) => a.ts - b.ts);
    const next = pool[0];
    this.nextBooking = next.booking;
    this.nextBookingType = next.type;
  }

  isBookingCancelled(booking: any): boolean {
    const status = (booking?.apptStatus || booking?.waitlistStatus || '').toString().toLowerCase();
    return status === 'cancelled' || status === 'canceled';
  }

  isBookingCompleted(booking: any): boolean {
    const status = (booking?.apptStatus || booking?.waitlistStatus || '').toString().toLowerCase();
    return status === 'completed';
  }

  private getBookingTimestamp(booking: any): number {
    const dateStr = booking?.appmtDate || booking?.date;
    if (!dateStr) { return Number.POSITIVE_INFINITY; }

    const timeCandidate = booking?.appmtTime || booking?.apptTime || booking?.queue?.queueStartTime || booking?.serviceTime;
    const startTime = (timeCandidate || '').split('-')[0]?.trim();
    const composed = startTime ? `${dateStr} ${startTime}` : `${dateStr} 00:00`;
    const ts = new Date(composed).getTime();
    return Number.isFinite(ts) ? ts : Number.POSITIVE_INFINITY;
  }

  hasMultipleActiveBookings(): boolean {
    const activeBookings = [
      ...(this.today_totalbookings || []),
      ...(this.future_totalbookings || [])
    ].filter(b => !this.isBookingCancelled(b) && !this.isBookingCompleted(b));
    return activeBookings.length > 1;
  }

  private getCurrentTimestamp(): number {
    const ts = this.serverDate ? new Date(this.serverDate).getTime() : Date.now();
    return Number.isFinite(ts) ? ts : Date.now();
  }

  showBookingDetails(booking: any, type?: 'today' | 'future') {
    const queryParams: any = { type, from: 'root' };
    if (booking?.apptStatus) {
      // queryParams['uuid'] = booking.uid;
      // this.router.navigate([ 'apptdetails'], { queryParams });
      // this.router.navigate([this.sharedService.getRouteID(), 'booking/', booking.uid]);
      let bookingID = booking.apptStatus ? booking.uid : booking.uid;
      const navigationExtras: NavigationExtras = { queryParams };
      this.router.navigate([this.sharedService.getRouteID(), 'booking', bookingID], navigationExtras);
    }
    // } else if (booking?.waitlistStatus) {
    //   queryParams['uuid'] = booking.ynwUuid;
    //   this.router.navigate([ 'checkindetails'], { queryParams });
    // }
  }

  // cardClicked(actionObj) {
  //   actionObj?.event?.stopPropagation?.();
  //   this.onViewAllBookings();
  // }
  bookingDetails(booking) {
    console.log("booking" + booking);

    let bookingID = booking.apptStatus ? booking.uid : booking.uid;
    const navigationExtras: NavigationExtras = {
      queryParams: { from: 'root' }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'booking', bookingID], navigationExtras);
  }
  rescheduleBooking(booking) {
    let bookingID = booking.apptStatus ? booking.uid : booking.uid;
    let queryParams = {
      uuid: bookingID,
      type: 'reschedule',
      service_id: booking.service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    let routePath = booking.apptStatus ? 'appointment' : 'checkin';
    this.router.navigate([this.sharedService.getRouteID(), routePath], navigationExtras);
  }
  rateService(booking) {
    let bookingType = booking.apptStatus ? 'appointment' : 'checkin';
    this.ratedialogRef = this.dialog.open(RateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': booking,
        'isFrom': bookingType,
        'theme': this.theme
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      // this.bookingTitleChanged(this.bookingTitle);

    });
  }
  doCancelWaitlist(booking) {
    const _this = this;
    let bookingType = booking.apptStatus ? 'appointment' : 'checkin';
    this.bookingService.doCancelWaitlist(booking, bookingType, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist') {
             _this.loadTodayBookings();
            _this.loadFutureBookings();
          }
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
  }
  addWaitlistMessage(booking, type?) {
    let bookingID = booking.apptStatus ? booking.uid : booking.uid;
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = booking.providerAccount.id;
    pass_ob['userId'] = booking.providerAccount.uniqueId;
    pass_ob['name'] = booking.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    pass_ob['uuid'] = bookingID;
    pass_ob['theme'] = this.theme;
    if (type === 'appt') {
      pass_ob['appt'] = type;
    }
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
      // this.reloadAPIs();
    });
  }
  getAttachments(booking) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (booking.apptStatus) {
        _this.bookingService.getAppointmentAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
          (attachments: any) => {
            resolve(attachments);
          }, (error) => { reject(error) });
      } else {
        _this.bookingService.getWaitlistAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
          (attachments: any) => {
            resolve(attachments);
          }, (error) => { reject(error) });
      }
    })
  }
  viewAttachment(booking, bookingType) {
    const _this = this;
    this.getAttachments(booking).then((attachments: any) => {
      _this.showattachmentDialogRef = _this.dialog.open(AttachmentPopupComponent, {
        width: '50%',
        panelClass: ['popup-class', 'commonpopupmainclass'],
        disableClose: true,
        data: {
          attachments: attachments,
          type: bookingType,
          theme: this.theme
        }
      });
      _this.showattachmentDialogRef.afterClosed().subscribe(result => {
        if (result === 'reloadlist') {
        }
      });
    }).catch((error) => {
      let errorObj = _this.errorService.getApiError(error);
      _this.toastService.showError(errorObj);
    })
  }
  cardClicked(actionObj) {
    console.log("ACtion Obj:", actionObj);
    let booking = actionObj['booking'];
    let action = actionObj['action'];
    let event = actionObj['event'];
    let bookingType = booking.apptStatus ? 'appt' : 'checkin';
    switch (action) {
      case 'details':
        this.bookingDetails(booking);
        break;
      case 'reschedule':
        this.rescheduleBooking(booking);
        break;
      case 'rating':
        this.rateService(booking);
        break;
      case 'cancel':
        this.doCancelWaitlist(booking);
        break;
      case 'communicate':
        this.addWaitlistMessage(booking, bookingType);
        break;
      case 'sendMessage':
        this.addWaitlistMessage(booking, bookingType);
        break;
      case 'sendAttachment':
        this.sendAttachment(booking, bookingType);
        break;
      case 'viewAttachment':
        this.viewAttachment(booking, bookingType);
        break;
      case 'meetingDetails':
        this.getMeetingDetails(booking);
        break;
      case 'moreInfo':
        this.gotoQuestionnaire(booking);
        break;
      case 'viewPrescription':
        this.viewprescription(booking);
        break;
      case 'viewBill':
        this.viewBill(booking, event);
        break;
      case 'joinVideo':
        this.btnJoinVideoClicked(booking, event);
        break;
      case 'providerDetails':
        this.providerDetail();
        break;
    }
  }
  btnJoinVideoClicked(booking, event) {
    event.stopPropagation();
    let activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
    let bookingID = booking.apptStatus ? booking.appointmentEncId : booking.checkinEncId;
    if (booking.videoCallButton && booking.videoCallButton !== 'DISABLED') {
      this.router.navigate([this.sharedService.getRouteID(), 'meeting', activeUser.primaryPhoneNumber, bookingID]);
    }
    return false;
  }

  getBookingInvoices(accId, bookingID) {
    return new Promise((resolve, reject) => {
      this.teleService.getInvoiceDetailsByuuid(accId, bookingID).subscribe(
        (invoices: any) => {
          resolve(invoices);
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
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
  selectInvoiceFromList(invoices: any) {
    return new Promise((resolve, reject) => {
      this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
        width: '50%',
        panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
        disableClose: true,
        autoFocus: true,
        data: invoices
      });
      this.addnotedialogRef.afterClosed().subscribe(invoiceID => {
        resolve(invoiceID);
      });
    })
  }
  viewBill(booking, event) {
    event.stopPropagation();
    let bookingID = booking.apptStatus ? booking.uid : booking.uid;
    let qParams = {
      paidInfo: false
    }
    console.log("Booking Info:", booking);
    if (booking.invoiceCreated) {
      this.getBookingInvoices(booking.providerAccount.id, bookingID).then((invoices: any) => {
        console.log("Invoices:", invoices);
        if (invoices) {
          if (invoices && invoices.length == 1) {
            qParams['invoiceId'] = invoices[0].uid;
            this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
          } else {
            this.selectInvoiceFromList(invoices).then((invoiceID) => {
              if (invoiceID) {
                qParams['invoiceId'] = invoiceID;
                this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
              }
            })
          }
        }
      })
    } else {
      let queryParams = {
        paidStatus: false
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], navigationExtras);
    }
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
    this.router.navigate([this.sharedService.getRouteID(), 'questionnaire'], navigationExtras);
  }
  getMeetingDetails(booking) {
    let bookingSource = booking.apptStatus ? 'appt' : 'waitlist';
    const passData = {
      'type': bookingSource,
      'details': booking,
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
  providerDetail() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }
  gotoDetails() {
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log(source);
    if (source) {
      window.location.href = source;
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      this.lStorageService.removeitemfromLocalStorage('source');
    } else {
      this.router.navigate([this.sharedService.getRouteID()]);
    }
  }
  setBasicProfile() {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = this.accountProfile['businessName'];
    if (this.accountProfile['businessUserName']) {
      this.basicProfile['businessUserName'] = this.accountProfile['businessUserName'];
    }
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.basicProfile['cover'] = this.bgCover;
    if (this.accountProfile.emails) {
      this.basicProfile['emails'] = this.accountProfile.emails;
    }
    if (this.accountProfile.phoneNumbers) {
      this.basicProfile['phoneNumbers'] = this.accountProfile.phoneNumbers;
    }
    if (this.accountProfile.baseLocation) {
      this.basicProfile['baseLocation'] = this.accountProfile.baseLocation;
    }
    this.basicProfile['logo'] = this.accountProfile.logo?.url;
    this.basicProfile['socialMedia'] = this.accountProfile.socialMedia;
  }
  changeLocation(loc: any) {
    const _this = this;
    this.selectedLocation = loc;
    if (this.templateJson.section1.appointments || this.templateJson.section2.appointments || this.templateJson.section3.appointments) {
      this.getAppointmentServices(this.selectedLocation.id);
    }
    if (this.templateJson.section1.checkins || this.templateJson.section2.checkins || this.templateJson.section3.checkins) {
      this.getCheckinServices(this.selectedLocation.id);
    }
    if (this.templateJson.section1.users || this.templateJson.section2.users || this.templateJson.section3.users) {
      if (this.deptUsers && this.deptUsers.length > 0) {
        this.users_loaded = false;
        this.getUsersByLocation().then((response: any) => {
          _this.deptUsers = _this.sharedService.getJson(response['departmentProviders']);
          _this.setUserWaitTime();
        })
      }
    }
  }
  getUsersByLocation() {
    const _this = this;
    return new Promise(function (resolve) {
      _this.consumerService.getUsersByLocation(_this.selectedLocation.id, _this.accountProfile.uniqueId, 'departmentProviders').subscribe(
        (users) => {
          resolve(users);
        }, () => {
          resolve([]);
        })
    })
  }
  setUserWaitTime() {
    let apptTimearr = [];
    let waitTimearr = [];
    if (this.deptUsers && this.deptUsers.length > 0) {
      for (let user of this.deptUsers) {
        apptTimearr.push({ 'locid': this.accountProfile.id + '-' + this.selectedLocation.id + '-' + user.id });
        waitTimearr.push({ 'locid': user.id + '-' + this.selectedLocation.id });
      }
    }
    this.getUserApptTime(apptTimearr, waitTimearr);
  }
  getAvailableSlot(slots) {
    let slotAvailable = '';
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].active) {
        slotAvailable = this.getSingleTime(slots[i].time);
        break;
      }
    }
    return slotAvailable;
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  getUserApptTime(provids_locid, waitTimearr) {
    if (provids_locid.length > 0) {
      const post_provids_locid: any = [];
      for (let i = 0; i < provids_locid.length; i++) {
        post_provids_locid.push(provids_locid[i].locid);
      }
      if (post_provids_locid.length === 0) {
        return;
      }
      this.consumerService.getUserApptTime(post_provids_locid)
        .subscribe(data => {
          this.appttime_arr = data;
          const todaydt = new Date(this.serverDate.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
          const today = new Date(todaydt);
          const dd = today.getDate();
          const mm = today.getMonth() + 1; // January is 0!
          const yyyy = today.getFullYear();
          let cday = '';
          if (dd < 10) {
            cday = '0' + dd;
          } else {
            cday = '' + dd;
          }
          let cmon;
          if (mm < 10) {
            cmon = '0' + mm;
          } else {
            cmon = '' + mm;
          }
          const dtoday = yyyy + '-' + cmon + '-' + cday;
          for (let i = 0; i < this.appttime_arr.length; i++) {
            if (this.appttime_arr[i]['availableSlots']) {
              this.appttime_arr[i]['caption'] = 'Next Available Time';
              if (dtoday === this.appttime_arr[i]['availableSlots']['date']) {
                this.appttime_arr[i]['date'] = 'Today' + ', ' + this.getAvailableSlot(this.appttime_arr[i]['availableSlots'].availableSlots);
              } else {
                this.appttime_arr[i]['date'] = this.dateTimeProcessor.formatDate(this.appttime_arr[i]['availableSlots']['date'], { 'rettype': 'monthname' }) + ', '
                  + this.getAvailableSlot(this.appttime_arr[i]['availableSlots'].availableSlots);
              }
            }
          }
          this.getUserWaitingTime(waitTimearr);
        });
    }
  }
  getUserWaitingTime(provids) {
    console.log("In Get UserTime:", provids);
    if (provids.length > 0) {
      const post_provids: any = [];
      for (let i = 0; i < provids.length; i++) {
        post_provids.push(provids[i].locid);
      }
      if (post_provids.length === 0) {
        return;
      }
      this.consumerService.getUserEstimatedWaitingTime(post_provids)
        .subscribe(data => {
          console.log("Estimated Time", data);
          this.waitlisttime_arr = data;
          const todaydt = new Date(this.serverDate.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
          const today = new Date(todaydt);
          const dd = today.getDate();
          const mm = today.getMonth() + 1; // January is 0!
          const yyyy = today.getFullYear();
          let cday = '';
          if (dd < 10) {
            cday = '0' + dd;
          } else {
            cday = '' + dd;
          }
          let cmon;
          if (mm < 10) {
            cmon = '0' + mm;
          } else {
            cmon = '' + mm;
          }
          const dtoday = yyyy + '-' + cmon + '-' + cday;
          for (let i = 0; i < this.waitlisttime_arr.length; i++) {
            if (this.waitlisttime_arr[i].hasOwnProperty('nextAvailableQueue')) {
              if (!this.waitlisttime_arr[i]['nextAvailableQueue']['openNow']) {
                this.waitlisttime_arr[i]['caption'] = 'Next Available Time ';
                if (this.waitlisttime_arr[i]['nextAvailableQueue'].hasOwnProperty('serviceTime')) {
                  if (dtoday === this.waitlisttime_arr[i]['nextAvailableQueue']['availableDate']) {
                    this.waitlisttime_arr[i]['date'] = 'Today' + ', ' + this.waitlisttime_arr[i]['nextAvailableQueue']['serviceTime'];
                  } else {
                    this.waitlisttime_arr[i]['date'] = this.dateTimeProcessor.formatDate(this.waitlisttime_arr[i]['nextAvailableQueue']['availableDate'], { 'rettype': 'monthname' })
                      + ', ' + this.waitlisttime_arr[i]['nextAvailableQueue']['serviceTime'];
                  }
                } else {
                  this.waitlisttime_arr[i]['date'] = this.dateTimeProcessor.formatDate(this.waitlisttime_arr[i]['nextAvailableQueue']['availableDate'], { 'rettype': 'monthname' })
                    + ', ' + this.dateTimeProcessor.convertMinutesToHourMinute(this.waitlisttime_arr[i]['nextAvailableQueue']['queueWaitingTime']);
                }
              } else {
                this.waitlisttime_arr[i]['caption'] = 'Est Wait Time'; // 'Estimated Waiting Time';
                if (this.waitlisttime_arr[i]['nextAvailableQueue'].hasOwnProperty('queueWaitingTime')) {
                  this.waitlisttime_arr[i]['date'] = this.dateTimeProcessor.convertMinutesToHourMinute(this.waitlisttime_arr[i]['nextAvailableQueue']['queueWaitingTime']);
                } else {
                  this.waitlisttime_arr[i]['caption'] = this.nextavailableCaption + ' '; // 'Next Available Time ';
                  if (dtoday === this.waitlisttime_arr[i]['nextAvailableQueue']['availableDate']) {
                    this.waitlisttime_arr[i]['date'] = 'Today' + ', ' + this.waitlisttime_arr[i]['nextAvailableQueue']['serviceTime'];
                  } else {
                    this.waitlisttime_arr[i]['date'] = this.dateTimeProcessor.formatDate(this.waitlisttime_arr[i]['nextAvailableQueue']['availableDate'], { 'rettype': 'monthname' })
                      + ', ' + this.waitlisttime_arr[i]['nextAvailableQueue']['serviceTime'];
                  }
                }
              }
            }
          }
          this.setUsers(this.deptUsers);
        });
    }
  }
  setUsers(deptUsers) {
    this.onlineUsers = [];
    if (this.settings.enabledWaitlist || this.apptSettings.enableAppt) {
      for (let dIndex = 0; dIndex < deptUsers.length; dIndex++) {
        console.log(this.waitlisttime_arr[dIndex]);
        console.log(this.appttime_arr[dIndex]);
        deptUsers[dIndex]['waitingTime'] = this.waitlisttime_arr[dIndex];
        deptUsers[dIndex]['apptTime'] = this.appttime_arr[dIndex];
        console.log(deptUsers[dIndex]);
        this.onlineUsers.push({ 'type': 'provider', 'item': deptUsers[dIndex] });
      }
    }
    this.users_loaded = true;
  }


  getDonationServices() {
    this.donationServices = [];
    console.log("Loaded before:", this.loaded_donations);
    if (this.donationServicesJson && this.accountProfile.donationFundRaising && this.accountProfile.onlinePresence) {
      for (let dIndex = 0; dIndex < this.donationServicesJson.length; dIndex++) {
        this.donationServices.push({ 'type': 'donation', 'item': this.donationServicesJson[dIndex] });
      }
      this.loaded_donations = true;
      console.log("Loaded after:", this.loaded_donations);
    }
  }

  getAppointmentServices(locationId) {
    const _this = this;
    const apptServiceList = [];
    _this.bookingService.getAppointmentServices(locationId).then(
      (appointmentServices: any) => {
        let apptServicesList = appointmentServices.filter(service => !service.provider);
        for (let aptIndex = 0; aptIndex < apptServicesList.length; aptIndex++) {
          apptServiceList.push({ 'type': 'appt', 'item': apptServicesList[aptIndex] });
        }
        _this.apptServices = apptServiceList;
        _this.loaded_appointments = true;
      }, (error) => {
        _this.apptServices = apptServiceList;
        _this.loaded_appointments = true;
      }
    );
  }

  getCheckinServices(locationId) {
    const self = this;
    const checkinServiceList = [];
    self.bookingService.getCheckinServices(locationId).then(
      (checkinServices: any) => {
        let checkinServicesList = checkinServices.filter(service => !service.provider);
        for (let wlIndex = 0; wlIndex < checkinServicesList.length; wlIndex++) {
          checkinServiceList.push({ 'type': 'waitlist', 'item': checkinServicesList[wlIndex] });
        }
        self.checkinServices = checkinServiceList;
        self.loaded_checkins = true;
      }, (error) => {
        self.checkinServices = checkinServiceList;
        self.loaded_checkins = true;
      }
    );
  }


  showCommunicate(provid) {
    const dialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass', 'loginmainclass', 'smallform'],
      disableClose: true,
      data: {
        caption: 'Enquiry',
        user_id: provid,
        userId: provid,
        source: 'consumer-common',
        type: 'send',
        terminologies: this.terminologiesjson,
        name: this.accountProfile.businessName,
        typeOfMsg: 'single',
        theme: this.templateJson['theme']
      }
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'reloadlist') {
      }
    });
  }
  communicateHandler() {
    const _this = this;
    _this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.showCommunicate(this.accountId);
        } else {
          let communicateUrl = this.sharedService.getRouteID() + "/" + this.templateJson.template + '?callback=communicate';
          this.lStorageService.setitemonLocalStorage('target', communicateUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      });
  }
  profileActionPerformed(action) {
    if (action === 'coupons') {
      // this.openCoupons()
    } else if (action === 'qrcode') {
      // this.qrCodegeneraterOnlineID(this.sharedService.getRouteID());
    } else if (action === 'communicate') {
      this.communicateHandler();
    } else if (action === 'about') {
      this.router.navigate([this.sharedService.getRouteID(), 'about']);
    }
  }
  actionPerformed(actionObj) {
    if (actionObj['type'] === 'appt') {
      if (actionObj['action'] === 'view') {
        let queryParam = {
          back: 1
        }
        const navigationExtras: NavigationExtras = {
          queryParams: queryParam
        };
        this.router.navigate([this.sharedService.getRouteID(), 'service', actionObj['service'].id], navigationExtras);
      } else {
        this.appointmentClicked(actionObj['location'], actionObj['service']);
      }
    } else if (actionObj['type'] === 'waitlist') {
      if (actionObj['action'] === 'view') {
        let queryParam = {
          back: 1
        }
        const navigationExtras: NavigationExtras = {
          queryParams: queryParam
        };
        this.router.navigate([this.sharedService.getRouteID(), 'service', actionObj['service'].id], navigationExtras);
      } else {
        this.checkinClicked(actionObj['location'], actionObj['service']);
      }
    } else if (actionObj['type'] === 'donation') {
      if (actionObj['action'] === 'view') {
        let queryParam = {
          back: 1
        }
        const navigationExtras: NavigationExtras = {
          queryParams: queryParam
        };
        this.router.navigate([this.sharedService.getRouteID(), 'service', actionObj['service'].id], navigationExtras);
      } else {
        this.donationClicked(actionObj['location'].id, new Date(), actionObj['service']);
      }
    } else if (actionObj['type'] === 'department') {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          back: 1
        }
      };
      this.router.navigate([this.sharedService.getRouteID(), 'department', actionObj['userId']], navigationExtras);
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          back: 1
        }
      };
      this.router.navigate([this.sharedService.getRouteID(), actionObj['userId']], navigationExtras);
    }
    if (this.templateJson.section1 && this.templateJson.section1.key === actionObj) {
      this.menuSelected(this.templateJson.section1);
    }
    if (this.templateJson.section2 && this.templateJson.section2.key === actionObj) {
      this.menuSelected(this.templateJson.section2);
    }
    if (this.templateJson.section3 && this.templateJson.section3.key === actionObj) {
      this.menuSelected(this.templateJson.section3);
    }
    if (this.templateJson.section4 && this.templateJson.section4.key === actionObj) {
      this.menuSelected(this.templateJson.section4);
    }
  }



  donationClicked(locid, curdate, service) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        loc_id: locid,
        sel_date: curdate,
        service_id: service.id
      }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'donations', 'new'], navigationExtras);
  }
  appointmentClicked(location, service) {
    let queryParam = {
      loc_id: location.id,
      locname: location.place,
      // googleMapUrl: location.googleMapUrl,
      futureAppt: true,
      service_id: service.id,
      sel_date: service.serviceAvailability.nextAvailableDate
    };
    if (!location.futureAppt) {
      queryParam['futureAppt'] = false;
    }
    if (service.provider) {
      queryParam['user'] = service.provider.id;
    }
    if (service['serviceType'] === 'virtualService') {
      queryParam['tel_serv_stat'] = true;
    } else {
      queryParam['tel_serv_stat'] = false;
    }
    if (service['department']) {
      queryParam['dept'] = service['department'];
    }
    if (location.time) {
      queryParam['ctime'] = location.time
    }
    if (location.date) {
      queryParam['cdate'] = location.date
      service.serviceAvailability.nextAvailableDate = location.date
    }
    const dtoday = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(this.dateTimeProcessor.getLocaleDateFromServer(this.serverDate));
    if (dtoday === service.serviceAvailability.nextAvailableDate) {
      queryParam['cur'] = false;
    } else {
      queryParam['cur'] = true;
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParam
    };
    this.router.navigate([this.sharedService.getRouteID(), 'appointment'], navigationExtras);
  }
  checkinClicked(location, service) {
    let queryParam = {
      loc_id: location.id,
      locname: location.place,
      // googleMapUrl: gMapUrl,
      // sel_date: curdate,
      service_id: service.id,
      sel_date: service.serviceAvailability.availableDate
    };
    if (service.provider) {
      queryParam['user'] = service.provider.id;
    }
    const dtoday = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(this.dateTimeProcessor.getLocaleDateFromServer(this.serverDate));
    if (dtoday === service.serviceAvailability.availableDate) {
      queryParam['cur'] = false;
    } else {
      queryParam['cur'] = true;
    }
    if (service['serviceType'] === 'virtualService') {
      queryParam['tel_serv_stat'] = true;
    } else {
      queryParam['tel_serv_stat'] = false;
    }
    if (service['department']) {
      queryParam['dept'] = service['department'];
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParam,
    };
    this.router.navigate([this.sharedService.getRouteID(), 'checkin'], navigationExtras);
  }
  blogReadMore(blog) {
    window.open(blog.link, "_system");
  }
  videoClicked(video) {
    window.open(video.link, "_system");
  }
  showMoreVideo(link) {
    window.open(link, "_system");
  }
  loadImages(imagelist) {
    console.log("Image List:", imagelist);

    this.image_list_popup = [];
    if (imagelist?.length > 0) {
      for (let i = 0; i < imagelist.length; i++) {
        let imgobj = {
          source: imagelist[i].url,
          thumb: imagelist[i].url,
          alt: imagelist[i].caption || ''
        };
        this.image_list_popup.push(imgobj);
      }
    }
    console.log("Image List:", this.image_list_popup);
  }
  private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.image_list_popup);
    this.jGalleryService.open(this.image_list_popup, imageIndex);
  }
  createappoinment() {
    if (!this.selectedLocation) {
      return;
    }

    const service = this.getFirstApptService();
    if (service) {
      this.appointmentClicked(this.selectedLocation, service);
      return;
    }

    // Fallback: fetch services and navigate once data arrives
    this.bookingService.getAppointmentServices(this.selectedLocation.id).then((services: any) => {
      const apptServicesList = Array.isArray(services) ? services.filter(svc => !svc.provider) : [];
      this.apptServices = apptServicesList.map(item => ({ type: 'appt', item }));
      const firstService = apptServicesList[0];
      if (firstService) {
        this.appointmentClicked(this.selectedLocation, firstService);
      }
    });
  }
  onComingSoonCard(card: any) {
    if (card?.link) {
      if (card?.external && typeof window !== 'undefined') {
        window.open(card.link, '_blank');
      } else {
        this.router.navigateByUrl(card.link);
      }
    }
  }

  private getFirstApptService(): any | null {
    if (!Array.isArray(this.apptServices) || !this.apptServices.length) {
      return null;
    }
    const firstEntry = this.apptServices[0];
    return firstEntry?.item || firstEntry;
  }

  // ——— HERO / CARDS / BLOG DATA ———
  private hydrateTemplateContent() {
    this.heroSection = this.templateJson?.heroSection || null;
    this.homeDesign = this.templateJson?.homeDesign || this.templateJson?.home || this.templateJson?.landingPage || {};

    const section1 = this.templateJson?.section1 || {};
    const comingSoon = section1?.comingSoon || {};

    this.comingSoonCards = Array.isArray(comingSoon?.cards) ? comingSoon.cards : [];
    this.categories = this.getArrayWithFallback(
      this.homeDesign?.categories,
      this.homeDesign?.categoryCards,
      section1?.categories,
      this.comingSoonCards
    );
    this.visibleCategories = this.categories.slice(0, this.listBatchSize);
    this.preBookingCollection = this.getArrayWithFallback(
      this.homeDesign?.preBookingCollection,
      this.homeDesign?.preBookingCollections,
      this.homeDesign?.collections,
      section1?.preBookingCollection
    );
    this.visiblePreBookingCollection = this.preBookingCollection.slice(0, this.listBatchSize);
    this.reels = this.getArrayWithFallback(
      this.homeDesign?.reels,
      this.homeDesign?.shopByReels,
      section1?.videos,
      this.videos
    );
    this.visibleReels = this.reels.slice(0, this.reelsBatchSize);
    this.newArrivals = this.getArrayWithFallback(
      this.homeDesign?.newArrivals,
      this.homeDesign?.products,
      section1?.newArrivals,
      section1?.products
    );
    this.visibleNewArrivals = this.newArrivals.slice(0, this.listBatchSize);
    this.customerReviews = this.getArrayWithFallback(
      this.homeDesign?.customerReviews,
      this.homeDesign?.reviews,
      section1?.reviews
    );
    this.visibleCustomerReviews = this.customerReviews.slice(0, this.listBatchSize);
    this.socialLinks = this.getArrayWithFallback(this.homeDesign?.socialLinks, this.homeDesign?.socials);
    this.footerColumns = this.getArrayWithFallback(this.homeDesign?.footerColumns, this.homeDesign?.footerLinks);

    this.logoUrl = this.getFirstTruthy(
      this.homeDesign?.footerLogo,
      this.homeDesign?.logo,
      this.logoUrl,
      this.accountProfile?.businessLogo?.[0]?.s3path,
      this.accountProfile?.logo?.url
    );
    this.brandName = this.homeDesign?.brandName || this.accountProfile?.businessName || this.brandName;

    this.blogConfig = section1?.blogs || null;
    if (this.blogConfig) {
      const filters = Array.isArray(this.blogConfig.filters) && this.blogConfig.filters.length
        ? this.blogConfig.filters
        : [{ key: 'all', label: 'All' }];
      this.blogFilters = filters;
      this.blogPosts = Array.isArray(this.blogConfig.blog) ? this.blogConfig.blog : [];
      this.applyBlogFilter(this.blogFilters[0]?.key || 'all');
    } else {
      this.blogFilters = [];
      this.blogPosts = [];
      this.filteredBlogs = [];
    }
  }
  private applyBlogFilter(filterKey: string) {
    this.activeBlogFilter = filterKey;
    if (!filterKey || filterKey === 'all') {
      this.filteredBlogs = [...this.blogPosts];
      return;
    }
    const normalized = filterKey.toLowerCase();
    this.filteredBlogs = this.blogPosts.filter((post) => {
      const cats = this.extractBlogCategories(post);
      return cats.some(cat => cat.toLowerCase() === normalized);
    });
  }
  private extractBlogCategories(blog: any): string[] {
    if (!blog) {
      return [];
    }
    if (Array.isArray(blog.categories)) {
      return blog.categories.filter(Boolean).map(item => item.toString());
    }
    if (blog.category) {
      return [blog.category.toString()];
    }
    return [];
  }
  openBlog(blog: any) {
    if (blog?.link) {
      if (typeof window !== 'undefined') {
        window.open(blog.link, '_blank');
      }
    }
  }
  moreblogs() {
    window.open("https://chotaboss.com/our-blog/")
  }
  selectBlogFilter(filterKey: string) {
    this.applyBlogFilter(filterKey);
  }
  onPrimaryCta() {
    this.createappoinment();
  }
  onCardClick(item: any) {
    if (!item) {
      return;
    }
    const link = item?.link || item?.url || item?.route;
    if (link && typeof link === 'string' && link.startsWith('http')) {
      window.open(link, '_blank');
      return;
    }
    if (link && typeof link === 'string') {
      this.router.navigateByUrl(link.startsWith('/') ? link : `/${link}`);
      return;
    }
  }
  onShowMore(sectionKey: string) {
    const section = this.homeDesign?.[sectionKey] || this.homeDesign?.[`${sectionKey}Section`] || {};
    if (section?.link) {
      this.onCardClick(section);
    }
  }
  hasMoreCategories(): boolean {
    return this.visibleCategories.length < this.categories.length;
  }
  loadMoreCategories() {
    if (!this.hasMoreCategories()) {
      return;
    }
    const nextCount = this.visibleCategories.length + this.listBatchSize;
    this.visibleCategories = this.categories.slice(0, nextCount);
  }
  hasMorePreBookingCollection(): boolean {
    return this.visiblePreBookingCollection.length < this.preBookingCollection.length;
  }
  loadMorePreBookingCollection() {
    if (!this.hasMorePreBookingCollection()) {
      return;
    }
    const nextCount = this.visiblePreBookingCollection.length + this.listBatchSize;
    this.visiblePreBookingCollection = this.preBookingCollection.slice(0, nextCount);
  }
  hasMoreReels(): boolean {
    return this.visibleReels.length < this.reels.length;
  }
  loadMoreReels() {
    if (!this.hasMoreReels()) {
      return;
    }
    const nextCount = this.visibleReels.length + this.reelsBatchSize;
    this.visibleReels = this.reels.slice(0, nextCount);
  }
  hasMoreNewArrivals(): boolean {
    return this.visibleNewArrivals.length < this.newArrivals.length;
  }
  loadMoreNewArrivals() {
    if (!this.hasMoreNewArrivals()) {
      return;
    }
    const nextCount = this.visibleNewArrivals.length + this.listBatchSize;
    this.visibleNewArrivals = this.newArrivals.slice(0, nextCount);
  }
  hasMoreCustomerReviews(): boolean {
    return this.visibleCustomerReviews.length < this.customerReviews.length;
  }
  loadMoreCustomerReviews() {
    if (!this.hasMoreCustomerReviews()) {
      return;
    }
    const nextCount = this.visibleCustomerReviews.length + this.listBatchSize;
    this.visibleCustomerReviews = this.customerReviews.slice(0, nextCount);
  }
  onReviewScroll(event: Event) {
    const element = event?.target as HTMLElement;
    if (!element || !this.visibleCustomerReviews?.length) {
      return;
    }
    const cardWidth = element.clientWidth / 2;
    if (!cardWidth) {
      this.activeReviewIndex = 0;
      return;
    }
    const index = Math.round(element.scrollLeft / cardWidth);
    this.activeReviewIndex = Math.max(0, Math.min(this.visibleCustomerReviews.length - 1, index));
  }
  getStars(inputRating: any): number[] {
    const rating = Math.max(1, Math.min(5, Number(inputRating || 5)));
    return Array.from({ length: rating }, (_, i) => i);
  }
  forcePlay(event: Event) {
    const video = event?.target as HTMLVideoElement;
    if (!video) {
      return;
    }
    video.muted = true;
    video.defaultMuted = true;
    video.loop = true;
    video.playsInline = true;
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Autoplay can still be blocked by browser policy; keep silent for preview mode.
      });
    }
  }
  trackByIndex(index: number): number {
    return index;
  }
  resolveAsset(path: string): string {
    if (!path || typeof path !== 'string') {
      return '';
    }
    if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('//')) {
      return path;
    }
    const trimmedBase = (this.assetBasePath || '').replace(/\/$/, '');
    const trimmedPath = path.replace(/^\//, '');
    return trimmedBase ? `${trimmedBase}/${trimmedPath}` : path;
  }
  private setupScrollReveal() {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }
    if (this.sectionObserver) {
      this.sectionObserver.disconnect();
    }
    this.sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.11 });

    setTimeout(() => {
      const sections = document.querySelectorAll('.reveal-on-scroll');
      sections.forEach((section) => this.sectionObserver?.observe(section));
    });
  }
  private getArrayWithFallback(...values: any[]): any[] {
    for (const value of values) {
      if (Array.isArray(value) && value.length) {
        return value;
      }
    }
    return [];
  }
  private getFirstTruthy(...values: any[]): any {
    for (const value of values) {
      if (value) {
        return value;
      }
    }
    return '';
  }

  handleNotification(notification) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('appNotification');
    let uuid;
    let url;
    switch (notification.click_action) {
      case 'BILL':
        uuid = notification['uuid'];
        url = this.sharedService.getRouteID() + "/booking/bill?back=0&uuid=" + uuid;
        _this.authService.goThroughLogin().then((status) => {
          if (status) {
            this.router.navigateByUrl(url);
          } else {
            this.lStorageService.setitemonLocalStorage('target', url);
            this.router.navigate([_this.sharedService.getRouteID(), 'login']);
          }
        })
        break;
      case 'CONSUMER_APPT':
        uuid = notification['uuid'];
        url = this.sharedService.getRouteID() + "/booking/" + uuid + "?back=0";
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.sharedService.getRouteID(), 'login']);
            }
          })
        break;
      case 'CONSUMER_CHECKIN':
        uuid = notification['uuid'];
        url = this.sharedService.getRouteID() + "/booking/" + uuid + "?back=0";
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.sharedService.getRouteID(), 'login']);
            }
          })
        break;
      case 'CONSUMER_WAITLIST':
        uuid = notification['uuid'];
        url = this.sharedService.getRouteID() + "/booking/" + uuid + "?back=0";
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.sharedService.getRouteID(), 'login']);
            }
          })
        break;
      case "CONSUMER_ORDER":
      case "CONSUMER_ORDER_STATUS":
        uuid = notification['uuid'];
        url = _this.sharedService.getRouteID() + "/order/details?back=0&uuid=" + uuid;
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.sharedService.getRouteID(), 'login']);
            }
          })
        break;
      case "CONSUMER_DONATION_SERVICE":
      case "PAYMENTFAIL":
      case "BILL_PAYMENT_SUCCESS":
      case "CONSUMER_SHARE_PRESCRIPTION":
      case "CONSUMER_SHARE_MEDICAL_RECODE":
      case "PRE_PAYMENT_SUCCESS":
      case "MASSCOMMUNICATION":
      case "INSTANT_VIDEO":
      default:
        this.resumeLoadingHome();
        break;
    }
  }
  resumeLoadingHome() {
    if (this.templateJson.section1.blog) {
      this.blogs = this.templateJson.section1.blog;
    }
    if (this.templateJson.section1.videos) {
      this.videos = this.templateJson.section1.videos;
    }
    this.hydrateTemplateContent();
    this.galleryJson = this.sharedService.getJson(this.account['gallery']);
    this.loadImages(this.galleryJson);
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    if (this.templateJson.section1.donations || this.templateJson.section2.donations || this.templateJson.section3.donations) {
      this.getDonationServices();
    }
    this.selectedIndex = this.templateJson.section1.title;
    this.changeLocation(this.accountService.getActiveLocation());
    this.loadTodayBookings();
    this.loadFutureBookings();
    if (this.callback === 'communicate') {
      this.communicateHandler();
    }
    this.subscriptions.add(this.galleryService.getMessage().subscribe(input => {
      if (input && input.accountId && input.uuid && input.type) {
        if (input.type === 'appt') {
          this.consumerService.addAppointmentAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
              },
              error => {
                this.toastService.showError(error.error);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        } else if (input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
              },
              error => {
                this.toastService.showError(error.error);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        }
      }
    }));
  }
  gotoItems(){
    this.router.navigate([this.sharedService.getRouteID(), 'items']);
  }
  onItemSearchSelected(event: any) {
    if (event?.query) {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          query: event.query
        }
      };
      this.router.navigate([this.sharedService.getRouteID(), 'items'], navigationExtras);
      return;
    }
    if (event?.value?.encId) {
      this.router.navigate([this.sharedService.getRouteID(), 'item', event.value.encId]);
    }
  }
}
