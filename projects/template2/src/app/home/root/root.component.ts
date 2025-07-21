import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AccountService,
  AuthService,
  ConsumerService,
  DateTimeProcessor,
  GroupStorageService,
  JGalleryService,
  LocalStorageService,
  Messages,
  projectConstantsLocal,
  SharedService,
  SubscriptionService,
  WordProcessor
} from 'jconsumer-shared';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { AddInboxMessagesComponent } from '../../shared/add-inbox-messages/add-inbox-messages.component';
import { BookingService } from '../../booking/booking.service';
import { TemplateService } from './template/template.service';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit {
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
  bgCover: any;
  serverDate: any;
  callback: any;
  customId: any;
  accountId: any;
  private subscription: Subscription;
  users_loaded: boolean;
  blogs: any = [];
  videos: any = [];
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  consumer_label: any;
  appmtDate: any = new Date();
  isFutureDate: boolean;
  availableDates: any = [];
  selected_date: any;
  tempselectedDate: any;
  minDate: any = new Date();
  maxDate: any;
  tempWeekList: any = [];
  term: any;
  hidden = false;
  selectedAnswer: string = null;
  checked = true;
  provider_label = '';
  cdnPath: string

  constructor(
    private subscriptionService: SubscriptionService,
    private sharedService: SharedService,
    private accountService: AccountService,
    private router: Router,
    private templateService: TemplateService,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private consumerService: ConsumerService,
    private deviceService: DeviceDetectorService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    public wordProcessor: WordProcessor,
    private sanitizer: DomSanitizer,
    private jGalleryService: JGalleryService,
    private bookingService: BookingService,
    private cdRef: ChangeDetectorRef,
    private dateTimeProcessor: DateTimeProcessor,
    private dialog: MatDialog
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.activatedRoute.queryParams.subscribe(qparams => {
      console.log("QParams :", qparams)
      if (qparams && qparams['callback']) {
        this.callback = qparams['callback'];
      }
      this.subscription = this.subscriptionService.getMessage().subscribe(
        (response) => {
          if (response.ttype === 'locationChanged') {
            this.changeLocation(this.accountService.getActiveLocation());
          }
        });
    });
    this.subscriptionService.getMessage().subscribe(
      (message) => {
        switch (message.ttype) {
          case 'communicate':
            this.communicateHandler();
            break;
          case 'menu':
            if (this.templateJson.section1['key'] === message.value) {
              this.menuSelected(this.templateJson.section1);
            } else if (this.templateJson.section2['key'] === message.value) {
              this.menuSelected(this.templateJson.section2);
            } else if (this.templateJson.section3['key'] === message.value) {
              this.menuSelected(this.templateJson.section3);
            } else if (this.templateJson.section4['key'] === message.value) {
              this.menuSelected(this.templateJson.section4);
            } else {
              this.menuSelected(this.templateJson.section5);
            }
            break;
          case 'quickaction':
            this.quickActionPerformed(message.value);
            break;
          case 'action':
            this.actionPerformed(message.value);
            break;
          case 'profile':
            this.profileActionPerformed(message.value);
        }
      }
    )
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  ngOnInit(): void {
    console.log("Root Component Init");
    
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.settings = this.accountService.getJson(this.account['settings']);
    this.showDepartments = this.settings.filterByDept;
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.donationServicesJson = this.accountService.getJson(this.account['donationServices']);
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.consumer_label = this.wordProcessor.getTerminologyTerm('consumer');
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.terminologiesjson = this.account['terminologies'];
    this.setBasicProfile();
    this.templateService.setExtras(this.extras);
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.deptUsers = this.accountService.getJson(this.account['departmentProviders']);
    console.log('showDepartments', this.showDepartments)
    if (this.showDepartments) {
      this.setDepartments(this.deptUsers);
    }
    this.selectedLocation = this.accountService.getActiveLocation();
    this.templateJson = this.sharedService.getTemplateJSON();
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    if (this.templateJson.section1.blog) {
      this.blogs = this.templateJson.section1.blog;
    }
    if (this.templateJson.section1.videos) {
      this.videos = this.templateJson.section1.videos;
    }
    if (this.templateJson.section1.donations || this.templateJson.section2.donations || this.templateJson.section3.donations) {
      console.log("donations?")
      this.getDonationServices();
    }
    this.selectedIndex = this.templateJson.section1.title;
    this.changeLocation(this.accountService.getActiveLocation());
    if (this.callback === 'communicate') {
      this.communicateHandler();
    }
  }

  setDepartments(depts) {
    let departmentsS3 = [];
    let checkinServices = this.accountService.getJson(this.account['services']);
    let apptServices = this.accountService.getJson(this.account['apptServices']);
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
    console.log('departments', this.departments);
  }

  menuSelected(section) {
    console.log(section.title);
    if (section.type !== 'action') {
      this.selectedIndex = section.title;
      this.lStorageService.setitemonLocalStorage('tabIndex', this.selectedIndex);
    } else {
      console.log(section.link);
      let url = this.sharedService.getRouteID()  + '/' + section.link;
      this.router.navigateByUrl(url);
    }
    this.cdRef.detectChanges();
  }
  quickActionPerformed(action) {
    if (action['key']) {
      this.selectedIndex = action['key'];
      this.lStorageService.setitemonLocalStorage('tabIndex', this.selectedIndex);
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
    this.templateService.setBasicProfile(this.basicProfile);
  }
  changeLocation(loc: any) {
    const _this = this;
    this.selectedLocation = loc;
    this.templateService.setLocation(this.selectedLocation);
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
          _this.deptUsers = _this.accountService.getJson(response['departmentProviders']);
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
  getAvailableSlot(slots) {
    console.log('slots', slots)
    let slotAvailable = '';
    for (let i = 0; i < slots.length; i++) {
      if (slots[i].active) {
        slotAvailable = this.getSingleTime(slots[i].time);
        break;
      }
    }
    console.log('slotAvailable', slotAvailable)
    return slotAvailable;
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
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
      console.log(' this.onlineUsers', this.onlineUsers)
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
        console.log('apptServices', this.apptServices)
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
        console.log('checkinServices', this.checkinServices)
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
          let communicateUrl = this.customId + "/" + this.templateJson.template + '?callback=communicate';
          this.lStorageService.setitemonLocalStorage('target', communicateUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      });
  }
  profileActionPerformed(action) {
    if (action === 'communicate') {
      this.communicateHandler();
    } else if (action === 'about') {
      this.router.navigate([this.sharedService.getRouteID(),'about']);
    }
  }
  actionPerformed(actionObj) {
    console.log('actionObj', actionObj)
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
        this.appointmentClicked(this.selectedLocation, actionObj['item']['item']);
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
        this.checkinClicked(this.selectedLocation, actionObj['item']['item']);
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
        this.donationClicked(actionObj['service']);
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

  donationClicked(service) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        // loc_id: locid,
        // sel_date: curdate,
        service_id: service.id
      }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'donation'], navigationExtras);
  }
  appointmentClicked(location, service) {
    let queryParam = {
      loc_id: location.id,
      // locname: location.place,
      // futureAppt: true,
      service_id: service.id,
      type:'Appointment',
      // sel_date: service.serviceAvailability.nextAvailableDate
    };
    // if (!location.futureAppt) {
    //   queryParam['futureAppt'] = false;
    // }
    if (service.provider) {
      queryParam['user'] = service.provider.id;
    }
    // if (service['serviceType'] === 'virtualService') {
    //   queryParam['tel_serv_stat'] = true;
    // } else {
    //   queryParam['tel_serv_stat'] = false;
    // }
    // if (service['department']) {
    //   queryParam['dept'] = service['department'];
    // }
    // if (location.time) {
    //   queryParam['ctime'] = location.time
    // }
    // if (location.date) {
    //   queryParam['cdate'] = location.date
    //   service.serviceAvailability.nextAvailableDate = location.date
    // }
    // const dtoday = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(this.dateTimeProcessor.getLocaleDateFromServer(this.serverDate));
    // if (dtoday === service.serviceAvailability.nextAvailableDate) {
    //   queryParam['cur'] = false;
    // } else {
    //   queryParam['cur'] = true;
    // }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParam
    };
    this.router.navigate([this.sharedService.getRouteID(),'booking'], navigationExtras);
  }
  checkinClicked(location, service) {
    let queryParam = {
      loc_id: location.id,
      // locname: location.place,
      service_id: service.id,
      type:'Waitlist'
      // sel_date: service.serviceAvailability.availableDate
    };
    if (service.provider) {
      queryParam['user'] = service.provider.id;
    }
    // const dtoday = this.dateTimeProcessor.getStringFromDate_YYYYMMDD(this.dateTimeProcessor.getLocaleDateFromServer(this.serverDate));
    // if (dtoday === service.serviceAvailability.availableDate) {
    //   queryParam['cur'] = false;
    // } else {
    //   queryParam['cur'] = true;
    // }
    // if (service['serviceType'] === 'virtualService') {
    //   queryParam['tel_serv_stat'] = true;
    // } else {
    //   queryParam['tel_serv_stat'] = false;
    // }
    // if (service['department']) {
    //   queryParam['dept'] = service['department'];
    // }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParam,
    };
    this.router.navigate([this.sharedService.getRouteID(), 'booking'], navigationExtras);
  }

  navigate() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }
}
