import { Component, HostListener, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import {
  BookingService,
  ConfirmBoxComponent,
  ConsumerService,
  DateTimeProcessor,
  ErrorMessagingService,
  GroupStorageService,
  Messages,
  projectConstantsLocal,
  SharedService,
  SubscriptionService,
  ToastService,
  WordProcessor
} from "jconsumer-shared";
import { Subscription } from "rxjs";
import { Location } from "@angular/common";
import { MeetingDetailsComponent } from "../../shared/meeting-details/meeting-details.component";
import { MatDialog } from "@angular/material/dialog";
import { GalleryImportComponent } from "../../shared/gallery/import/gallery-import.component";
import { AttachmentPopupComponent } from "../../shared/attachment-popup/attachment-popup.component";
import { AddInboxMessagesComponent } from "../../shared/add-inbox-messages/add-inbox-messages.component";
import { GalleryService } from "../../shared/gallery/galery-service";
import { TeleBookingService } from "../../shared/tele-bookings-service";

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss']
})
export class DetailsComponent implements OnInit, OnDestroy {

  theme: any;
  customer_label: any;
  provider_label;
  no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP;
  cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP;
  questionnaire_heading = Messages.QUESTIONNAIRE_CONSUMER_HEADING;
  bookingStatuses = projectConstantsLocal.CHECK_IN_STATUSES;
  cancelledReasons = projectConstantsLocal.WAITLIST_CANCEL_REASON;
  smallDevice: boolean;
  private subscriptions: Subscription = new Subscription();
  booking = {
    uid: null,
    isAppointment: false,
    isCancelled: false,
    cancelReason: null,
    cancelMessage: null,
    isHistory: false,
    whatsApp: null,
    info: null,
    logo: null,
    iconClass: null,
    status: null,
    domain: null,
    actions: {
      viewAttachment: false,
      hasAttachment: false,
      sendAttachment: false,
      reschedule: false,
      joinMeeting: false,
      joinJaldeeVideo: false,
      cancel: false
    },
    email: null,
    mobile: null,
    time: null,
    date: null,
    bookingFor: null,
    encID: null,
    location: null,
  questionnaires: [],
  qnrSource: null

  };
  actionMenuOpen = false;
  instructionFallback = 'Our veterinarians provide a 5-minute window for joining appointments, and if you\'re unable to join within that time, it will be automatically rescheduled';
  accountID: any;
  qr_value: string;
  api_loading: boolean = false;
  pageTitle: string = '';
  callingChannel: string;
  callingMode: string; // video/audio
  callingNumber: string;
  addnotedialogRef: any;
  galleryDialog: any;
  showattachmentDialogRef: any;
  meetingDetails: any;
  cdnPath: string = '';
  activeUser: any;
   hideLocationGlobal: boolean = false;
  _type: string | null = null;
  constructor(
    private sharedService: SharedService,
    private activatedRoute: ActivatedRoute,
    private wordProcessor: WordProcessor,
    private subscriptionService: SubscriptionService,
    private consumerService: ConsumerService,
    private teleBookingService: TeleBookingService,
    private errorService: ErrorMessagingService,
    private toastService: ToastService,
    private dateTimeProcessor: DateTimeProcessor,
    private location: Location,
    private dialog: MatDialog,
    private bookingService: BookingService,
    private router: Router,
    private galleryService: GalleryService,
    private groupService: GroupStorageService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.onResize();
    let subs = this.activatedRoute.params.subscribe((params) => {
      if (params['id']) {
        this.initBookingAttributes(params['id']);
      }
    })
    this.subscriptions.add(subs);
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
    // this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
    this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
  }

  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 991) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }

  @HostListener('document:click', ['$event'])
  closeMenuOnOutside(event: Event) {
    if (this.actionMenuOpen) {
      this.actionMenuOpen = false;
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
  ngOnInit(): void {
    let account = this.sharedService.getAccountInfo();
    let businessProfile = this.sharedService.getJson(account['businessProfile']);
    this.setAccountInfo(businessProfile);
    let accountConfig = this.sharedService.getAccountConfig();
    if (accountConfig && accountConfig['theme']) {
      this.theme = accountConfig['theme'];
    }
    if (accountConfig?.locationVisible) {
      this.hideLocationGlobal = accountConfig?.locationVisible;
    }
    this.activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.accountID = this.sharedService.getAccountID();
    this.loadBookingInfo();
    let subs = this.galleryService.getMessage().subscribe(input => {
      console.log("Reached Here:");
      if (input && input.accountId && input.uuid && input.type === 'appt' && input.value) {
        this.consumerService.addAppointmentAttachment(input.accountId, input.uuid, input.value)
          .subscribe(
            () => {
              this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
              this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
            }, error => {
              let errorObj = this.errorService.getApiError(error);
              this.toastService.showError(errorObj);
              this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
            }
          );
      } else {
        if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
              }, error => {
                let errorObj = this.errorService.getApiError(error);
                this.toastService.showError(errorObj);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        }
      }
    });
    this.subscriptions.add(subs);
  }
  setAccountInfo(account: any) {
    if (account && account.logo && account.logo.url) {
      this.booking['logo'] = account.logo.url;
    }
    this.booking['domain'] = account['serviceSector']['domain'];
  }

  getBookingInfo() {
    const _this = this;
    return new Promise(function (resolve) {
      if (_this.booking['isAppointment']) {
        _this.pageTitle = 'Appointment Details';
        let subs = _this.consumerService.getAppointmentByConsumerUUID(_this.booking['uid'], _this.accountID).subscribe(
          (appointment: any) => {
            _this.booking['location'] = appointment.location.place;
            _this.booking['bookingFor'] = appointment.appmtFor;
            _this.booking['mobile'] = appointment.countryCode + '' + appointment.phoneNumber;
            _this.booking['date'] = appointment.appmtDate;
            _this.booking['time'] = _this.getSingleTime(appointment.appmtTime);
            console.log("Appointment:", appointment);

            resolve(appointment);
          }
        )
        _this.subscriptions.add(subs);
      } else {
        let subs = _this.consumerService.getCheckinByConsumerUUID(_this.booking['uid'], _this.accountID).subscribe(
          (checkin: any) => {
            _this.pageTitle = 'Check-in Details';
            if (checkin.showToken) {
              _this.pageTitle = 'Token Details';
            }
            _this.booking['location'] = checkin.queue.location.place;
            _this.booking['bookingFor'] = checkin.waitlistingFor;
            _this.booking['mobile'] = checkin.countryCode + '' + checkin.waitlistPhoneNumber;
            _this.booking['date'] = checkin.date;
            if (checkin?.queue?.queueStartTime) {
              _this.booking['time'] = checkin.queue.queueStartTime + ' - ' + checkin.queue.queueEndTime;
            }
            resolve(checkin);
          }
        )
        _this.subscriptions.add(subs);
      }
    })
  }

  loadBookingInfo() {
    const _this = this;
    this.getBookingInfo().then((booking) => {
      _this.booking['info'] = booking;
      _this.booking['encID'] = this.getEncID(booking);
      if (_this.booking.bookingFor[0]?.email) {
        _this.booking['email'] = _this.booking.bookingFor[0]?.email;
      }
      console.log("In LoadBookingInfo:", _this.booking['info']);

      _this.setVirtualService(booking);
      _this.setStatus(booking);
      _this.setBookingType(booking);
      _this.generateQR(booking);
      _this.setActions(booking);
      _this.setQuestionaries(booking);
      _this.api_loading = true;
      this.actionMenuOpen = false;
    })
  }
  setActions(booking: any) {
    Object.keys(this.booking['actions']).forEach((key) => {
      this.booking['actions'][key] = false;
    });

    const apptStatus = (booking?.apptStatus || '').toLowerCase();
    const waitlistStatus = (booking?.waitlistStatus || '').toLowerCase();
    const isAppointment = this.booking['isAppointment'];
    const isVirtual = booking?.service?.serviceType === 'virtualService';
    const isToday = this._type === 'today';

    if (booking.apptStatus === 'Cancelled') {
      this.booking['isCancelled'] = true;
      this.booking['cancelReason'] = this.getCancelledReasonDisplayName(booking.cancelReason);
      this.booking['cancelMessage'] = booking.cancelReasonMessage;
    }
    if (booking.hasAttachment) {
      this.booking['actions']['hasAttachment'] = true;
    }
    if (isAppointment) {
      if (apptStatus && apptStatus !== 'cancelled' && apptStatus !== 'rejected') {
        this.booking['actions']['sendAttachment'] = true;
      }

      const canRescheduleAppt = apptStatus === 'confirmed' || apptStatus === 'arrived';
      const canCancelAppt = apptStatus === 'confirmed' || apptStatus === 'arrived' || apptStatus === 'prepaymentpending';
      if (!this.booking['isHistory'] && canRescheduleAppt) {
        this.booking['actions']['reschedule'] = true;
      }
      if (!this.booking['isHistory'] && canCancelAppt) {
        this.booking['actions']['cancel'] = true;
      }

      const canJoinAppt = isToday && isVirtual
        && (apptStatus === 'started' || apptStatus === 'arrived' || apptStatus === 'confirmed');
      if (canJoinAppt && this.callingChannel === 'VideoCall' && booking?.videoCallButton === 'ENABLED') {
        this.booking['actions']['joinJaldeeVideo'] = true;
      }
      if (canJoinAppt && (this.callingChannel === 'GoogleMeet' || this.callingChannel === 'Zoom')) {
        this.booking['actions']['joinMeeting'] = true;
      }
    } else {
      if (booking.waitlistStatus === 'cancelled') {
        this.booking['isCancelled'] = true;
        this.booking['cancelReason'] = this.getCancelledReasonDisplayName(booking.waitlistCancelReason);
        this.booking['cancelMessage'] = booking.cancelReasonMessage;
      }

      if (waitlistStatus && waitlistStatus !== 'cancelled') {
        this.booking['actions']['sendAttachment'] = true;
      }

      const canRescheduleWaitlist = waitlistStatus === 'checkedin' || waitlistStatus === 'arrived';
      const canCancelWaitlist = canRescheduleWaitlist || waitlistStatus === 'prepaymentpending';
      if (!this.booking['isHistory'] && canRescheduleWaitlist) {
        this.booking['actions']['reschedule'] = true;
      }
      if (!this.booking['isHistory'] && canCancelWaitlist) {
        this.booking['actions']['cancel'] = true;
      }

      const canJoinWaitlist = isToday && isVirtual
        && (waitlistStatus === 'started' || waitlistStatus === 'arrived' || waitlistStatus === 'checkedin');
      if (canJoinWaitlist && this.callingChannel === 'VideoCall' && booking?.videoCallButton === 'ENABLED') {
        this.booking['actions']['joinJaldeeVideo'] = true;
      }
      if (canJoinWaitlist && (this.callingChannel === 'GoogleMeet' || this.callingChannel === 'Zoom')) {
        this.booking['actions']['joinMeeting'] = true;
      }
    }
  }
  joinMeeting() {
    const bookingInfo = this.booking['info'];
    if (!bookingInfo) {
      return;
    }
    if (this.callingChannel === 'VideoCall') {
      if (bookingInfo.videoCallButton && bookingInfo.videoCallButton !== 'DISABLED') {
        const bookingEncId = this.booking['isAppointment'] ? bookingInfo.appointmentEncId : bookingInfo.checkinEncId;
        if (bookingEncId && this.activeUser?.primaryPhoneNumber) {
          this.router.navigate([this.sharedService.getRouteID(), 'meeting', this.activeUser.primaryPhoneNumber, bookingEncId]);
        }
      }
      return;
    }
    let source = this.booking['isAppointment'] ? 'appt' : 'wl';
    this.getMeetingDetails(bookingInfo, source);
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
  viewAttachment() {
    let source = this.booking['isAppointment'] ? 'appt' : 'checkin';
    this.getAttachments().then((attachments: any) => {
      this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
        width: '50%',
        panelClass: ['popup-class', 'commonpopupmainclass'],
        disableClose: true,
        data: {
          attachments: attachments,
          type: source,
          theme: this.theme
        }
      });
      this.showattachmentDialogRef.afterClosed().subscribe(result => {
        if (result === 'reloadlist') {
        }
      });
    })
  }
  getAttachments() {
    const _this = this;
    let booking = _this.booking['info'];
    return new Promise(function (resolve) {
      if (_this.booking['isAppointment']) {
        let subs = _this.bookingService.getAppointmentAttachmentsByUuid(_this.booking['uid'], booking.providerAccount.id).subscribe(
          (attachments) => {
            resolve(attachments);
          }, () => {
            resolve([]);
          })
        _this.subscriptions.add(subs);
      } else {
        let subs = _this.bookingService.getWaitlistAttachmentsByUuid(_this.booking['uid'], booking.providerAccount.id).subscribe(
          (attachments) => {
            resolve(attachments);
          }, () => {
            resolve([]);
          })
        _this.subscriptions.add(subs);
      }
    })
  }
  sendAttachmentBooking() {
    let type = this.booking['isAppointment'] ? 'appt' : 'checkin';
    let booking = this.booking['info'];
    const pass_ob = {};
    pass_ob['user_id'] = booking.providerAccount.id;
    pass_ob['uuid'] = this.booking['uid'];
    pass_ob['type'] = type;
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
      }
    });
    this.galleryDialog.afterClosed().subscribe(result => {
      this.galleryDialog.close('reload');
      this.api_loading = false;
      this.loadBookingInfo();
    });
  }
  cancelBooking() {
    let type = this.booking['isAppointment'] ? 'appointment' : 'waitlist';
    let booking = this.booking['info'];
    const tdata = {};
    tdata['theme'] = this.theme;
    tdata['message'] = 'Cancellation and Refund policy';
    tdata['heading'] = 'Confirm';
    tdata['type'] = 'yes/no';
    tdata['cancelPolicy'] = 'show';
    tdata['book'] = 'booking';
    tdata['wtlist'] = booking;
    let canceldialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'confirmationmainclass'],
      disableClose: true,
      data: tdata
    });
    canceldialogRef.afterClosed().subscribe(result =>
       {
      if (result && (result.cancelReason || result.rejectReason) || result) {
        let subs = this.bookingService.removeBooking(this.booking['uid'], type, booking.providerAccount.id, result)
          .subscribe(() => {
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
          }, (error) => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj)
          });
        this.subscriptions.add(subs);
      }
    })
  }

  getCancelledReasonDisplayName(name) {
    let cancelReasons = this.cancelledReasons.filter(reason => reason.value == name);
    if (cancelReasons.length > 0) {
      return cancelReasons[0].title;
    }
    return name;
  }
  setStatus(booking: any) {
    if (this.booking['isAppointment']) {
      this.booking['status'] = this.bookingStatuses[booking.apptStatus];
    } else {
      if (booking?.service?.serviceType !== 'virtualService' || (booking?.service?.serviceType === 'virtualService' && booking.waitlistStatus !== 'arrived')) {
        this.booking['status'] = this.bookingStatuses[booking.waitlistStatus];
      }
    }
  }
  setBookingType(booking: any) {
    const dateValue = booking?.appmtDate || booking?.date;
    if (!dateValue) {
      this._type = null;
      return;
    }

    const moment = this.dateTimeProcessor.getMoment();
    if (!moment) {
      this._type = null;
      return;
    }

    let todayMoment;
    let bookingMoment;
    if (booking?.timezone && moment.tz) {
      todayMoment = moment().tz(booking.timezone);
      bookingMoment = moment.tz(dateValue, booking.timezone);
    } else {
      todayMoment = moment();
      bookingMoment = moment(dateValue, 'YYYY-MM-DD');
    }

    const today = todayMoment.format('YYYY-MM-DD');
    const bookingDate = bookingMoment.format('YYYY-MM-DD');
    if (bookingDate === today) {
      this._type = 'today';
    } else if (bookingMoment.isAfter(todayMoment)) {
      this._type = 'future';
    } else {
      this._type = 'history';
    }
  }
  setWhatsApp(booking: any) {
    if (booking && booking.service && booking.service.virtualCallingModes) {
      this.booking['whatsApp'] = this.teleBookingService.getTeleNumber(booking.virtualService[booking.service.virtualCallingModes[0].callingMode]);
    }
  }
  setVirtualService(booking) {
    console.log("Booking in Set Virtual:", this.booking);

    this.setWhatsApp(booking);
    if (booking.service.serviceType === 'virtualService') {
      this.callingChannel = booking.service.virtualCallingModes[0].callingMode;
      switch (booking.service.virtualCallingModes[0].callingMode) {
        case 'Zoom': {
          this.booking['iconClass'] = 'fa zoom-icon';
          break;
        }
        case 'GoogleMeet': {
          this.booking['iconClass'] = 'fa meet-icon';
          break;
        }
        case 'WhatsApp': {
          this.callingNumber = '+91' + booking.service.virtualCallingModes[0].value;
          if (booking.service.virtualServiceType === 'audioService') {
            this.callingMode = 'audio';
            this.booking['iconClass'] = 'fa wtsapaud-icon';
          } else {
            this.booking['iconClass'] = 'fa wtsapvid-icon';
            this.callingMode = 'video';
          }
          break;
        }
        case 'Phone': {
          this.callingNumber = '+91' + booking.service.virtualCallingModes[0].value;
          this.booking['iconClass'] = 'fa phon-icon';
          break;
        }
        case 'VideoCall': {
          this.booking['iconClass'] = 'fa jvideo-icon jvideo-icon-s jvideo-icon-mgm5';
          break;
        }
      }
      this.setMeetingInfo(booking);
    }
  }
  setMeetingInfo(booking) {
    const _this = this;
    if (_this.booking['isAppointment']) {
      let subs = this.consumerService.getConsumerApptMeetingDetails(this.booking['uid'], this.callingChannel, this.booking['info'].providerAccount.id).subscribe(
        (data) => {
          this.meetingDetails = data;
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        });
      _this.subscriptions.add(subs);
    } else {
      let subs = this.consumerService.getConsumerWaitlistMeetingDetails(this.booking['uid'], this.callingChannel, this.booking['info'].providerAccount.id).subscribe(
        (data) => {
          this.meetingDetails = data;
        }, (error) => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        });
      _this.subscriptions.add(subs);
    }

  }
  generateQR(booking) {
    this.qr_value = this.sharedService.getUIPath() + '/status/' + this.getEncID(booking);
  }
  getEncID(booking) {
    return booking.checkinEncId ? booking.checkinEncId : booking.appointmentEncId;
  }
  setQuestionaries(booking: any) {
    this.booking['qnrSource'] = this.booking['isAppointment'] ? 'consAppt' : 'consCheckin';
    if (booking.questionnaires && booking.questionnaires.length > 0) {
      this.booking['questionnaires'] = booking.questionnaires;
    }
    if (booking.releasedQnr && booking.releasedQnr.length > 0) {
      if ((this.booking['isAppointment'] && booking.apptStatus !== 'Cancelled') ||
        (!this.booking['isAppointment'] && booking.waitlistStatus !== 'cancelled')) {
        const releasedQnrs = booking.releasedQnr.filter(qnr => qnr.status === 'released');
        if (releasedQnrs.length > 0) {
          this.getReleasedQnrs().then(
            (qnr: any) => {
              const qnrs = qnr.filter(function (o1) {
                return releasedQnrs.some(function (o2) {
                  return o1.id === o2.id;
                });
              });
              this.booking['questionnaires'] = this.booking['questionnaires'].concat(qnrs);
            }
          ).catch(error => {
            let errorObj = this.errorService.getApiError(error);
            this.toastService.showError(errorObj);
          })
        }
      }
    }
  }
  getReleasedQnrs() {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (_this.booking['isAppointment']) {
        let subs = _this.consumerService.getApptQuestionnaireByUid(_this.booking['uid'], _this.accountID).subscribe(
          (qnr: any) => {
            resolve(qnr);
          }, (error) => {
            reject(error);
          }
        )
        _this.subscriptions.add(subs);
      } else {
        let subs = _this.consumerService.getWaitlistQuestionnaireByUid(_this.booking['uid'], _this.accountID).subscribe(
          (qnr: any) => {
            resolve(qnr);
          }, (error) => {
            reject(error);
          }
        )
        _this.subscriptions.add(subs);
      }
    })
  }
  getQnrStatus(qnr) {
    const id = (qnr.questionnaireId) ? qnr.questionnaireId : qnr.id;
    const questr = this.booking['info'].releasedQnr.filter(questionnaire => questionnaire.id === id);
    if (questr[0]) {
      return questr[0].status;
    }
  }
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    return '';
  }
  getTimeToDisplay(min) {
    if (this.dateTimeProcessor.convertMinutesToHourMinute(min) === '0 minutes') {
      return 'Now';
    } else {
      return this.dateTimeProcessor.convertMinutesToHourMinute(min);
    }
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe()
  }

  gotoPrev() {
    this.location.back();
  }
  gotoHome() {
    this.router.navigate([this.sharedService.getRouteID(), 'bookings'])
  }
  rescheduleBooking() {
    let queryParams = {
      uuid: this.booking['uid'],
      type: 'reschedule',
      service_id: this.booking['info'].service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.sharedService.getRouteID(), 'appointment'], navigationExtras);
  }
  sendMessage() {
    let type = this.booking['isAppointment'] ? 'appt' : 'checkin';
    let booking = this.booking['info'];
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = booking.providerAccount.id;
    pass_ob['userId'] = booking.providerAccount.uniqueId;
    pass_ob['name'] = booking.providerAccount.businessName;
    pass_ob['uuid'] = this.booking['uid'];
    pass_ob['typeOfMsg'] = 'single';
    if (this.booking['isAppointment']) {
      pass_ob['appt'] = type;
    }
    this.openMessageWindow(pass_ob);
  }
  openMessageWindow(dataToSend) {
    this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: dataToSend
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
      
      // this.addnotedialogRef.close();
    });
  }

  toggleActionMenu(event: Event) {
    event.stopPropagation();
    this.actionMenuOpen = !this.actionMenuOpen;
  }

  closeActionMenu() {
    this.actionMenuOpen = false;
  }

  onMenuClick(event: Event) {
    event.stopPropagation();
  }

  hasActionMenuItems(): boolean {
    return !!this.booking?.info;
  }

  getQuestionAnswers(event) {
  }
}
