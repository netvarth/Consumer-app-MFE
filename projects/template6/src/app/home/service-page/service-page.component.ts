import { Location } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, NavigationExtras, Router } from "@angular/router";
import { AccountService, ConsumerService, DateTimeProcessor, JGalleryService, LocalStorageService, SharedService, SubscriptionService } from "jconsumer-shared";
import { Subscription } from "rxjs";

@Component({
  selector: 'app-service-page',
  templateUrl: './service-page.component.html',
  styleUrls: ['./service-page.component.css']
})
export class ServicePageComponent implements OnInit, OnDestroy {
  settings: any;
  theme: any;
  apptSettings: any;
  account: any;
  accountProfile: any;
  serverDate: any;
  accountConfig: any;
  profileSettings: any;
  small_device_display: any;
  basicProfile: any = {};
  bgCover: any;
  selectedLocation: any;
  accountId: any;
  uniqueId: any;
  customId: any;
  locations: any;
  serviceId: string;
  servicesAndProviders: any = [];
  donationServices: any = [];
  serviceDetails: any;
  personsAheadText: string;
  deptName: any;
  timingCaption: string;
  timings: any;
  timingCaptionapt: string;
  timingsapt: any;
  minutes: any;
  min: number;
  hour: number;
  HHMM: string;
  serviceGalleryPopup: any = [];
  extra_service_img_count: number;
  subscription: Subscription;
  back: any;
  s3CouponList: any = {
    JC: [], OWN: []
  };
  extras: any = {
    'icons': true,
    'more': true
  };
  userProfile: any;
  userName: any;
  userId: any;
  constructor(
    private router: Router,
    private subscriptionService: SubscriptionService,
    private lStorageService: LocalStorageService,
    private consumerService: ConsumerService,
    private activatedRoute: ActivatedRoute,
    private dateTimeProcessor: DateTimeProcessor,
    private jGalleryService: JGalleryService,
    private location: Location,
    private accountService: AccountService,
    private sharedService: SharedService
  ) {
    this.activatedRoute.paramMap.subscribe(params => {
      this.serviceId = params.get('serid');
    });
    this.activatedRoute.queryParams.subscribe(qparams => {
      console.log(qparams);
      if (qparams['src']) {
        this.lStorageService.setitemonLocalStorage('source', qparams['src']);
        this.lStorageService.setitemonLocalStorage('reqFrom', 'CUSTOM_WEBSITE');
      }
      if (qparams['back']) {
        this.back = qparams['back'];
      }
    });
    this.subscription = this.subscriptionService.getMessage().subscribe(
      (response) => {
        if (response.ttype === 'locationChanged') {
          this.changeLocation(this.accountService.getActiveLocation());
        }
      });

  }
  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    this.router.routeReuseStrategy.shouldReuseRoute = function () {
      return false;
    };

    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.settings = this.sharedService.getJson(this.account['settings']);
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    let donationServicesList = this.accountService.getJson(this.account['donationServices'])
    console.log("Donation Services:", donationServicesList);
    if (donationServicesList) {
      let donationServices = donationServicesList.filter(service => service.id == this.serviceId);
      if (this.accountProfile.donationFundRaising && this.accountProfile.onlinePresence && donationServices.length > 0) {
        this.serviceDetails = donationServices[0];
        this.donationServices.push({ 'type': 'donation', 'item': donationServices[0] });
      }
    }
    this.setBasicProfile(this.accountProfile);
    if (this.small_device_display && this.accountConfig) {
      this.profileSettings = this.accountConfig['smallDevices'];
    } else if (this.accountConfig) {
      this.profileSettings = this.accountConfig['normalDevices'];
    }
    this.changeLocation(this.accountService.getActiveLocation());
    this.accountId = this.accountProfile.id;
    this.uniqueId = this.accountProfile['uniqueId'];
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.setAccountCoupons(this.accountService.getJson(this.account['coupon']));
  }

  setAccountCoupons(res) {
    if (res !== undefined) {
      this.s3CouponList.JC = res;
    } else {
      this.s3CouponList.JC = [];
    }
  }
  profileActionPerformed(action) {
    if (action === 'about') {
      this.router.navigate([this.customId, 'about']);
    }
  }

  setBasicProfile(accountProfile) {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = accountProfile['businessName'];
    if (accountProfile['businessUserName']) {
      this.basicProfile['businessUserName'] = accountProfile['businessUserName'];
    }
    if (accountProfile.cover) {
      this.bgCover = accountProfile.cover.url;
    } else {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.basicProfile['cover'] = this.bgCover;
    if (this.accountProfile.emails) {
      this.basicProfile['emails'] = accountProfile.emails;
    }
    if (this.accountProfile.phoneNumbers) {
      this.basicProfile['phoneNumbers'] = accountProfile.phoneNumbers;
    }
    if (accountProfile.baseLocation) {
      this.basicProfile['baseLocation'] = accountProfile.baseLocation;
    }
    this.basicProfile['logo'] = accountProfile.logo?.url;
    this.basicProfile['socialMedia'] = accountProfile.socialMedia;
    console.log("Social Media", accountProfile.socialMedia);
  }

  actionPerformed(actionObj) {
    console.log(actionObj);
    if (actionObj['type'] === 'appt') {
      this.appointmentClicked(actionObj['location'], actionObj['service']);
    } else if (actionObj['type'] === 'waitlist') {
      this.checkinClicked(actionObj['location'], actionObj['service']);
    } else if (actionObj['type'] === 'donation') {
      this.donationClicked(actionObj['service']);
    }
    // else {
    //     this.router.navigate([this.customId, actionObj['userId']]);
    // }
  }
  donationClicked(service) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        service_id: service.id
      }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'donation'], navigationExtras);
  }
  appointmentClicked(location, service) {
    let queryParam = {
      loc_id: location.id,
      type: 'Appointment',
      locname: location.place,
      googleMapUrl: location.googleMapUrl,
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
      type: 'Waitlist',
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
    this.router.navigate([this.sharedService.getRouteID(), 'appointment'], navigationExtras);
    // this.router.navigate([this.customId, 'checkin'], navigationExtras);
  }
  changeLocation(loc: any) {
    this.selectedLocation = loc;
    this.servicesAndProviders = [];
    this.generateServicesForLocation(this.selectedLocation.id);
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  getAvailabilityforAppt(date, time) {
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
    console.log("time is" + time);
    if (dtoday === date) {
      return ('Today' + ', ' + this.getSingleTime(time));
    } else {
      return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
        + this.getSingleTime(time));
    }
  }
  getAvailibilityForCheckin(date, serviceTime) {
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
    if (dtoday === date) {
      return ('Today' + ', ' + serviceTime);
    } else {
      return (this.dateTimeProcessor.formatDate(date, { 'rettype': 'monthname' }) + ', '
        + serviceTime);
    }
  }
  getTimeToDisplay(min) {
    return this.dateTimeProcessor.convertMinutesToHourMinute(min);
  }
  generateServicesForLocation(locationId) {
    this.consumerService.getServicesByLocationId(locationId).subscribe(
      (wlServices: any) => {
        console.log("Wl SErvices:", wlServices);
        let filteredServices = wlServices.filter(service => (service.id == this.serviceId) && service.serviceAvailability);
        console.log("Filtered Service:", filteredServices);
        if (filteredServices && filteredServices.length > 0) {
          this.serviceDetails = filteredServices[0];
          this.setServiceGallery(this.serviceDetails);
          this.getduration(this.serviceDetails);
          if (this.serviceDetails['deptName']) {
            this.deptName = this.serviceDetails['deptName'];
          }
          if (this.serviceDetails.serviceAvailability['personAhead'] >= 0) {
            this.personsAheadText = 'People in line : ' + this.serviceDetails.serviceAvailability['personAhead'];
          }
          if (this.serviceDetails.serviceAvailability['calculationMode'] !== 'NoCalc') {
            if (this.serviceDetails.serviceAvailability['serviceTime']) {
              this.timingCaption = 'Next Available Time';
              this.timings = this.getAvailibilityForCheckin(this.serviceDetails.serviceAvailability['availableDate'], this.serviceDetails.serviceAvailability['serviceTime']);
            } else {
              this.timingCaption = 'Est Wait Time';
              this.timings = this.getTimeToDisplay(this.serviceDetails.serviceAvailability['queueWaitingTime']);
            }
          }
          this.servicesAndProviders.push({ 'type': 'waitlist', 'item': filteredServices[0] });
        }
      }, () => {
      });
    this.consumerService.getServicesforAppontmntByLocationId(locationId).subscribe(
      (apptServices: any) => {
        let filteredServices = apptServices.filter(service => (service.id == this.serviceId) && service.serviceAvailability);
        if (filteredServices && filteredServices.length > 0) {
          this.serviceDetails = filteredServices[0];
          if (this.serviceDetails['deptName']) {
            this.deptName = this.serviceDetails['deptName'];
          }
          if (this.serviceDetails.serviceAvailability['nextAvailable']) {
            this.timingCaptionapt = 'Next Available Time';
            this.timingsapt = this.getAvailabilityforAppt(this.serviceDetails.serviceAvailability.nextAvailableDate, this.serviceDetails.serviceAvailability.nextAvailable);
          }
          this.getduration(this.serviceDetails);
          this.servicesAndProviders.push({ 'type': 'appt', 'item': filteredServices[0] });
        }
      }, () => {
      }
    );
  }
  setServiceGallery(servicedetails: any) {
    const _this = this;
    console.log(servicedetails);
    if (servicedetails.provider && servicedetails.provider.id) {
      this.userId = servicedetails.provider.id;
      this.accountService.getUserInformation(this.uniqueId, this.userId).then(
        (userAccountInfo: any) => {
          let userProfile = _this.accountService.getJson(userAccountInfo['providerBusinessProfile']);
          _this.setBasicProfile(userProfile);
        }
      );
    } else {
      this.setBasicProfile(this.accountProfile);
    }
    this.serviceGalleryPopup = [];
    if (servicedetails.servicegallery && servicedetails.servicegallery.length > 0) {
      if (servicedetails.servicegallery.length > 5) {
        this.extra_service_img_count = servicedetails.servicegallery.length - 5;
      }
      for (let i = 0; i < servicedetails.servicegallery.length; i++) {
        let imgobj = {
          source: servicedetails.servicegallery[i].url,
          thumb: servicedetails.servicegallery[i].url,
          alt: servicedetails.servicegallery.caption || ''
        };
        this.serviceGalleryPopup.push(imgobj);
      }
    }
  }
  getduration(servicedetails: any) {
    this.minutes = servicedetails.serviceDuration;
    if (this.minutes) {
      this.min = this.minutes % 60;
      this.hour = (this.minutes - this.min) / 60;
      if (this.hour > 0 && this.min > 0) {
        if (this.hour > 1) {
          this.HHMM = this.hour + ' ' + 'hrs' + ' ' + this.min + ' ' + 'mins';
        } else {
          this.HHMM = this.hour + ' ' + 'hr' + ' ' + this.min + ' ' + 'mins';
        }
      } else if (this.hour === 0) {
        this.HHMM = this.min + ' ' + 'mins';
      } else if (this.min === 0) {
        if (this.hour > 1) {
          this.HHMM = this.hour + ' ' + 'hrs';
        } else {
          this.HHMM = this.hour + ' ' + 'hr';
        }
      }
    }
  }

  goBack() {
    this.location.back();
  }
  private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.serviceGalleryPopup);
    this.jGalleryService.open(this.serviceGalleryPopup, imageIndex);
  }
}