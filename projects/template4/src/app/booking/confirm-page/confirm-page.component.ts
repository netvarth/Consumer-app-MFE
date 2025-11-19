import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CalendarOptions, GoogleCalendar } from 'datebook';
import {
  ConsumerService,
  DateTimeProcessor,
  LocalStorageService,
  projectConstantsLocal,
  SharedService,
  SubscriptionService,
  WordProcessor
} from 'jconsumer-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-page',
  templateUrl: './confirm-page.component.html',
  styleUrls: ['./confirm-page.component.scss']
})
export class ConfirmPageComponent implements OnInit, OnDestroy {
  appointment: any = [];
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  email;
  apiloading = false;
  provider_label;
  type = 'appt';
  theme: any;
  from: any;
  selectedApptsTime: any;
  calender = false;
  calendarEvents;
  selectedSlots: any;
  businessName: any;
  events: any[];
  calendarUrl: any;
  accountConfig: any;
  selectedService: any = [];
  apptServices: any;
  subscriptions: Subscription = new Subscription();
  infoParams: any = {};

  booking = {
    status: null,
    title: '',
    id: null,
    idCaption: '',
    phoneNumber: null,
    bookingFor: [],
    bookingForCaption: '',
    bookingDate: null,
    summaryCaption: '',
    bookingTime: null,
    location: null,
    info: null,
    addToCalendar: false,
    isAppointment: false,
    rescheduleBooking: false,
    confirmStatusText: '',
    personsAhead: null,
    waitTime: null,
    tokenNumber: null,
    service: null
  }
  accountID: any;
  cdnPath: string = '';
  storeEncId: any;
  isSessionCart: any;
  constructor(
    public route: ActivatedRoute,
    public router: Router,
    private wordProcessor: WordProcessor,
    private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private sharedService: SharedService,
    private subscriptionService: SubscriptionService,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    const subs = this.route.queryParams.subscribe(qparams => {
      if (qparams['selectedApptsTime']) {
        this.selectedApptsTime = qparams['selectedApptsTime'];
        this.booking['bookingTime'] = this.selectedApptsTime;
      }
      if (qparams['selectedSlots']) {
        this.selectedSlots = JSON.parse(qparams['selectedSlots']);
      }
      if (qparams['type']) {
        this.booking['rescheduleBooking'] = true;
        this.type = qparams['type'];
      }
      if (qparams['uuid']) {
        this.initBookingAttributes(qparams['uuid']);
      }
    });
    this.subscriptions.add(subs);
  }
  loadBookingInfo() {
    const _this = this;
    this.getBookingInfo().then((booking: any) => {
      _this.booking['info'] = booking;
      _this.booking['service'] = booking['service'];
      _this.appointment = booking;
      _this.infoParams = booking || {};
      _this.setServiceGallery();
      if (_this.booking['isAppointment']) {
        _this.booking['status'] = booking['apptStatus'];
        _this.booking['addToCalendar'] = true;
        _this.booking['location'] = booking.location.place;
        _this.booking['mapUrl'] = booking.location.googleMapUrl;
        _this.booking['bookingDate'] = booking.appmtDate;
        _this.booking['phoneNumber'] = booking.phoneNumber;
        _this.booking['bookingFor'] = booking.appmtFor;
        _this.booking['id'] = booking.appointmentEncId;
        if (!_this.selectedApptsTime && booking.appmtTime) {
          _this.booking['bookingTime'] = _this.getSingleTime(booking.appmtTime);
        }
        if (_this.booking['rescheduleBooking']) {
          _this.booking['title'] = 'Appointment rescheduled';
        } else {
          if (booking['apptStatus'] === 'Requested') {
            _this.booking['title'] = 'Request sent successfully';
            _this.booking['confirmStatusText'] = '';
          } else {
            _this.booking['title'] = 'Booking Confirmed';
            _this.booking['confirmStatusText'] = '';
          }
        }
        if (booking['apptStatus'] === 'Requested') {
          _this.booking['idCaption'] = 'Request Id :';
          _this.booking['bookingForCaption'] = 'Request For';
          _this.booking['summaryCaption'] = 'Request details';

        } else {
          _this.booking['idCaption'] = 'Booking Id :';
          _this.booking['bookingForCaption'] = 'Booking For';
          _this.booking['summaryCaption'] = 'Booking details';
        }
      } else {
        _this.booking['status'] = booking['waitlistStatus'];
        _this.booking['id'] = booking.checkinEncId;
        _this.booking['location'] = booking.queue.location.place;
        _this.booking['mapUrl'] = booking.queue.location.googleMapUrl;
        _this.booking['bookingFor'] = booking.waitlistingFor;
        _this.booking['phoneNumber'] = booking.waitlistPhoneNumber;
        _this.booking['idCaption'] = 'Booking Id :';
        _this.booking['bookingForCaption'] = 'BookingFor';
        _this.booking['summaryCaption'] = 'Booking details';
        _this.booking['bookingDate'] = booking.date;
        _this.booking['bookingTime'] = booking.queue.queueStartTime + " - " + booking.queue.queueEndTime;
        if (booking['personsAhead'] && booking['personsAhead'] >= 0) {
          _this.booking['personsAhead'] = booking['personsAhead'];
        }
        if (booking['token']) {
          _this.booking['tokenNumber'] = booking.token;
        } else {
          _this.booking['waitTime'] = this.getWaitTime(booking);
        }
        if (_this.booking['rescheduleBooking']) {
          if (booking['token']) {
            _this.booking['title'] = 'Token rescheduled';
          } else {
            _this.booking['title'] = 'Checkin rescheduled';
          }
        } else {
          _this.booking['title'] = 'Booking Confirmed';
        }
      }
      _this._loadScripts();
      _this.apiloading = false;
    })
  }
  getWaitTime(booking) {
    if (booking.calculationMode !== 'NoCalc') {
      if (booking.serviceTime) {
        return booking.serviceTime;
      } else if (booking.appxWaitingTime === 0) {
        return 'Now';
      } else if (booking.appxWaitingTime !== 0) {
        return this.dateTimeProcessor.convertMinutesToHourMinute(booking.appxWaitingTime);
      }
    }
  }
  _loadScripts() {
    if (this.booking['isAppointment']) {
      if (this.accountConfig && this.accountConfig['scripts'] && this.accountConfig['scripts']['appointment_confirm']) {
        this.addScript(this.accountConfig['scripts']['appointment_confirm']);
      }
    } else {
      if (this.accountConfig && this.accountConfig['scripts'] && this.accountConfig['scripts']['token_confirm']) {
        this.addScript(this.accountConfig['scripts']['token_confirm']);
      }
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
  initBookingAttributes(bookingID: string) {
    this.booking['uid'] = bookingID;
    if (bookingID.endsWith('appt')) {
      this.booking['isAppointment'] = true;
    }
  }

  addToCalendar() {
    this.calendarUrl;
    let config: CalendarOptions;

    if (this.booking['selectedApptsTime']) {
      if (this.booking['info'].providerAccount && this.booking['info'].providerAccount.businessName) {
        this.businessName = this.booking['info'].providerAccount.businessName;
      }
      const startDate = new Date(this.booking['bookingDate']);
      config = {
        title: this.businessName + ' - ' + this.booking['info'].service.name,
        location: this.booking.location,
        description: 'Time Slots: ' + this.selectedApptsTime,
        start: startDate
      }
    } else {
      if (this.type === 'reschedule') {
        if (this.booking['info'].providerAccount && this.booking['info'].providerAccount.businessName) {
          this.businessName = this.booking['info'].providerAccount.businessName;
        }
        let times = this.booking['info'].appmtTime.split("-");

        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.booking['info'].appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.booking['info'].appmtDate + 'T' + startTime);
        const endDate = new Date(this.booking['info'].appmtDate + 'T' + endTime);
        config = {
          title: this.businessName + ' - ' + this.booking['info'].service.name,
          location: this.booking['info'].location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate,
        }
      } else {
        if (this.booking['info'].providerAccount && this.booking['info'].providerAccount.businessName) {
          this.businessName = this.booking['info'].providerAccount.businessName;
        }
        console.log("Appt time:", this.booking['info'].appmtTime);
        let times = this.booking['info'].appmtTime.split("-");
        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.booking['info'].appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.booking['info'].appmtDate + 'T' + startTime);
        const endDate = new Date(this.booking['info'].appmtDate + 'T' + endTime);
        config = {
          title: this.businessName + ' - ' + this.booking['info'].service.name,
          location: this.booking['info'].location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate
        }
      }
    }
    console.log("config:", config);
    const googleCalendar = new GoogleCalendar(config);
    this.calendarUrl = googleCalendar.render();
    console.log('this.calendarUrl', this.calendarUrl);
    if (this.calendarUrl) {
      window.open(this.calendarUrl);
    }
  }
  addScript(script) {
    let script_tag = document.createElement("script");
    script_tag.type = "text/javascript";
    script_tag.text = script;
    console.log(document.getElementById('scriptContainer'))
    document.getElementById('scriptContainer').appendChild(script_tag);
  }
  ngOnInit() {
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.accountID = this.sharedService.getAccountID();
    if (this.accountID) {
      this.loadBookingInfo();
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
   gotoActiveHome(isLoggedOut?: boolean) {
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log("Source:", source);
    if (source) {
      this.lStorageService.removeitemfromLocalStorage('source');
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      window.location.href = source;
    } else {
      // if (!this.restrictNavigation) {
      this.lStorageService.setitemonLocalStorage('storeEncId', this.storeEncId);
      this.lStorageService.setitemonLocalStorage('isSessionCart', this.isSessionCart);
      this.router.navigate([this.sharedService.getRouteID()]);
      // Inform Home to refresh state after navigating home
      // this.subscriptionService.sendMessage({ ttype: 'refresh', value: 'refresh' });
      if (isLoggedOut) {
        this.subscriptionService.sendMessage({ ttype: 'logout', value: 0 });
      }
    }
  }
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    return '';
  }
  setServiceGallery() {
    let account = this.sharedService.getAccountInfo();
    let services = [];
    if(this.booking['isAppointment']) {
      services = this.sharedService.getJson(account['apptServices']);
    } else {
      services = this.sharedService.getJson(account['services']);
    }
    let activeService = services.filter(service => ((service.id == this.booking['service']['id'])));
    if (activeService && activeService[0] && activeService[0].servicegallery && activeService[0].servicegallery.length > 0) {
      this.booking['service']['servicegallery'] = activeService[0].servicegallery;
    }
  }
  okClicked() {
    this.gotoActiveHome();
  }
  okClick() {
    this.router.navigate([this.sharedService.getRouteID(), 'dashboard', 'bookings']);
  }
}
