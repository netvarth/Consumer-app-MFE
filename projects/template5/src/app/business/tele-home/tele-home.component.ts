import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { findPhoneNumbersInText } from 'libphonenumber-js';
import { AuthService } from '../../services/auth-service';
import { SharedService } from 'jaldee-framework/shared';
import { AccountService } from '../../services/account-service';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { TeleBookingService } from '../../services/tele-bookings-service';
import { projectConstantsLocal } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { GroupStorageService } from 'jaldee-framework/storage/group';
import { DateFormatPipe } from 'jaldee-framework/pipes/date-format';
import { TranslateService } from '@ngx-translate/core';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { projectConstants } from '../../constants/project-constants';
@Component({
  selector: 'app-tele-home',
  templateUrl: './tele-home.component.html',
  styleUrls: ['./tele-home.component.css']
})
export class TeleHomeComponent implements OnInit {
  path = projectConstants.PATH;
  elementType = 'url';
  qr_value: string;
  load_complete = 0;
  api_loading = true;
  newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
  videoList: any = [];
  phoneNumber;
  videoCall: any;
  phone: any;
  uuid: any;
  meetingList: any = [];
  video: any;
  isLoggedIn: boolean;
  gBookings: any;
  messageDialog: any;
  isToday = false;
  noBookings = true;
  isJaldeeConsumer: boolean;
  loggedUser;
  password;
  countryCode: string;
  phoneObj: any;
  customId: any;
  accountId: any;
  accountConfig: any;
  account: any;
  accountProfile: any;
  theme: any;
  myDate: any;
  constructor(
    private accountService: AccountService,
    private teleService: TeleBookingService,
    private activated_route: ActivatedRoute,
    private dialog: MatDialog,
    private router: Router,
    private authService: AuthService,
    private groupService: GroupStorageService,
    public date_format: DateFormatPipe,
    private sharedService: SharedService,
    private snackbarService: SnackbarService,
    public translate: TranslateService,
    private lStorageService: LocalStorageService
  ) {
    this.activated_route.params.subscribe(
      qparams => {
        if (qparams['phonenumber'] !== 'new') {
          this.phoneObj = findPhoneNumbersInText('+' + qparams['phonenumber']);
        }
      });
  }
  ngOnInit() {
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountConfig = this.accountService.getAccountConfig();
    this.customId = this.accountService.getCustomId();
    this.accountId = this.accountProfile.id;
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.phoneObj.length > 0) {
      this.phone = this.phoneObj[0].number.nationalNumber;
      this.countryCode = this.phoneObj[0].number.countryCallingCode;
      this.authService.goThroughLogin().then(
        (status) => {
          if (status) {
            const activeUser = this.groupService.getitemFromGroupStorage('ynw-user');
            this.isLoggedIn = true;
            this.loggedUser = activeUser;
            this.initProviderConsumer();
          } else {
            this.isLoggedIn = false;
          }
        }
      )
    }  else {
      this.snackbarService.openSnackBar("Meeting Room not available for this number", { 'panelClass': 'snackbarerror' });
    }
  }
  actionPerformed(status) {
    const activeUser = this.groupService.getitemFromGroupStorage('ynw-user');
    this.isLoggedIn = true;
    this.loggedUser = activeUser;
    this.initProviderConsumer();
  }
  initProviderConsumer() {
    this.getVideo();
  }
  /**
   * 
   */
  getVideo() {
    const _this = this;
    _this.api_loading = true;
    _this.teleService.getAvailableBookings(_this.countryCode, _this.phone)
      .then((bookings: any) => {
        _this.api_loading = false;
        console.log(bookings);
        if (bookings.length > 0) {
          _this.noBookings = false;
          _this.gBookings = _this.sharedService.groupBy(bookings, 'bookingDate');
          console.log(new Date());
          _this.myDate = _this.date_format.transformTofilterDate(new Date());
          if (Object.keys(_this.gBookings)[0] === _this.myDate) {
            _this.isToday = true;
          }
          console.log(Object.keys(_this.gBookings)[0]);
        } else {
          _this.noBookings = true;
        }
      },
        () => {
          _this.api_loading = false;
        });
  }
  /**
   * 
   */
  startVideo() {
    this.router.navigate([this.customId, 'meeting', this.phoneNumber, this.videoCall.uid]);
  }
  /**
   * 
   * @param booking 
   */
  viewBooking(booking) {
    const navigationExtras: NavigationExtras = {
      queryParams: {
        uuid: booking.id
      }
    };
    if (booking.bookingType === 'appt') {
      this.router.navigate([this.customId, 'apptdetails'], navigationExtras);
    } else {
      this.router.navigate([this.customId, 'checkindetails'], navigationExtras);
    }
  }
  /**
   * 
   * @param booking 
   */
  joinJaldeeVideo(booking) {
    console.log(booking);
    const navigationExtras: NavigationExtras = {
      queryParams: {
        src: 'room'      }
    };
    this.router.navigate([this.customId, 'meeting', this.countryCode + "" + this.phone, booking.id], navigationExtras);
  }
  /**
   * 
   * @param booking 
   */
  sendMessage(booking) {
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = booking.businessId;
    pass_ob['name'] = booking.businessName;
    pass_ob['typeOfMsg'] = 'single';
    if (booking.bookingType === 'appt') {
      pass_ob['appt'] = booking.bookingType;
      pass_ob['uuid'] = booking.id;
    } else if (booking.type === 'orders') {
      pass_ob['orders'] = booking.bookingType;
      pass_ob['uuid'] = booking.id;
    } else {
      pass_ob['uuid'] = booking.id;
    }
    pass_ob['theme']=this.theme;
    this.openMessageDialog(pass_ob);
  }

  /**
   * 
   * @param pass_ob 
   */
  openMessageDialog(pass_ob) {
    this.messageDialog = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob
    });
    this.messageDialog.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }
}
