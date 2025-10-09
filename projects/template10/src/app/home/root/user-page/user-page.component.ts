import { Location } from '@angular/common';
import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { AccountService, AuthService, BookingService, CommonService, ConfirmBoxComponent, ConsumerService, DateTimeProcessor, GroupStorageService, JGalleryService, LocalStorageService, Messages, projectConstantsLocal, SharedService, SubscriptionService, WordProcessor } from 'jconsumer-shared';
import { DeviceDetectorService } from 'ngx-device-detector';
import { Subscription } from 'rxjs';
import { UserLocationComponent } from './user-location/user-location.component';
import { AddInboxMessagesComponent } from '../../../shared/add-inbox-messages/add-inbox-messages.component';
import { QRCodeGeneratordetailComponent } from '../../../shared/qrcode/qrcodegeneratordetail.component';
import { CouponsComponent } from '../../../shared/coupons/coupons.component';

@Component({
  selector: 'app-user-page',
  templateUrl: './user-page.component.html',
  styleUrls: ['./user-page.component.css']
})
export class UserPageComponent implements OnInit, OnDestroy {

  basicProfile: any = {};

  account: any;
  accountConfig: any;
  accountProfile: any;
  locations: any;
  selectedLocation: any;
  accountId: any;
  uniqueId: any;
  customId: any;
  terminologiesjson: any;
  bgCover: any;
  screenWidth: any;
  small_device_display: boolean = false;
  profileSettings: any; // for Profile display according to the device
  coupondialogRef: any;
  s3CouponList: any = {
    JC: [], OWN: []
  };
  qrdialogRef: any;
  virtualFields: any;

  coupon = Messages.COUPONS_CAP;
  send_msgs_cap = Messages.SEND_MSGS_CAP;
  orgsocial_list = projectConstantsLocal.SOCIAL_MEDIA_CONSUMER;
  theme: any;
  isLoggedIn: boolean;
  loaded_appointments: boolean;
  apptServices: any = [];
  apptSettings: any;
  checkinServices: any[];
  loaded_checkins: boolean;
  donationServices: any[];
  loaded_donations: boolean;
  onlineUsers: any[];
  showDepartments: any;
  settings: any;
  waitlisttime_arr: any;
  appttime_arr: any;
  deptUsers: any;
  serverDate: any;
  nextavailableCaption = Messages.NXT_AVAILABLE_TIME_CAPTION;
  departments: any[];

