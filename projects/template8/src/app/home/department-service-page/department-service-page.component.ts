import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationExtras } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { AccountService, AuthService, ConsumerService, DateTimeProcessor, LocalStorageService, Messages, SharedService, SubscriptionService } from 'jconsumer-shared';
import { BookingService } from '../../booking/booking.service';
import { CouponsComponent } from '../../shared/coupons/coupons.component';
import { QRCodeGeneratordetailComponent } from '../../shared/qrcode/qrcodegeneratordetail.component';
import { AddInboxMessagesComponent } from '../../shared/add-inbox-messages/add-inbox-messages.component';

@Component({
  selector: 'app-department-service-page',
  templateUrl: './department-service-page.component.html',
  styleUrls: ['./department-service-page.component.css']
})
export class DepartmentServicePageComponent implements OnInit, OnDestroy {

  mobileView: any;
  desktopView: any;
  serverDate: any;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  basicProfile: any = {};
  bgCover: any;
  subscription: Subscription;
  selectedLocation: any;
  apptServices: any[];
  loaded_appointments: boolean;
  checkinServices: any[];
  loaded_checkins: boolean;
  extras: any = {
    'enquiry': true,
    'share': false,
    'icons': true,
    'more':true
  };
  departmentId: string;
  back: any;
  accountId: any;
  commdialogRef: any;
  coupondialogRef: any;
  qrdialogRef: any;
  s3CouponList: any = {
    JC: [], OWN: []
  };
  terminologiesjson: any;
  deptUsers: any;
  waitlisttime_arr: any;
  appttime_arr: any;
  nextavailableCaption = Messages.NXT_AVAILABLE_TIME_CAPTION;
  onlineUsers: any[];
  settings: any;
  apptSettings: any;
  activeDepartment: any;
  constructor(
    private accountService: AccountService,
    private router: Router,
    private dialog: MatDialog,
    private bookingService: BookingService,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private deviceService: DeviceDetectorService,
    private activatedRoute: ActivatedRoute,
    public translate: TranslateService,
    private location: Location,
    private subscriptionService: SubscriptionService,
    private sharedService: SharedService
  ) {
    this.mobileView = this.deviceService.isMobile() || this.deviceService.isTablet();
    this.desktopView = this.deviceService.isDesktop();
    this.activatedRoute.queryParams.subscribe(qparams => {
      console.log(qparams);
      if (qparams['back']) {
        this.back = qparams['back'];
      }
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.departmentId = params.get('deptId');
    });
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    this.subscription = this.subscriptionService.getMessage().subscribe(
      (response) => {
        if (response.ttype === 'locationChanged') {
           alert("In Departments Page");
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
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.setBasicProfile();
    this.changeLocation(this.accountService.getActiveLocation());
    this.setAccountCoupons(this.accountService.getJson(this.account['coupon']));
    this.terminologiesjson = this.account['terminologies'];
    this.settings = this.accountService.getJson(this.account['settings']);
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    let deparments = this.accountService.getJson(this.account['departmentProviders']);
    this.activeDepartment = deparments.filter(dept => dept.departmentId == this.departmentId)[0];
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
    console.log("Social Media", this.accountProfile.socialMedia);
  }
  setAccountCoupons(res) {
    if (res !== undefined) {
      this.s3CouponList.JC = res;
    } else {
      this.s3CouponList.JC = [];
    }
    this.extras['coupons'] = this.s3CouponList;
    // this.firstChckinCuponCunt(this.s3CouponList);
    // this.nonfirstPresent(this.s3CouponList);
  }
  footerClicked(selectedItem: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: { 'target': selectedItem }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'home'], navigationExtras);
  }
  changeLocation(loc: any) {
    const _this = this;
    this.selectedLocation = loc;
    this.apptServices = [];
    this.checkinServices =[];
    this.deptUsers = [];
    this.onlineUsers = [];

    this.getAppointmentServices(this.selectedLocation.id);
    this.getCheckinServices(this.selectedLocation.id);
    this.getUsersByLocation().then((response) => {
      let deptUsers = _this.accountService.getJson(response['departmentProviders']);
      console.log(deptUsers);
      if (deptUsers && deptUsers.length > 0) {
        _this.deptUsers = deptUsers.filter(user => user.deptId == _this.departmentId);
        _this.setUserWaitTime();
      } 
    })
  }
  setUsers(deptUsers) {
    this.onlineUsers = [];
    if (this.settings.enabledWaitlist || this.apptSettings.enableAppt) {
      for (let dIndex = 0; dIndex < deptUsers.length; dIndex++) {
        deptUsers[dIndex]['waitingTime'] = this.waitlisttime_arr[dIndex];
        deptUsers[dIndex]['apptTime'] = this.appttime_arr[dIndex];
        this.onlineUsers.push({ 'type': 'provider', 'item': deptUsers[dIndex] });
      }
    }
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
  getUserWaitingTime(provids) {
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
  getAppointmentServices(locationId) {
    console.log("Loc Id:", locationId);
    const _this = this;
    const apptServiceList = [];
    _this.bookingService.getAppointmentServices(locationId).then(
      (appointmentServices: any) => {
        let departmentApptServices = appointmentServices.filter(service => ((service.department == this.departmentId) && !(service.provider)));
        console.log(departmentApptServices);
        for (let aptIndex = 0; aptIndex < departmentApptServices.length; aptIndex++) {
          apptServiceList.push({ 'type': 'appt', 'item': departmentApptServices[aptIndex] });
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
        let departmentCheckinServices = checkinServices.filter(service => ((service.department == this.departmentId) && !service.provider));
        console.log("CheckinServices:", departmentCheckinServices);
        for (let wlIndex = 0; wlIndex < departmentCheckinServices.length; wlIndex++) {
          checkinServiceList.push({ 'type': 'waitlist', 'item': departmentCheckinServices[wlIndex] });
        }
        self.checkinServices = checkinServiceList;
        self.loaded_checkins = true;
      }, (error) => {
        self.checkinServices = checkinServiceList;
        self.loaded_checkins = true;
      }
    );
  }
  goBack() {
    this.location.back();
  }
  actionPerformed(actionObj) {
    console.log(actionObj);
    if (actionObj['type'] === 'appt') {
      if (actionObj['action'] === 'view') {
        console.log(actionObj['service']);
        console.log(actionObj['service'].id);
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
      }
    } else {
      let queryParam = {
        back: 1
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParam
      };
      this.router.navigate([this.sharedService.getRouteID(), actionObj['userId']], navigationExtras);
    }
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
  profileActionPerformed(action) {
    if (action === 'coupons') {
      this.openCoupons()
    } else if (action === 'qrcode') {
      this.qrCodegeneraterOnlineID(this.sharedService.getRouteID());
    } else if (action === 'communicate') {
      this.communicateHandler();
    } else if (action === 'about') {
      this.router.navigate([this.sharedService.getRouteID(), 'about']);
    }
  }
  openCoupons(type?: any) {
    this.coupondialogRef = this.dialog.open(CouponsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass'],
      disableClose: true,
      data: {
        couponsList: this.s3CouponList,
        type: type,
        theme: this.theme
      }
    });
    this.coupondialogRef.afterClosed().subscribe(() => {
    });
  }
  qrCodegeneraterOnlineID(accEncUid: any) {
    this.qrdialogRef = this.dialog.open(QRCodeGeneratordetailComponent, {
      width: '40%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'specialclass'],
      disableClose: true,
      data: {
        accencUid: accEncUid,
        // path: projectConstants.PATH,
        businessName: this.accountProfile.businessName,
        businessDesc: this.accountProfile.businessDesc,
        businessUserName: this.accountProfile.businessUserName

      }
    });
  }
  showCommunicate(provid) {
    this.commdialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'specialclass', 'loginmainclass', 'smallform'],
      disableClose: true,
      data: {
        caption: 'Enquiry',
        user_id: provid,
        source: 'consumer-common',
        type: 'send',
        terminologies: this.terminologiesjson,
        name: this.accountProfile.businessName,
        typeOfMsg: 'single',
        theme: this.theme
      }
    });
    this.commdialogRef.afterClosed().subscribe(() => {
      this.router.navigate(
        [],
        {
          relativeTo: this.activatedRoute,
          queryParams: { callback: 'none' },
          queryParamsHandling: 'merge'
        });
    });
  }
  communicateHandler() {
    const _this = this;
    _this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          _this.showCommunicate(this.accountId);
        } else {
          let communicateUrl = this.sharedService.getRouteID() + '?callback=communicate';
          console.log(communicateUrl);
          this.lStorageService.setitemonLocalStorage('target', communicateUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      });
  }
}
