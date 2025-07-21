import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { AccountService } from '../../services/account-service';
import { AuthService } from '../../services/auth-service';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { ConsumerService } from '../../services/consumer-service';
import { SubSink } from 'subsink';

@Component({
  selector: 'app-business-landing-page',
  templateUrl: './business-landing-page.component.html',
  styleUrls: ['./business-landing-page.component.css']
})
export class BusinessLandingPageComponent implements OnInit {
  tDate: string;
  todayDate = new Date();
  account: any;
  accountProfile: any;
  accountId: any;
  private subs = new SubSink();
  today_waitlists: any = [];
  today_totalbookings: any = [];
  today_appointments: any = [];
  future_appointments: any = [];
  future_waitlists: any = [];
  future_totalbookings: any = [];
  appointmentslist: any = [];
  customId: any;
  upComingApptsCount: any;
  accountConfig: any;
  // isFirstTime = true;
  constructor(private dateTimeProcessor: DateTimeProcessor,
    private consumerService: ConsumerService,
    private accountService: AccountService,
    private router: Router,
    private lStorageService: LocalStorageService,
    public translate: TranslateService,
    private authService: AuthService,
    private acivatedRoute: ActivatedRoute
  ) {
    // this.acivatedRoute.queryParams.subscribe(params => {
    //   if (params && params['dashboard']) {
    //     console.log("params", params)
    //     this.isFirstTime = false;

    //   }
    // })
  }
  ngOnInit(): void {
    const _this = this;
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.accountConfig = this.accountService.getAccountConfig();
    this.customId = this.accountService.getCustomId();
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);

    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    let notification = this.accountService.getJson(this.lStorageService.getitemfromLocalStorage('appNotification'));

