import { Component } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import {
  AuthService,
  ConsumerService,
  DateTimeProcessor,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  SharedService,
  SubscriptionService,
  ToastService
} from 'jconsumer-shared';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent {
  history;
  terminologiesJson: any = [];
  api_loading = false;
  futureAllowed = true;
  usr_details: any;
  loading = true;
  accountId: any;
  theme: any;
  loggedIn: boolean = false;
  greetingText: string = '';
  config: any;
  cdnPath: string = '';

  waitlists;
  appointments: any = [];
  appointmentslist: any = [];
  loadcomplete = { waitlist: false, appointment: false };
  todayDate = new Date();
  tDate: any;
  todayBookings: any = [];
  today_totalbookings: any = [];

  constructor(
    public translate: TranslateService,
    private router: Router,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
    private sharedService: SharedService,
    private subscriptionService: SubscriptionService,
    private consumerService: ConsumerService,
    private dateTimeProcessor: DateTimeProcessor,
    private errorService: ErrorMessagingService,
    private toastService: ToastService,
    private authService: AuthService) {
    this.cdnPath = this.sharedService.getCDNPath();
  }

  actionPerformed(event) {
    this.subscriptionService.sendMessage({ ttype: 'refresh' });
    this.initConsumer("refresh");
  }

  initConsumer(refresh?) {
    this.authService.goThroughLogin().then((status) => {
      if (status) {
        this.api_loading = false;
        this.usr_details = this.groupService.getitemFromGroupStorage('jld_scon');
        if (refresh) {
          this.subscriptionService.sendMessage({ ttype: 'refresh', value: this.usr_details.providerConsumer });
        }
        this.getAppointmentToday();
        this.loggedIn = true;
      } else {
        this.loggedIn = false;
        this.api_loading = false;
      }
    });
  }
  getAppointmentToday() {
    let params = { 'apptStatus-neq': 'failed,prepaymentPending,Cancelled,Rejected' };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.consumerService.getAppointmentToday(params).subscribe(data => {
      this.appointmentslist = data;
      this.appointments = [];
      this.appointments = this.appointmentslist;
      this.getWaitlist();
    });
  }
  getWaitlist() {
    this.loadcomplete.waitlist = false;
    this.tDate = this.dateTimeProcessor.transformToYMDFormat(this.todayDate);
    let params = {
      'waitlistStatus-neq': 'failed,prepaymentPending,cancelled', 'date-eq': this.tDate
    };
    if (this.accountId) {
      params['account-eq'] = this.accountId;
    }
    this.waitListInfo(params);
  }
  waitListInfo(params) {
    const _this = this;
    return new Promise((resolve, reject) => {
      _this.consumerService.getWaitlist(params).subscribe(data => {
        resolve(data);
        _this.waitlists = data;
        if (this.appointments && this.appointments.concat(_this.waitlists)) {
          _this.today_totalbookings = _this.appointments.concat(_this.waitlists);
        }
        _this.loading = false;
        _this.todayBookings = [];
        for (let i = 0; i < _this.today_totalbookings.length; i++) {
          if (i <= 2) {
            _this.todayBookings.push(_this.today_totalbookings[i]);
            console.log(_this.todayBookings);
          }
        }
        _this.loadcomplete.waitlist = true;
      }, () => {
        _this.loadcomplete.waitlist = true;
      }
      ), (error) => {
        let errorObj = _this.errorService.getApiError(error);
        _this.toastService.showError(errorObj);
        reject(error);
      }
    })
  }
  ngOnInit() {
    const _this = this;
    this.api_loading = true;
    this.accountId = this.sharedService.getAccountID();
    this.subscriptionService.sendMessage({ ttype: 'showLocation' });
    this.config = this.sharedService.getTemplateJSON();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    _this.initConsumer();
    _this.userTime();

  }
  redirectto(mod) {
    switch (mod) {
      case 'profile':
        this.router.navigate([this.sharedService.getRouteID(), 'profile']);
        break;
    }
  }
  paymentsClicked() {
    let queryParams = {};
    queryParams['type'] = 'payments'
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.sharedService.getRouteID(), 'payments'], navigationExtras);
  }

  stopprop(event) {
    event.stopPropagation();
  }

  gotoDetails() {
    const source = this.lStorageService.getitemfromLocalStorage('source');
    console.log(source);
    if (source) {
      window.location.href = source;
      this.lStorageService.removeitemfromLocalStorage('reqFrom');
      this.lStorageService.removeitemfromLocalStorage('source');
    } else {
      this.router.navigate([this.sharedService.getRouteID()]);
    }
  }
  actionPerformTo(cstmTxt) {
    if (cstmTxt === 'My Orders') {
      this.router.navigate([this.sharedService.getRouteID(), 'orders']);
    } else if (cstmTxt === 'My Payments') {
      this.paymentsClicked()
    } else if (cstmTxt === 'My Bookings') {
      this.router.navigate([this.sharedService.getRouteID(), 'bookings']);
    } else if (cstmTxt === 'My Documents') {
      this.documentClicked();
    }
  }
  documentClicked() {
    let queryParams = {};
    queryParams['type'] = 'documents'
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.sharedService.getRouteID(), 'payments'], navigationExtras);
  }
  userTime() {
    var today = new Date();
    var curHr = today.getHours();
    if (curHr > 0 && curHr < 12) {
      this.greetingText = 'Good Morning';
    } else if (curHr >= 12 && curHr < 16) {
      this.greetingText = 'Good Afternoon'
      console.log("noon", this.greetingText);
    } else {
      this.greetingText = 'Good Evening'
    }
  }

  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }

  actionPerformedUpcoming() {
    this.actionPerformTo('My Bookings');
  }
}