  activeCatalog: any;
  orderstatus: any;
  orderType = '';
  store_pickup: boolean;
  home_delivery: boolean;
  choose_type = 'store';
  catlog: any;
  catalogItem: any;
  order_count: number;
  price: number;
  orderList: any = [];
  counter = 0;
  itemCount: any;
  orderItems: any = [];
  itemQty: number;
  userId;
  catalogimage_list_popup = [];
  catalogImage = '../../../assets/images/order/catalogueimg.svg';
  advance_amount: any;
  deliveryCharge = 0;
  nextAvailableTime;
  sel_checkindate;
  spId_local_id: any;
  onlyVirtualItems = false;
  mobileView: any;
  desktopView: any;
  subscription: Subscription;
  extras: any = {
    'enquiry': true,
    'share':false,
    'icons': true
  };
  callback: any;
  commdialogRef: any;
  back: any;
  userLocations: any = [];
  locationDialog: any;
  userProfile: any;
  virtualfieldsjson: any;
  virtualfieldsDomainjson: any[];
  virtualfieldsCombinedjson: any[];
  virtualfieldsSubdomainjson: any[];
  activeLocation: any;
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 767) {
    } else {
      this.small_device_display = false;
    }
    if (this.screenWidth <= 1040) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }

  constructor(    
    private sharedService: SharedService,
    private accountService: AccountService,
    private router: Router,
    private dialog: MatDialog,
    // private snackbarService: SnackbarService,
    private bookingService: BookingService,
    private authService: AuthService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private deviceService: DeviceDetectorService,
    private activatedRoute: ActivatedRoute,
    private location: Location,
    public wordProcessor: WordProcessor,
    private subscriptionService: SubscriptionService,
    private commonService: CommonService,
    private jGalleryService: JGalleryService
  ) {
    this.mobileView = this.deviceService.isMobile() || this.deviceService.isTablet();
    this.desktopView = this.deviceService.isDesktop();
    this.activatedRoute.queryParams.subscribe(qparams => {
      if (qparams && qparams['callback']) {
        this.callback = qparams['callback'];
      }
      if (qparams['back']) {
        this.back = qparams['back'];
      }
    });
    this.activatedRoute.paramMap.subscribe(params => {
      this.userId = params.get('userEncId');
      console.log("this.userId",this.userId)
    });
    // const response = {
    //     ttype: 'showLocation'
    // }
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    this.subscription = this.subscriptionService.getMessage().subscribe(
      (response) => {
        if (response.ttype === 'locationChanged') {
           alert("In User Page");
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
    const activeUser = this.groupService.getitemFromGroupStorage('ynw-user');
    if (activeUser) {
      this.isLoggedIn = true;
    }
    this.serverDate = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.settings = this.accountService.getJson(this.account['settings']);
    this.apptSettings = this.accountService.getJson(this.account['appointmentsettings']);
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.selectedLocation = this.accountService.getActiveLocation();
    console.log("this.selectedLocation",this.selectedLocation)
    this.activeLocation = this.selectedLocation;
    this.accountId = this.accountProfile.id;
    this.uniqueId = this.accountProfile['uniqueId'];
    // this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    // this.changeLocation(this.accountService.getActiveLocation());
    this.getLocations();
    this.getAppointmentServices(this.selectedLocation.id);
    this.getCheckinServices(this.selectedLocation.id);
    this.setAccountCoupons(this.accountService.getJson(this.account['coupon']));
    this.terminologiesjson = this.account['terminologies'];
    const _this = this;
    this.accountService.getUserInformation(this.uniqueId, this.userId).then(
      (userAccountInfo: any)=> {
        console.log("userAccountInfo",userAccountInfo)
        _this.userProfile = _this.accountService.getJson(userAccountInfo['providerBusinessProfile']);
        console.log("_this.userProfile",_this.userProfile)
        _this.setBasicProfile(_this.userProfile);
        _this.virtualFields =  _this.accountService.getJson(userAccountInfo['providerVirtualFields']);
        _this.setUserVirtualFields(_this.virtualFields);
      }
    );   

    console.log(this.accountProfile);
    if (this.accountProfile.cover) {
      this.bgCover = this.accountProfile.cover.url;
    }
    if (this.callback === 'communicate') {
      this.communicateHandler();
    }
    this.locations = this.accountService.getJson(this.account['location']);    
  }
  getLocations() {
    this.consumerService.getLocationsByUserID(this.userId).subscribe (
      (userlocations: any )=> {
        this.userLocations = userlocations;
        if(this.userLocations && this.userLocations.length > 1)
        {
          this.selectLocations(this.userLocations);
        }
      }
    )
  }
  selectLocations(selectedLocation, status?) {
    this.locationDialog = this.dialog.open(UserLocationComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: {        
        theme: this.theme,
        selectedLocation: selectedLocation
      }
    });
    this.locationDialog.afterClosed().subscribe(result => {
      console.log("result",result)
      if (result !== '' && result !== undefined) {
        this.changeLocation(result)
      }
      else {
        if(status) {          
          this.router.navigate(
            [],
            {
              relativeTo: this.activatedRoute,
              queryParams: { callback: 'none' },
              queryParamsHandling: 'merge'
            });
        }else{
          this.lStorageService.setitemonLocalStorage('tabIndex', "Home")
          this.router.navigateByUrl('Home');
        }
      }      
    });
  }
  setBasicProfile(accountProfile) {
    this.basicProfile['theme'] = this.theme;
    this.basicProfile['businessName'] = accountProfile['businessName'];
    if (accountProfile['businessUserName']) {
      this.basicProfile['businessUserName'] = accountProfile['businessUserName'];
    }
    if (accountProfile.cover) {
      this.bgCover = accountProfile.cover.url;
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
    console.log("Social Media",accountProfile.socialMedia);
  }
  setUserVirtualFields(res) {
    this.virtualfieldsjson = res;
    this.virtualfieldsCombinedjson = [];
    this.virtualfieldsDomainjson = [];
    this.virtualfieldsSubdomainjson = [];
    if (this.virtualfieldsjson.domain) {
      this.virtualfieldsDomainjson = this.commonService.sortVfields(this.virtualfieldsjson.domain);
    }
    if (this.virtualfieldsjson.subdomain) {
      this.virtualfieldsSubdomainjson = this.commonService.sortVfields(this.virtualfieldsjson.subdomain);
    }
    if (this.virtualfieldsSubdomainjson.length && this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsSubdomainjson.concat(this.virtualfieldsDomainjson);
    } else if (this.virtualfieldsSubdomainjson.length && !this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsSubdomainjson;
    } else if (!this.virtualfieldsSubdomainjson.length && this.virtualfieldsDomainjson.length) {
      this.virtualfieldsCombinedjson = this.virtualfieldsDomainjson;
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
  setDepartments(depts) {
    let departmentsS3 = [];
    for (let dIndex = 0; dIndex < depts.length; dIndex++) {
      departmentsS3.push({ 'type': 'department', 'item': depts[dIndex] })
    }
    this.departments = departmentsS3;
  }
  changeLocation(loc: any) {
    const _this = this;
    this.selectedLocation = loc;
    console.log("this.selectedLocation2", this.selectedLocation);
    if (!this.showDepartments) {
      this.lStorageService.setitemonLocalStorage('activeLocation', this.selectedLocation.id);
    this.accountService.setActiveLocation(this.selectedLocation);
      this.getAppointmentServices(this.selectedLocation.id);
      this.getCheckinServices(this.selectedLocation.id);
    }
    if (this.activeLocation.id !== this.selectedLocation.id) {
      this.subscriptionService.sendMessage({ ttype: 'changeLocation', data:this.selectedLocation });
      // this.snackbarService.openSnackBar('Location changed to ' + this.selectedLocation.place, { 'panelClass': 'snackbarnormal' });  
    }
  }
  getAppointmentServices(locationId) {
    console.log("Loc Id:", locationId);
    const _this = this;
    const apptServiceList = [];
    _this.bookingService.getAppointmentServices(locationId).then(
      (appointmentServices: any) => {
        let apptServicesList = appointmentServices.filter(service=> service.provider?.id==this.userId);
        console.log("1apptServicesList",apptServicesList)
        for (let aptIndex = 0; aptIndex < apptServicesList.length; aptIndex++) {
          apptServiceList.push({ 'type': 'appt', 'item': apptServicesList[aptIndex] });
        }
        _this.apptServices = apptServiceList;
        console.log("_this.apptServices",_this.apptServices)
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
        let checkinServicesList = checkinServices.filter(service=> service.provider?.id==this.userId);
        console.log("CheckinServices:", checkinServicesList);
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
  footerClicked(selectedItem: any) {
    let navigationExtras: NavigationExtras = {
      queryParams: { 'target': selectedItem }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'home'], navigationExtras);
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
        userId: this.userId,
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
  setAccountCoupons(res) {
    if (res !== undefined) {
      this.s3CouponList.JC = res;
    } else {
      this.s3CouponList.JC = [];
    }
    this.extras['coupons'] = this.s3CouponList;
  }
  dashboardClicked() {
    const _this = this;
    _this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          this.viewDashboard();
        } else {
          let dashboardUrl = this.sharedService.getRouteID() + '/dashboard';
          this.lStorageService.setitemonLocalStorage('target', dashboardUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      });
  }
  viewDashboard() {
    let dashboardUrl = this.sharedService.getRouteID() + '/dashboard';
    this.router.navigateByUrl(dashboardUrl);
  }
  profileActionPerformed(action) {
    if (action === 'coupons') {
      this.openCoupons()
    } else if (action === 'qrcode') {
      this.qrCodegeneraterOnlineID(this.customId);
    } else if (action === 'communicate') {
      this.communicateHandler();
    } else if (action === 'about') {
      this.router.navigate([this.sharedService.getRouteID(), this.userId, 'about']);
    }
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
        // }
      } 
      // else {
      //   this.donationClicked(actionObj['location'].id, new Date(), actionObj['service']);
      // }
    } else {
      this.router.navigate([this.sharedService.getRouteID(), actionObj['userId']]);
    }
  }
  // donationClicked(locid, curdate, service) {
  //   const navigationExtras: NavigationExtras = {
  //     queryParams: {
  //       loc_id: locid,
  //       sel_date: curdate,
  //       service_id: service.id
  //     }
  //   };
  //   this.router.navigate([this.sharedService.getRouteID(), 'donations', 'new'], navigationExtras);
  // }
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

   private getCurrentIndexCustomLayout(image, images): number {
    return image ? images.indexOf(image) : -1;
  }
  openGallery(image): void {
    let imageIndex = this.getCurrentIndexCustomLayout(image, this.catalogimage_list_popup);
    this.jGalleryService.open(this.catalogimage_list_popup, imageIndex);
  }

  loadImages(imagelist) {
    console.log("Image List:", imagelist);

    this.catalogimage_list_popup = [];
    if (imagelist.length > 0) {
      for (let i = 0; i < imagelist.length; i++) {
        let imgobj = {
          source: imagelist[i].url,
          thumb: imagelist[i].url,
          alt: imagelist[i].caption || ''
        };
        this.catalogimage_list_popup.push(imgobj);
      }
    }
    console.log("Image List:", this.catalogimage_list_popup);
  }


  getCatalogs() {
    this.orderItems = [];
    const orderItems = [];
    if (this.orderstatus && this.userId == null) {
      this.consumerService.getConsumerCatalogs(this.accountId).subscribe(
        (catalogs: any) => {
          if (catalogs.length > 0) {
            this.activeCatalog = catalogs[0];
            this.orderType = this.activeCatalog.orderType;
            if (this.activeCatalog.catalogImages && this.activeCatalog.catalogImages[0]) {
              this.catalogImage = this.activeCatalog.catalogImages[0].url;
              this.catalogimage_list_popup = [];
               let imgobj = {
                source: this.activeCatalog.catalogImages[0].url,
                thumb: this.activeCatalog.catalogImages[0].url,
                alt: this.activeCatalog.catalogImages[0].caption || ''
              };
              this.catalogimage_list_popup.push(imgobj);
            }
            this.catlogArry();
            this.advance_amount = this.activeCatalog.advanceAmount;
            if (this.activeCatalog.pickUp) {
              if (this.activeCatalog.pickUp.orderPickUp && this.activeCatalog.nextAvailablePickUpDetails) {
                this.store_pickup = true;
                this.choose_type = 'store';
                this.sel_checkindate = this.activeCatalog.nextAvailablePickUpDetails.availableDate;
                this.nextAvailableTime = this.activeCatalog.nextAvailablePickUpDetails.timeSlots[0]['sTime'] + ' - ' + this.activeCatalog.nextAvailablePickUpDetails.timeSlots[0]['eTime'];
              }
            }
            if (this.activeCatalog.homeDelivery) {
              if (this.activeCatalog.homeDelivery.homeDelivery && this.activeCatalog.nextAvailableDeliveryDetails) {
                this.home_delivery = true;
                if (!this.store_pickup) {
                  this.choose_type = 'home';
                  this.deliveryCharge = this.activeCatalog.homeDelivery.deliveryCharge;
                  this.sel_checkindate = this.activeCatalog.nextAvailableDeliveryDetails.availableDate;
                  this.nextAvailableTime = this.activeCatalog.nextAvailableDeliveryDetails.timeSlots[0]['sTime'] + ' - ' + this.activeCatalog.nextAvailableDeliveryDetails.timeSlots[0]['eTime'];
                }
              }
            }
            this.consumerService.setOrderDetails(this.activeCatalog);
            if (this.activeCatalog && this.activeCatalog.catalogItem) {
              for (let itemIndex = 0; itemIndex < this.activeCatalog.catalogItem.length; itemIndex++) {
                const catalogItemId = this.activeCatalog.catalogItem[itemIndex].id;
                const minQty = this.activeCatalog.catalogItem[itemIndex].minQuantity;
                const maxQty = this.activeCatalog.catalogItem[itemIndex].maxQuantity;
                const showpric = this.activeCatalog.showPrice;
                if (this.activeCatalog.catalogItem[itemIndex].item.isShowOnLandingpage) {
                  orderItems.push({ 'type': 'item', 'minqty': minQty, 'maxqty': maxQty, 'id': catalogItemId, 'item': this.activeCatalog.catalogItem[itemIndex].item, 'showpric': showpric });
                  this.itemCount++;
                }
              }
            }
            this.orderItems = orderItems;
          }
        }
      );
    }
  }


  // OrderItem add to cart
  addToCart(itemObj) {
    //  const item = itemObj.item;
    const spId = this.lStorageService.getitemfromLocalStorage('order_spId');
    if (spId === null) {
      this.orderList = [];
      this.lStorageService.setitemonLocalStorage('order_spId', this.accountId);
      this.orderList.push(itemObj);
      this.lStorageService.setitemonLocalStorage('order', this.orderList);
      this.getTotalItemAndPrice();
      this.getItemQty(itemObj);
    } else {
      if (this.orderList !== null && this.orderList.length !== 0) {
        if (spId !== this.accountId) {
          if (this.getConfirmation()) {
            this.lStorageService.removeitemfromLocalStorage('order');
          }
        } else {
          this.orderList.push(itemObj);
          this.lStorageService.setitemonLocalStorage('order', this.orderList);
          this.getTotalItemAndPrice();
          this.getItemQty(itemObj);
        }
      } else {
        this.orderList.push(itemObj);
        this.lStorageService.setitemonLocalStorage('order', this.orderList);
        this.getTotalItemAndPrice();
        this.getItemQty(itemObj);
      }
    }
  }


  getConfirmation() {
    let can_remove = false;
    const dialogRef = this.dialog.open(ConfirmBoxComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'confirmationmainclass'],
      disableClose: true,
      data: {
        'message': '  All added items in your cart for different Provider will be removed ! '
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        can_remove = true;
        this.orderList = [];
        this.lStorageService.removeitemfromLocalStorage('order_sp');
        this.lStorageService.removeitemfromLocalStorage('chosenDateTime');
        this.lStorageService.removeitemfromLocalStorage('order_spId');
        this.lStorageService.removeitemfromLocalStorage('order');
        return true;
      } else {
        can_remove = false;
      }
    });
    return can_remove;
  }
  removeFromCart(itemObj) {
    const item = itemObj.item;

    for (const i in this.orderList) {
      if (this.orderList[i].item.itemId === item.itemId) {
        this.orderList.splice(i, 1);
        if (this.orderList.length > 0 && this.orderList !== null) {
          this.lStorageService.setitemonLocalStorage('order', this.orderList);
        } else {
          this.lStorageService.removeitemfromLocalStorage('order_sp');
          this.lStorageService.removeitemfromLocalStorage('chosenDateTime');
          this.lStorageService.removeitemfromLocalStorage('order_spId');
          this.lStorageService.removeitemfromLocalStorage('order');
        }

        break;
      }
    }
    this.getTotalItemAndPrice();
  }
  getTotalItemAndPrice() {
    this.price = 0;
    this.order_count = 0;
    for (const itemObj of this.orderList) {
      let item_price = itemObj.item.price;
      if (itemObj.item.showPromotionalPrice) {
        item_price = itemObj.item.promotionalPrice;
      }
      this.price = this.price + item_price;
      this.order_count = this.order_count + 1;
    }
  }
  checkout() {
    let blogoUrl;
    if (this.basicProfile.logo) {
      blogoUrl = this.basicProfile.logo.url;
    } else {
      blogoUrl = '';
    }
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'blocation': this.selectedLocation.place,
      'logo': blogoUrl
    };
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.lStorageService.setitemonLocalStorage('active_catalog', this.activeCatalog);
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    let cartUrl = this.sharedService.getRouteID() + '/order/shoppingcart';
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          if (this.activeCatalog.catalogItem.length == 1 && this.activeCatalog.catalogType == 'submission') {
            const chosenDateTime = {
              delivery_type: "store",
              catlog_id: this.activeCatalog.id,
              nextAvailableTime: this.nextAvailableTime,
              order_date: this.sel_checkindate,
              advance_amount: this.activeCatalog.advance_amount,
              account_id: this.accountId,
            };

            let queryParam = {}

            if (this.activeCatalog.id) {
              queryParam['catalog_Id'] = this.activeCatalog.id;
            }

            queryParam['source'] = "paper";

            const navigationExtras: NavigationExtras = {
              queryParams: queryParam,
            };

            this.lStorageService.setitemonLocalStorage('chosenDateTime', chosenDateTime);
            this.router.navigate([this.sharedService.getRouteID(), 'order', 'shoppingcart', 'checkout'], navigationExtras);
          }
          else {
            this.router.navigateByUrl(cartUrl);
          }
        } else {
          this.lStorageService.setitemonLocalStorage('target', cartUrl);
          this.router.navigate([this.accountId, 'login']);
        }
      }
    )
  }

  itemDetails(item) {
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'blocation': this.selectedLocation.place,
    };
    this.lStorageService.setitemonLocalStorage('order', this.orderList);
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        item: JSON.stringify(item),
        showpric: this.activeCatalog.showPrice
      }

    };
    this.router.navigate([this.sharedService.getRouteID(), 'order', 'item-details'], navigationExtras);
  }
  increment(item) {
    this.addToCart(item);
  }

  decrement(item) {
    this.removeFromCart(item);
  }
  getItemQty(itemObj) {
    let qty = 0;
    if (this.orderList !== null && this.orderList.filter(i => i.item.itemId === itemObj.item.itemId)) {
      qty = this.orderList.filter(i => i.item.itemId === itemObj.item.itemId).length;
    }
    return qty;
  }
  catlogArry() {

    if (this.lStorageService.getitemfromLocalStorage('order') !== null) {
      this.orderList = this.lStorageService.getitemfromLocalStorage('order');
    }
    this.getTotalItemAndPrice();
  }

  reset() {

  }

  /**
   *
   */
  showOrderFooter() {
    let showFooter = false;
    this.spId_local_id = this.lStorageService.getitemfromLocalStorage('order_spId');
    if (this.spId_local_id !== null) {
      if (this.orderList !== null && this.orderList.length !== 0) {
        if (this.spId_local_id !== this.accountId) {
          showFooter = false;
        } else {
          showFooter = true;
        }
      }
    }
    return showFooter;
  }

  /**
   *
   */
  shoppinglistupload() {
    const chosenDateTime = {
      delivery_type: this.choose_type,
      catlog_id: this.activeCatalog.id,
      nextAvailableTime: this.nextAvailableTime,
      order_date: this.sel_checkindate,
      advance_amount: this.advance_amount,
      account_id: this.accountId

    };
    this.lStorageService.setitemonLocalStorage('chosenDateTime', chosenDateTime);
    let blogoUrl;
    if (this.basicProfile.logo) {
      blogoUrl = this.basicProfile.logo.url;
    } else {
      blogoUrl = '';
    }
    const businessObject = {
      'bname': this.accountProfile.businessName,
      'blocation': this.accountProfile[0].place,
      'logo': blogoUrl
    };
    this.lStorageService.setitemonLocalStorage('order_sp', businessObject);
    let cartUrl = this.sharedService.getRouteID() + '/order/shoppingcart/checkout';
    this.authService.goThroughLogin().then(
      (status) => {
        if (status) {
          this.router.navigateByUrl(cartUrl);
        } else {
          this.lStorageService.setitemonLocalStorage('target', cartUrl);
          this.router.navigate([this.sharedService.getRouteID(), 'login']);
        }
      }
    )
  }
  isPhysicalItemsPresent() {
    let physical_item_present = true;
    const virtualItems = this.activeCatalog.catalogItem.filter(catalogItem => catalogItem.item.itemType === 'VIRTUAL')
    if (virtualItems.length > 0 && this.activeCatalog.catalogItem.length === virtualItems.length) {
      physical_item_present = false;
      this.onlyVirtualItems = true;
    }
    return physical_item_present;
  }
  checkVirtualOrPhysical() {
    // console.log('checkvirtualorphysical');
    let showCatalogItems = false;
    if (this.activeCatalog.nextAvailableDeliveryDetails || this.activeCatalog.nextAvailablePickUpDetails) {
      showCatalogItems = true;
    }
    if (!this.isPhysicalItemsPresent()) {
      showCatalogItems = true;
    }
    return showCatalogItems
  }
  goBack() {
    // let tabIndex = this.lStorageService.getitemfromLocalStorage('tabIndex');
    // if( tabIndex == 'Doctors'){
      
    //   this.lStorageService.setitemonLocalStorage('tabIndex', "Doctors")
    //   this.router.navigateByUrl('Home');
    // }
    // else{
    //       this.lStorageService.setitemonLocalStorage('tabIndex', "Home")
    //       this.router.navigateByUrl('Home');
    // }  
    this.location.back();
  }
}