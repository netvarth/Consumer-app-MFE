import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { AccountService, AuthService, BookingService, ConsumerService, DateTimeProcessor, JGalleryService, LocalStorageService, Messages, SharedService, SubscriptionService } from 'jconsumer-shared';
import { AddInboxMessagesComponent } from '../../shared/add-inbox-messages/add-inbox-messages.component';
@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss']
})
export class RootComponent implements OnInit, OnDestroy {
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
  users_loaded: boolean;
  blogs: any = [];
  videos: any = [];
  image_list_popup: any = [];
  private subscriptions: Subscription = new Subscription();
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
    private jGalleryService: JGalleryService
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
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  ngOnInit(): void {
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.settings = this.accountService.getJson(this.account['settings']);
    this.showDepartments = this.settings.filterByDept;
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    // this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.donationServicesJson = this.accountService.getJson(this.account['donationServices']);
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    this.terminologiesjson = this.account['terminologies'];
    this.setBasicProfile();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.deptUsers = this.accountService.getJson(this.account['departmentProviders']);
    if (this.showDepartments) {
      this.setDepartments(this.deptUsers);
    }
    this.selectedLocation = this.accountService.getActiveLocation();
    this.templateJson = this.sharedService.getTemplateJSON();
    this.galleryJson = this.accountService.getJson(this.account['gallery']);
    this.loadImages(this.galleryJson);
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    if (this.templateJson.section1.blog) {
      this.blogs = this.templateJson.section1.blog;
    }
    if (this.templateJson.section1.videos) {
      this.videos = this.templateJson.section1.videos;
    }
    if (this.templateJson.section1.donations || this.templateJson.section2.donations || this.templateJson.section3.donations) {
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
      let url = section.link;
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
      this.router.navigateByUrl(action.link);
    } else if (action.type === 'menu') {
      this.actionPerformed(action);
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
          _this.deptUsers = _this.accountService.getJson(response['departmentProviders']);
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
    } else if (action === 'qrcode') {
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
}
