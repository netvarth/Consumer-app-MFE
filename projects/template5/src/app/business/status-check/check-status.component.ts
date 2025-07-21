import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { Messages, projectConstantsLocal } from 'jconsumer-shared';

@Component({
  selector: 'app-check-status-component',
  templateUrl: './check-status.component.html',
  styleUrls: ['./check-status.component.css']
})
export class CheckYourStatusComponent implements OnInit, OnDestroy {
  api_loading: boolean;
  type = '';
  encId;
  waitlist: any;
  statusInfo: any;
  foundDetails = false;
  estimatesmallCaption = Messages.ESTIMATED_TIME_SMALL_CAPTION;
  server_date;
  placeText;
  check_in_statuses = projectConstantsLocal.CHECK_IN_STATUSES;
  provider_label = '';
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  source = '';
  history = false;
  storeContactInfo: any = [];
  s3url;
  retval;
  provider_id;
  terminologiesjson: ArrayBuffer;
  private subs = new SubSink();
  moment: any;
  mapurl;
  loctionUrl: any;
  cancelledReasons = projectConstantsLocal.WAITLIST_CANCEL_RESON;
  statusLocationUrl: any;
  accountConfig: any;
  theme: any;
  accountEncid: any;
  businessProfile: any;
  businessLogo: any;
  businessName: any;
  businessPlace: any;
  customId: any;
  account: any;
  constructor(
    private activated_route: ActivatedRoute, public router: Router,
    private snackbarService: SnackbarService,
    private lStorageService: LocalStorageService,
    private wordProcessor: WordProcessor,
    private consumerService: ConsumerService,
    private accountService: AccountService,
    private sanitizer: DomSanitizer,
    private configService: DomainConfigGenerator,
    private dateTimeProcessor: DateTimeProcessor) {
    this.moment = this.dateTimeProcessor.getMoment();
    this.activated_route.params.subscribe(
      qparams => {
        // this.type = qparams.type;
        this.source = qparams['id'];
        if (qparams['id'] !== 'new') {
          this.encId = qparams['id'];
          if (this.encId.split('-')[0] === 'c') {
            this.type = 'wl';
          } else if (this.encId.split('-')[0] === 'a') {
            this.type = 'appt';
          } else {
            this.type = 'order';
          }
          if (this.type === 'wl') {
            this.placeText = 'Check-in Id';
          } else {
            this.placeText = 'Appointment Id';
          }
        } else {
          this.placeText = 'Enter Id';
        }
      });
      this.account = this.accountService.getAccountInfo();
      this.accountConfig = this.accountService.getAccountConfig();
      console.log("this.accountthis.accountConfig",this.account,this.accountConfig)

      if (this.accountConfig && this.accountConfig['theme']) {
        this.theme = this.accountConfig['theme'];
      }
      if (this.account) {
        this.businessProfile = this.accountService.getJson(this.account['businessProfile']);
        console.log("this.businessProfile", this.businessProfile)
        if (this.businessProfile && this.businessProfile.businessLogo && this.businessProfile.businessLogo.length > 0) {
          this.businessLogo = this.businessProfile.businessLogo[0].s3path;
        }
        if (this.businessProfile && this.businessProfile.businessName) {
          this.businessName = this.businessProfile.businessName;
        }
        if (this.businessProfile && this.businessProfile.baseLocation && this.businessProfile.baseLocation.place) {
          this.businessPlace = this.businessProfile.baseLocation.place;
        }
      }
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  ngOnInit() {
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.setSystemDate();
    this.server_date = this.lStorageService.getitemfromLocalStorage('sysdate');
    this.api_loading = true;
    if (this.encId) {
      if (this.type === 'wl') {
        this.getWLDetails(this.encId);
      } else if (this.type === 'appt') {
        this.getApptDetails(this.encId);
      } else {
        this.getOrderDetails(this.encId);
      }
    } else {
      this.api_loading = false;
    }
   
  }

  getJson(jsonStr_Obj: any) {
    if (jsonStr_Obj) {
      if (typeof jsonStr_Obj === 'object') {
        return jsonStr_Obj;
      } else {
        return JSON.parse(jsonStr_Obj);
      }
    }
    return null;
  }
  statusInfos(){
    if(this.statusInfo && this.statusInfo.locationUrl){
    this.statusLocationUrl = this.statusInfo.locationUrl;
    }else if(this.statusInfo && this.statusInfo.location && this.statusInfo.location.googleMapUrl){
      this.statusLocationUrl = this.statusInfo.location.googleMapUrl;
    }
    console.log('this.statusLocationUrl',this.statusInfo,this.statusLocationUrl)
  }
  gets3curl() {
    this.subs.sink = this.accountService.getJsonsbyTypes(this.provider_id,
      null, 'terminologies').subscribe(
        (accountS3s) => {
          if (accountS3s['terminologies']) {
            this.terminologiesjson = this.accountService.getJson(accountS3s['terminologies']);
          }
        }
      );
  }
  getTerminologyTerm(term) {
    const term_only = term.replace(/[\[\]']/g, ''); // term may me with or without '[' ']'
    if (this.terminologiesjson) {
      return this.wordProcessor.firstToUpper((this.terminologiesjson[term_only]) ? this.terminologiesjson[term_only] : ((term === term_only) ? term_only : term));
    } else {
      return this.wordProcessor.firstToUpper((term === term_only) ? term_only : term);
    }
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
        if (today.valueOf() < waitlist_date.valueOf()) {
          appx_ret.date = waitlist.date;
          appx_ret.date_type = 'date';
          appx_ret.timeslot = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
        } else {
          appx_ret.date = 'Today';
          appx_ret.date_type = 'string';
          appx_ret.timeslot = waitlist.queue.queueStartTime + ' - ' + waitlist.queue.queueEndTime;
        }
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
  getApptAppxTime(waitlist) {
    const appx_ret = { 'caption': '', 'date': '', 'date_type': 'string', 'time': '', 'timenow': '', 'timeslot': '', 'autoreq': false, 'time_inmins': waitlist.appxWaitingTime, 'cancelled_time': '', 'cancelled_date': '', 'cancelled_caption': '' };
    if (waitlist.apptStatus !== 'Cancelled' && waitlist.apptStatus !== 'Rejected') {
      appx_ret.caption = 'Appointment for'; // 'Check-In Time';
      const waitlist_date = new Date(waitlist.appmtDate);
      const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
      const today = new Date(todaydt);
      today.setHours(0, 0, 0, 0);
      waitlist_date.setHours(0, 0, 0, 0);
      if (today.valueOf() < waitlist_date.valueOf()) {
        appx_ret.date = waitlist.appmtDate;
        appx_ret.date_type = 'date';
        const timeSchedules = waitlist.appmtTime.split('-');
        const queueStartTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[0]);
        const queueEndTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[1]);
        appx_ret.timeslot = queueStartTime + ' - ' + queueEndTime;
      } else {
        appx_ret.date = 'Today';
        appx_ret.date_type = 'string';
        const timeSchedules = waitlist.appmtTime.split('-');
        const queueStartTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[0]);
        const queueEndTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[1]);
        appx_ret.timeslot = queueStartTime + ' - ' + queueEndTime;
      }
    } else {
      let time = [];
      let time1 = [];
      let t2;
      appx_ret.caption = 'Appointment for ';
      appx_ret.date = waitlist.date;
      const timeSchedules = waitlist.appmtTime.split('-');
      const queueStartTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[0]);
      const queueEndTime = this.dateTimeProcessor.convert24HourtoAmPm(timeSchedules[1]);
      appx_ret.time = queueStartTime + ' - ' + queueEndTime;
      appx_ret.cancelled_date = this.moment(waitlist.statusUpdatedTime, 'YYYY-MM-DD').format();
      time = waitlist.statusUpdatedTime.split('-');
      time1 = time[2].trim();
      t2 = time1.slice(2);
      appx_ret.cancelled_time = t2;
      if (waitlist.apptStatus === 'Rejected') {
        appx_ret.cancelled_caption = 'Rejected on ';
      } else {
        appx_ret.cancelled_caption = 'Cancelled on ';
      }
    }
    return appx_ret;
  }
  getDetails(encId) {
    if (encId) {
      this.api_loading = true;
      if (encId.split('-')[0] === 'c') {
        this.getWLDetails(encId);
      } else if (encId.split('-')[0] === 'a') {
        this.getApptDetails(encId);
      } else {
        this.getOrderDetails(encId);
      }
    }
  }
  getWLDetails(encId) {
    this.foundDetails = false;
    this.history = false;
    this.consumerService.getCheckinbyEncId(encId)
      .subscribe(
        (data: any) => {
          const wlInfo = data;
          this.statusInfo = data;
          console.log('status info', this.statusInfo)
          this.provider_id = this.statusInfo.providerAccount.uniqueId;
          // this.gets3curl();
          if (this.statusInfo.ynwUuid.startsWith('h_')) {
            this.history = true;
          }
          this.statusInfos()
          this.foundDetails = true;
          this.type = 'wl';
          this.api_loading = false;
          const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
          const today = new Date(todaydt);
          const waitlist_date = new Date(wlInfo.date);
          today.setHours(0, 0, 0, 0);
          waitlist_date.setHours(0, 0, 0, 0);
          wlInfo.future = false;
          const retval = this.getAppxTime(wlInfo);
          if (today.valueOf() < waitlist_date.valueOf()) {
            wlInfo.future = true;
            wlInfo.estimated_time = retval.time;
            wlInfo.estimated_timenow = retval.timenow;
            wlInfo.estimated_timeslot = retval.timeslot;
            wlInfo.estimated_caption = retval.caption;
            wlInfo.estimated_date = retval.date;
            wlInfo.estimated_date_type = retval.date_type;
            wlInfo.estimated_autocounter = retval.autoreq;
          } else {
            wlInfo.estimated_time = retval.time;
            wlInfo.estimated_timenow = retval.timenow;
            wlInfo.estimated_timeslot = retval.timeslot;
            wlInfo.estimated_caption = retval.caption;
            wlInfo.estimated_date = retval.date;
            wlInfo.estimated_date_type = retval.date_type;
            wlInfo.estimated_autocounter = retval.autoreq;
            wlInfo.estimated_timeinmins = retval.time_inmins;
          }
          wlInfo.cancelled_caption = retval.cancelled_caption;
          wlInfo.cancelled_date = retval.cancelled_date;
          wlInfo.cancelled_time = retval.cancelled_time;
          this.api_loading = false;
          this.statusInfo = wlInfo;
        },
        (error) => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          this.foundDetails = false;
          this.api_loading = false;
        });
  }
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
  }
  getWaitTime(waitlist) {
    if (this.type === 'wl') {
      // if (waitlist.calculationMode !== 'NoCalc') {
      if (waitlist.calculationMode !== 'NoCalc' && (waitlist.waitlistStatus === 'arrived' || waitlist.waitlistStatus === 'checkedIn')) {
        if (waitlist.appxWaitingTime === 0) {
          return 'Now';
        } else if (waitlist.appxWaitingTime !== 0) {
          return this.dateTimeProcessor.convertMinutesToHourMinute(waitlist.appxWaitingTime);
        }
      }
    } else {
      return false;
    }
  }
  getOrderDetails(encId) {
    this.foundDetails = false;
    this.history = false;
    this.consumerService.getSorderbyEncId(encId)
      .subscribe(
        (data: any) => {
          this.statusInfo = data;
          console.log('status info', this.statusInfo)
          this.foundDetails = true;
          this.type = 'order';
          this.api_loading = false;
          this.statusInfos()
        },
        (error) => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          this.foundDetails = false;
          this.api_loading = false;
        });
  }
  setSystemDate() {
    const _this = this;
    return new Promise<void>(function (resolve, reject) {
      _this.subs.sink = _this.accountService.getSystemDate()
        .subscribe(
          res => {
            _this.server_date = res;
            _this.lStorageService.setitemonLocalStorage('sysdate', res);
            resolve();
          },
          () => {
            reject();
          }
        );
    });
  }
  getApptDetails(encId) {
    this.foundDetails = false;
    this.consumerService.getApptbyEncId(encId)
      .subscribe(
        (data: any) => {
          this.api_loading = false;
          // this.type = 'appt';
          const wlInfo = data;
          console.log("wlInfo", data)
          console.log("this.server_date", this.server_date)
          const todaydt = new Date(this.server_date.split(' ')[0]).toLocaleString(this.dateTimeProcessor.REGION_LANGUAGE, { timeZone: this.dateTimeProcessor.TIME_ZONE_REGION });
          const today = new Date(todaydt);
          const waitlist_date = new Date(wlInfo.date);
          today.setHours(0, 0, 0, 0);
          waitlist_date.setHours(0, 0, 0, 0);
          wlInfo.future = false;
          const retval = this.getApptAppxTime(wlInfo);
          if (today.valueOf() < waitlist_date.valueOf()) {
            wlInfo.future = true;
            wlInfo.estimated_time = retval.time;
            wlInfo.estimated_timenow = retval.timenow;
            wlInfo.estimated_timeslot = retval.timeslot;
            wlInfo.estimated_caption = retval.caption;
            wlInfo.estimated_date = retval.date;
            wlInfo.estimated_date_type = retval.date_type;
            wlInfo.estimated_autocounter = retval.autoreq;
          } else {
            wlInfo.estimated_time = retval.time;
            wlInfo.estimated_timenow = retval.timenow;
            wlInfo.estimated_timeslot = retval.timeslot;
            wlInfo.estimated_caption = retval.caption;
            wlInfo.estimated_date = retval.date;
            wlInfo.estimated_date_type = retval.date_type;
            wlInfo.estimated_autocounter = retval.autoreq;
            wlInfo.estimated_timeinmins = retval.time_inmins;
          }
          wlInfo.cancelled_caption = retval.cancelled_caption;
          wlInfo.cancelled_date = retval.cancelled_date;
          wlInfo.cancelled_time = retval.cancelled_time;
          this.api_loading = false;
          this.statusInfo = wlInfo;
          this.foundDetails = true;
          console.log('status info', this.statusInfo)
          this.provider_id = this.statusInfo.providerAccount.uniqueId;
          // this.gets3curl();
          this.statusInfos()
          this.api_loading = false;
        },
        (error) => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          this.foundDetails = false;
          this.api_loading = false;
        });
  }
  getStatusLabel(status) {
    const label_status = this.wordProcessor.firstToUpper(this.wordProcessor.getTerminologyTerm(status));
    return label_status;
  }
  okClick() {
    if (this.lStorageService.getitemfromLocalStorage('ynw-credentials')) {
      this.router.navigate(['/consumer']);
    } else {
      this.router.navigate(['']);
    }
  }
  showStatusInput() {
    this.type = '';
    this.foundDetails = false;
  }
  getCancelledTime(statusInfo) {
    const appx_ret = { 'date': '', 'time': '' };
    let time = [];
    let time1 = [];
    let t2;
    appx_ret.date = this.moment(statusInfo.statusUpdatedTime).format(projectConstantsLocal.DISPLAY_DATE_FORMAT)
    time = statusInfo.statusUpdatedTime.split('-');
    time1 = time[2].trim();
    t2 = time1.slice(2);
    appx_ret.time = t2;
    return appx_ret;
  }
  getStoreContactInfo(accountId) {
    this.consumerService.getStoreContact(accountId).subscribe(data => {
      this.storeContactInfo = data;
    });
  }
  isuser(user) {
    let lastname
    const firstname = user.filter(obj => obj.firstName);
    lastname = user.filter(obj => obj.lastName);
    console.log(firstname);
    if (firstname.length > 0 || lastname.length > 0) {
      return true
    }
    return false
  }

  getCancelledReasonDisplayName(name) {
    let cancelReasons = this.cancelledReasons.filter(reason => reason.value == name);
    if (cancelReasons.length > 0) {
      return cancelReasons[0].title;
    }
    return name;
  }
  getUserImg(user) {
    console.log('useruser',user)
    if(user && user.appmtFor){
      if(user.appmtFor[0].gender == 'male'){
        return './assets/images/Asset1@300x.png';
      }else if(user.appmtFor[0].gender == 'female'){
        return './assets/images/Asset2@300x.png';
      }else{
        return './assets/images/Asset1@300x(1).png';
      }
      
    } else if(user && user.waitlistingFor){
     
      if(user.waitlistingFor[0].gender == 'male'){
        return './assets/images/Asset1@300x.png';
      }else if(user.waitlistingFor[0].gender == 'female'){
        return './assets/images/Asset2@300x.png';
      }else{
        return './assets/images/Asset1@300x(1).png';
      }
    } else if(user && user.orderFor){
     
      if(user.orderFor.gender == 'male'){
        return './assets/images/Asset1@300x.png';
      }else if(user.orderFor.gender == 'female'){
        return './assets/images/Asset2@300x.png';
      }else{
        return './assets/images/Asset1@300x(1).png';
      }
    } else{
      return './assets/images/Asset1@300x(1).png';
    }
   
  }
  getUrl(status) {
   console.log('statusstatus',status)
    var { latitude, longitude } = this.extractLatLng(status);
    var embedUrl = this.constructEmbedUrl(latitude, longitude);
    return embedUrl;
  }
  constructEmbedUrl(latitude, longitude) {

    this.mapurl = this.sanitizer.bypassSecurityTrustResourceUrl('https://www.google.com/maps/embed/v1/view?zoom=11&center=' + latitude + ',' + longitude + '&key=' + projectConstantsLocal.GOOGLEAPIKEY);
    return this.mapurl;
  }
  extractLatLng(url) {
    // Extract the latitude and longitude from the URL
    var coordinates = url.split("/place/")[1].split("/@")[0];
    var [latitude, longitude] = coordinates.split(",");
    return { latitude: parseFloat(latitude), longitude: parseFloat(longitude) };
  }
  getDirections(status){
    if(status && status.location && status.location.googleMapUrl){
      this.loctionUrl = status.location.googleMapUrl;
    } else if(status && status.queue.location && status.queue.location.googleMapUrl){
      this.loctionUrl = status.queue.location.googleMapUrl;
    }
    console.log('loctionUrl',this.loctionUrl)
     return this.loctionUrl
  }
  closeWindow() {
    // Close the current window or perform other close actions
    window.close();
}

setOrderStatus(original) {
  let modifiedStr = original
      .replace(/_/g, ' ')              
      .toLowerCase()                  
      .split(' ')                     
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))  
      .join(' ');                      
  return modifiedStr;
}

}