import { Component, OnDestroy, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { ConsumerService, DateTimeProcessor, projectConstantsLocal, SharedService, WordProcessor } from "jconsumer-shared";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-status-component',
  templateUrl: './status.component.html',
  styleUrls: ['./status.component.css']
})

export class StatusComponent implements OnInit, OnDestroy {
  bookingStatuses = projectConstantsLocal.CHECK_IN_STATUSES;
  hasEncId: boolean = false;
  booking = {
    status: null,
    statusClass: '',
    title: '',
    id: null,
    idCaption: '',
    genderIcon: null,
    phoneNumber: null,
    bookingFor: [],
    bookingForCaption: '',
    bookingDate: null,
    summaryCaption: '',
    bookingTime: null,
    location: null,
    info: null,
    isAppointment: false,
    isOrder: false,
    rescheduleBooking: false,
    confirmStatusText: '',
    personsAhead: null,
    waitTime: null,
    tokenNumber: null,
    service: null,
    account: {
      logo: null,
      name: null,
      place: null
    }
  }
  accountConfig: any;
  theme: any;
  provider_label: any;
  accountID: any;
  private subscriptions: Subscription = new Subscription();
  apiloading: boolean;
  account: any;
  accountProfile: any;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  cdnPath: string='';
  locationVisible: boolean = false;
  constructor(
    private activatedRoute: ActivatedRoute,
    private sharedService: SharedService,
    private wordProcessor: WordProcessor,
    private consumerService: ConsumerService,
    private dateTimeProcessor: DateTimeProcessor,
    private sanitizer: DomSanitizer,
    public router: Router,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    const subs = this.activatedRoute.params.subscribe(qparams => {
      console.log("Params: ", qparams);
      if (qparams['id']) {
        this.hasEncId = true;
        this.initBookingAttributes(qparams['id']);
      }
    })
    this.subscriptions.add(subs);
  }
  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }
  initBookingAttributes(bookingID: string) {
    this.booking['uid'] = bookingID;
    if (bookingID.startsWith('so-')) {
      this.booking['isOrder'] = true;
    } else if (bookingID.startsWith('a-')) {
      this.booking['isAppointment'] = true;
    }
  }

  ngOnInit(): void {
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    this.setBusinessInfo();
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig?.locationVisible) {
      this.locationVisible = this.accountConfig?.locationVisible;
    }
    this.wordProcessor.setTerminologies(this.sharedService.getTerminologies());
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.accountID = this.sharedService.getAccountID();
    if (this.accountID) {
      this.loadBookingInfo();
    }
  }
  setBusinessInfo() {
    if (this.accountProfile?.businessLogo?.length > 0) {
      this.booking['account'].logo = this.accountProfile.businessLogo[0].s3path;
    }
    if (this.accountProfile?.businessName) {
      this.booking['account'].name = this.accountProfile?.businessName;
    }
    if (this.accountProfile?.baseLocation?.place) {
      this.booking['account'].place = this.accountProfile.baseLocation.place;
    }
  }
  getBookingInfo() {
    const _this = this;
    return new Promise(function (resolve) {
      if(_this.booking['isOrder']) {
        let subs = _this.consumerService.getSorderbyEncId(_this.booking['uid']).subscribe(
          (order: any)=>{
            let orderFors = [];
            order.orderFor['firstName'] = order.orderFor['name'];
            order.orderFor['lastName'] = '';
            orderFors.push(order.orderFor);
            _this.booking['bookingFor'] = orderFors;
            console.log(_this.booking);
            
            resolve(order);
          })
      } else if (_this.booking['isAppointment']) {
        let subs = _this.consumerService.getApptbyEncId(_this.booking['uid']).subscribe(
          (appointment: any) => {
            _this.booking['bookingFor'] = appointment.appmtFor;
            resolve(appointment);
          }
        )
        _this.subscriptions.add(subs);
      } else {
        let subs = _this.consumerService.getCheckinbyEncId(_this.booking['uid']).subscribe(
          (checkin: any) => {
            _this.booking['bookingFor'] = checkin.waitlistingFor;
            resolve(checkin);
          }
        )
        _this.subscriptions.add(subs);
      }
    })
  }
  getStatusLabel(status) {
    const label_status = this.wordProcessor.firstToUpper(this.wordProcessor.getTerminologyTerm(status));
    return label_status;
  }

  getOrderStatus(status) {
    let label_status = status.replace(/_/g, ' ').toLowerCase().split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');                      
    return label_status;
  }

  loadBookingInfo() {
    const _this = this;
    this.getBookingInfo().then((booking: any) => {
      _this.booking['info'] = booking;      
      if (_this.booking['isOrder']) {
        _this.booking['location'] = booking.location.place;
        _this.booking['mapUrl'] = booking.location.googleMapUrl;
        _this.booking['title'] = 'Order Details';
        _this.booking['status'] = booking.orderStatus === 'Order Received' ? 'Order Placed - Waiting for confirmation' : this.getOrderStatus(booking.orderStatus);
        _this.booking['idCaption'] = 'Order No :';
        _this.booking['id'] = booking.orderNum;
        _this.booking['bookingForCaption'] = 'Order For';
        _this.booking['statusClass'] = 'green status-card';
        if (booking?.orderFor?.phone?.number){
          _this.booking['phoneNumber'] = booking.orderFor.phone.countryCode + booking.orderFor.phone.number;
        }
      } else if (_this.booking['isAppointment']) {
        _this.booking['service'] = booking['service'];
        _this.booking['status'] = _this.getStatusLabel(booking['apptStatus']);
        if (booking['apptStatus'] === 'Cancelled' || booking['apptStatus'] === 'Rejected') {
          _this.booking['statusClass']='cancelled';
        } else {
          _this.booking['statusClass'] = 'green';
        }
        _this.booking['location'] = booking.location.place;
        _this.booking['mapUrl'] = booking.location.googleMapUrl;
        _this.booking['bookingDate'] = booking.appmtDate;
        _this.booking['phoneNumber'] = booking.phoneNumber;
        _this.booking['bookingFor'] = booking.appmtFor;
        _this.booking['id'] = booking.appointmentEncId;
        if (booking.appmtTime) {
          _this.booking['bookingTime'] = _this.getSingleTime(booking.appmtTime);
        }
          if (booking['apptStatus'] === 'Requested') {
            _this.booking['title'] = 'Request Details';
            _this.booking['confirmStatusText'] = '';
          } else {
            _this.booking['title'] = 'Booking Details';
            _this.booking['confirmStatusText'] = '';
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
        _this.booking['service'] = booking['service'];
        _this.booking['title'] = 'Booking Details';
        _this.booking['status'] = _this.getStatusLabel(booking['waitlistStatus']);
        if (booking['waitlistStatus'] === 'cancelled') {
          _this.booking['statusClass']='cancelled';
        } else {
          _this.booking['statusClass'] = 'green';
        }
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
        console.log("booking:", booking);
        if (booking['personsAhead'] >= 0) {
          _this.booking['personsAhead'] = booking['personsAhead'];
        }
        if (booking['token']) {
          _this.booking['tokenNumber'] = booking.token;
        } else {
          _this.booking['waitTime'] = this.getWaitTime(booking);
        }
      }
      if(booking.provider) {
        let displayName = (booking.provider.businessName? booking.provider.businessName: (booking.provider.firstName + ' ' + booking.provider.lastName));
        _this.booking['mapSectionTitle'] = (displayName + ', ' + _this.booking['account'].name);
      } else {
        _this.booking['mapSectionTitle'] = _this.booking['account'].name;
      }
      if (booking?.virtualService?.WhatsApp) {
        _this.booking['whatsApp'] = booking.virtualService.WhatsApp;
      }
      let cdnPath = this.sharedService.getCDNPath();
      let genderIcon =  (cdnPath + 'assets/images/Asset1@300x(1).png');
      if(_this.booking['bookingFor']?.[0]?.gender){
        if (_this.booking['bookingFor']?.[0]?.gender == 'male') {
          genderIcon = (cdnPath + 'assets/images/Asset1@300x.png');
        } else if (_this.booking['bookingFor']?.[0]?.gender == 'female') {
          genderIcon = (cdnPath + 'assets/images/Asset2@300x.png');
        }
      }
      _this.booking['genderIcon'] = genderIcon;
      _this.apiloading = false;
    })
  }
  getUrl(status) {
    var { latitude, longitude } = this.extractLatLng(status);
    var embedUrl = this.constructEmbedUrl(latitude, longitude);
    return embedUrl;
  }
  constructEmbedUrl(latitude, longitude) {
    return this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed/v1/view?zoom=11&center=' + latitude + ',' + longitude + '&key=' + projectConstantsLocal.GOOGLEAPIKEY);
  }
  extractLatLng(url) {
    // Extract the latitude and longitude from the URL
    var coordinates = url.split("/place/")[1].split("/@")[0];
    var [latitude, longitude] = coordinates.split(",");
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
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
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    return '';
  }
  goBack() {

    this.router.navigate([this.sharedService.getRouteID()]);

  }
}