    // let isFirstTime = this.lStorageService.getitemfromLocalStorage('dash_visible');
    // console.log("isFirstTime",isFirstTime)
    if (notification) {
      this.handleNotification(notification);
    } else {
      if (this.lStorageService.getitemfromLocalStorage('dash_visible') && this.accountConfig['loginRequired']) {     
        this.lStorageService.removeitemfromLocalStorage('dash_visible')  
        // isFirstTime = '' 
        _this.getBookingsCount().then(
          (status) => {
            if (status) {
              let dashboardUrl = _this.customId + '/dashboard';
              _this.router.navigateByUrl(dashboardUrl);
            } else {
              _this.router.navigate([_this.accountService.getCustomId(), _this.accountService.getTemplateJson().template]);
            }
          }
        )
      } 
      else {
        if (_this.lStorageService.getitemfromLocalStorage('fromLogin')) {
          _this.lStorageService.removeitemfromLocalStorage('action-src');
          _this.lStorageService.setitemonLocalStorage('tabIndex', 'Home');
        }
        _this.lStorageService.removeitemfromLocalStorage('fromLogin');        
        _this.router.navigate([_this.accountService.getCustomId(), _this.accountService.getTemplateJson().template]);
      }
    }
  }
  getWLCount() {
    const _this = this;
    let settings = this.accountService.getJson(this.account['settings']);
    return new Promise((resolve, reject) => {
      let waitlistparams = { 'waitlistStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        waitlistparams['account-eq'] = _this.accountId;
      }
      if (settings['enabledWaitlist']) {
        _this.getTodayWL().then((status) => {
          if (status) {
            resolve(true);
          } else {
            _this.getFutureWL().then((status) => {
                if (status) {
                  resolve(true);
                } else {
                  resolve(false);
                }
            });
          }
        })
      } else {
        resolve(false);
      }              
    })
  }
  getApptCount() {
    const _this = this;
    let appointmentsettings = this.accountService.getJson(this.account['appointmentsettings']);
    return new Promise((resolve, reject) => {
      let waitlistparams = { 'apptStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        waitlistparams['account-eq'] = _this.accountId;
      }
      if (appointmentsettings['enableAppt']) {
        _this.getTodayAppt().then((status) => {
          if (status) {
            resolve(true);
          } else {
            _this.getFutureAppt().then((status) => {
                if (status) {
                  resolve(true);
                } else {
                  resolve(false);
                }
            });
          }
        })
      } else {
        resolve(false);
      }              
    })
  }
  getBookingsCount() {    
    const _this = this;    
    return new Promise((resolve, reject) => {
      _this.getWLCount().then((status)=> {
        if (status) {
          resolve(true);
        } else {
          _this.getApptCount().then((status)=> {
            resolve(status);
          })
        }
      })
    })
  }
  getTodayWL() {
    const _this = this;
    return new Promise((resolve, reject) => {
      let params = { 'waitlistStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        params['account-eq'] = _this.accountId;
      }
      _this.subs.sink = _this.consumerService.getTodayWaitlistCount(params)
        .subscribe(
          (todayCount: any) => {
            if (todayCount > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }, error => {
            resolve(false)
          }
        );
    })
  }
  getFutureWL() {
    const _this = this;
    return new Promise((resolve, reject) => {
      let params = { 'waitlistStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        params['account-eq'] = _this.accountId;
      }
      _this.subs.sink = _this.consumerService.getFutureWaitlistCount(params)
        .subscribe(
          (futureCount: any) => {
            if (futureCount > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }, error => {
            resolve(false)
          }
        );
    })
  }
  getTodayAppt() {
    const _this = this;
    return new Promise((resolve, reject) => {
      let apptparams = { 'apptStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        apptparams['account-eq'] = _this.accountId;
      }
      _this.subs.sink = _this.consumerService.getAppointmentTodayCount(apptparams)
        .subscribe(
          (todayCount: any) => {
            if (todayCount > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }, error => {
            resolve(false);
          }
        );
    })
  }
  getFutureAppt() {
    const _this = this;
    return new Promise((resolve, reject) => {
      let params = { 'apptStatus-neq': 'failed,prepaymentPending' };
      if (_this.accountId) {
        params['account-eq'] = _this.accountId;
      }
      _this.subs.sink = _this.consumerService.getAppointmentFutureCount(params)
        .subscribe(
          (futureCount: any) => {
            if (futureCount > 0) {
              resolve(true);
            } else {
              resolve(false);
            }
          }, error => {
            resolve(false);
          }
        );
    })
  }

  handleNotification(notification) {
    const _this = this;
    this.lStorageService.removeitemfromLocalStorage('appNotification');
    let uuid;
    let url;
    switch (notification.click_action) {
      case 'BILL':
        uuid = notification['uuid'];
        if (uuid.indexOf('_appt') !== -1) {
          url = _this.accountService.getCustomId() + "/appointment/bill?back=0&uuid=" + uuid;
          console.log(url);
          _this.authService.goThroughLogin().then(
            (status) => {
              if (status) {
                this.router.navigateByUrl(url);
              } else {
                this.lStorageService.setitemonLocalStorage('target', url);
                this.router.navigate([_this.accountService.getCustomId(), 'login']);
              }
            })
        }
        break;
      case 'CONSUMER_APPT':
        uuid = notification['uuid'];
        url = _this.accountService.getCustomId() + "/apptdetails?back=0&uuid=" + uuid;
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.accountService.getCustomId(), 'login']);
            }
          })
        break;
      case 'CONSUMER_CHECKIN':
        uuid = notification['uuid'];
        url = _this.accountService.getCustomId() + "/checkindetails?back=0&uuid=" + uuid;
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.accountService.getCustomId(), 'login']);
            }
          })
        break;
        case 'CONSUMER_WAITLIST':
        uuid = notification['uuid'];
        url = _this.accountService.getCustomId() + "/checkindetails?back=0&uuid=" + uuid;
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.accountService.getCustomId(), 'login']);
            }
          })
        break;
      case "CONSUMER_ORDER":
      case "CONSUMER_ORDER_STATUS":
        uuid = notification['uuid'];
        url = _this.accountService.getCustomId() + "/orderdetails?back=0&uuid=" + uuid;
        console.log(url);
        _this.authService.goThroughLogin().then(
          (status) => {
            if (status) {
              this.router.navigateByUrl(url);
            } else {
              this.lStorageService.setitemonLocalStorage('target', url);
              this.router.navigate([_this.accountService.getCustomId(), 'login']);
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
        this.router.navigate([this.accountService.getCustomId(), this.accountService.getTemplateJson().template]);
        break;
    }
  }
}