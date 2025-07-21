import { Component, OnInit, Inject, Input, Output, HostListener, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { ConsumerService } from '../../services/consumer-service';
import { ConsumerRateServicePopupComponent } from '../consumer-rate-service-popup/consumer-rate-service-popup';
import { ConsumerWaitlistCheckInPaymentComponent } from '../checkin-payment/checkin-payment.component';
import { AccountService } from '../../services/account-service';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { AuthService } from '../../services/auth-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { ViewRxComponent } from 'jaldee-framework/view-rx';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { InvoiceListComponent } from '../invoice-list/invoice-list.component';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';

@Component({
  selector: 'app-consumer-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})

export class ConsumerHistoryComponent implements OnInit, OnDestroy {
  @Input() reloadapi;
  @Input() params;
  @Output() getWaitlistBillEvent = new EventEmitter<any>();
  loadcomplete = { history: false };
  pagination: any = {
    startpageval: 1,
    totalCnt: 0,
    perPage: projectConstantsLocal.PERPAGING_LIMIT
  };
  history: any = [];
  notedialogRef;
  billdialogRef;
  paydialogRef;
  ratedialogRef;
  service_provider_cap = Messages.SERV_PROVIDER_CAP;
  service_cap = Messages.PRO_SERVICE_CAP;
  location_cap = Messages.LOCATION_CAP;
  date_cap = Messages.DATE_COL_CAP;
  status_cap = Messages.PRO_STATUS_CAP;
  send_message_cap = Messages.SEND_MSG_CAP;
  bill_cap = Messages.BILL_CAPTION;
  rate_your_visit = Messages.RATE_YOU_VISIT;
  loading = true;
  apmt_history: any = [];
  entire_history: any = [];
  wtlist_count: any = [];
  appt_count: any = [];
  entire_count: any = [];
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_MM_DD_YY_FORMAT;
  small_device_display = false;
  screenWidth;
  viewrxdialogRef;
  accountId;
  showOrderHist = false;
  private subs = new SubSink();
  customId: any;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  loggedIn: boolean = true;
  isOrder: boolean;
  invoiceDetailsById: any;
  allInvocies: any;
  selectedInoviceId: any;
  uuid: any;
  addnotedialogRef;
  constructor(
    private router: Router, private location: Location,
    public dialog: MatDialog, private activateroute: ActivatedRoute,
    private consumerService: ConsumerService,
    public translate: TranslateService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    private accountService: AccountService,
    private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor, 
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    this.screenWidth = window.innerWidth;
    if (this.screenWidth <= 767) {
      this.small_device_display = true;
    } else {
      this.small_device_display = false;
    }
  }
  ngOnInit() {
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    this.translate.stream('SERV_PROVIDER_CAP').subscribe(v => { this.service_provider_cap = v });
    this.translate.stream('PRO_SERVICE_CAP').subscribe(v => { this.service_cap = v });
    this.translate.stream('LOCATION_CAP').subscribe(v => this.location_cap = v);
    this.translate.stream('DATE_COL_CAP').subscribe(v => this.date_cap = v);
    this.translate.stream('PRO_STATUS_CAP').subscribe(v => this.status_cap = v);
    this.translate.stream('SEND_MSG_CAP').subscribe(v => this.send_message_cap = v);
    this.translate.stream('RATE_YOU_VISIT').subscribe(v => this.rate_your_visit = v);
    this.translate.stream('BILL_CAPTION').subscribe(v => this.bill_cap = v);
    this.subs.sink = this.activateroute.queryParams.subscribe(params => {
      if (params['is_orderShow'] === 'false') {
        this.isOrder= false;
      } else {
        this.isOrder = true;
        this.showOrderHist = true;
      }
      this.initHistory();
    });
  }
  initHistory() {
    this.authService.goThroughLogin().then((status) => {
      console.log("Status:", status);
      if (status) {
        this.loggedIn = true;
        if (this.isOrder) {
          this.getOrderHistory();
        } else {
          this.getHistroy();
        }
      } else {
        this.loggedIn = false;
        this.loading = false;
      }
    });
  }
  actionPerformed(event) {
    this.accountService.sendMessage({ttype:'refresh'});
    this.initHistory();
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  // Getting Checking History
  getHistroy() {
    this.loadcomplete.history = false;
    let api_filter = {};
    if (this.accountId) {
      api_filter['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getWaitlistHistory(api_filter)
      .subscribe(
        data => {
          this.history = data;
          this.getAppointmentHistory(api_filter);
        },
        error => {
          this.loading = false;
          this.loadcomplete.history = true;
        }
      );
  }
  // Getting Appointment History
  getAppointmentHistory(api_filter) {
    this.subs.sink = this.consumerService.getAppointmentHistory(api_filter)
      .subscribe(
        data => {
          console.log(data);
          this.apmt_history = data;
          for (let i = 0; i < this.apmt_history.length; i++) {
            this.apmt_history[i].date = this.apmt_history[i]['appmtDate'];
            delete this.apmt_history[i].appmtDate;
          }
          this.entire_history = this.apmt_history.concat(this.history);
          this.sortCheckins(this.entire_history);
          this.loading = false;
          this.loadcomplete.history = true;
        },
        error => {
          this.loading = false;
        }
      );
  }
  sortCheckins(checkins) {
    checkins.sort(function (message1, message2) {
      if (message1.date < message2.date) {
        return 11;
      } else if (message1.date > message2.date) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  // Get checkin history count
  getHistoryCount() {
    this.subs.sink = this.consumerService.getHistoryWaitlistCount()
      .subscribe(
        data => {
          console.log(data);
          this.wtlist_count = data;
          this.getAppointmentHistoryCount();
        });
  }
  // Get Appointment history count
  getAppointmentHistoryCount() {
    this.subs.sink = this.consumerService.getAppointmentHistoryCount()
      .subscribe(
        data => {
          this.appt_count = data;
          this.entire_count = this.wtlist_count.concat(this.appt_count);
          console.log(this.entire_count);
        });
  }
  handle_pageclick(pg) {
    this.pagination.startpageval = pg;
    this.getHistroy();
  }
  setPaginationFilter(params = {}) {
    const api_filter = {};
    api_filter['from'] = (this.pagination.startpageval) ? (this.pagination.startpageval - 1) * this.pagination.perPage : 0;
    api_filter['count'] = this.pagination.perPage;
    return api_filter;
  }
  addWaitlistMessage(waitlist) {
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['uuid'] = waitlist.ynwUuid;
    pass_ob['user_id'] = waitlist.providerAccount.id;
    pass_ob['userId'] = waitlist.providerAccount.uniqueId;
    pass_ob['typeOfMsg'] = 'single';
    pass_ob['name'] = waitlist.providerAccount.businessName;
    pass_ob['theme'] = this.theme;
    this.addNote(pass_ob);
  }
  addNote(pass_ob) {
    this.notedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob,
    });
    this.notedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }
  
  getOrderBill(orders) {
    console.log(orders);
    // const params = {
    //   account: orders.providerAccount.id
    // };
    this.subs.sink = this.consumerService.getOrderBill(orders.uid)
      .subscribe(
        data => {
          console.log(data);
          const bill_data = data;
          this.viewOrderBill(orders, bill_data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  viewOrderBill(order, type) {
    if (order.invoiceCreated) {
      this.getInvociesBybooking(order.uid).then((data: any) => {

        this.allInvocies = data;

        if (this.allInvocies && this.allInvocies.length === 1) {
          let queryParams = {
            uuid: order.uid,
            type: 'order',
            'paidStatus': false,
            invoiceInfo: order.invoiceCreated,
            invoiceId: this.allInvocies[0].invoiceUid
          }
          const navigationExtras: NavigationExtras = {
            queryParams: queryParams
          };
          this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
        }
        else {

          this.goToInvoiceList().then((result: any) => {
            this.selectedInoviceId = result;
          if (this.selectedInoviceId) {
            let queryParams = {
              uuid: order.uid,
              type: 'order',
              'paidStatus': false,
              invoiceInfo: order.invoiceCreated,
              invoiceId: this.selectedInoviceId
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
          }
        });
        }
      })
    } else if (!order.invoiceCreated) {

      let queryParams = {
        uuid: order.uid,
        type: 'order',
        'paidStatus': false,
        invoiceInfo: order.invoiceCreated,
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
    }






    // let queryParams = {
    //   uuid: order.uid,
    //   type: 'order',
    //   'paidStatus': false
    // }
    // const navigationExtras: NavigationExtras = {
    //   queryParams: queryParams
    // };
    // this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
  }
  viewBill(checkin, bill_data) {
    console.log("appt-details2",checkin)
    if (checkin.invoiceCreated) {
      this.getInvociesBybooking(checkin.ynwUuid).then((data: any) => {

        this.allInvocies = data;

        if (this.allInvocies && this.allInvocies.length === 1) {
          let queryParams = {
            uuid: checkin.ynwUuid,
            type: 'waitlist',
            'paidStatus': false,
            invoiceInfo: checkin.invoiceCreated,
            invoiceId: this.allInvocies[0].invoiceUid
          }
          const navigationExtras: NavigationExtras = {
            queryParams: queryParams
          };
          this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
        }
        else {

          this.goToInvoiceList().then((result: any) => {
            this.selectedInoviceId = result;
          if (this.selectedInoviceId) {
            let queryParams = {
              uuid: checkin.ynwUuid,
              source: 'history',
              'paidStatus': false,
              invoiceInfo: checkin.invoiceCreated,
              invoiceId: this.selectedInoviceId
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
          }
        });
        }
      })
    } 
    else if (!checkin.invoiceCreated) {

      let queryParams = {
        uuid: checkin.ynwUuid,
        source: 'history',
        'paidStatus': false,
        invoiceInfo: checkin.invoiceCreated,
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
    }



    // let queryParams = {
    //   uuid: checkin.ynwUuid,
    //   source: 'history',
    //   invoiceInfo: checkin.invoiceCreated,
    // }
    // const navigationExtras: NavigationExtras = {
    //   queryParams: queryParams
    // };
    // this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
  }
  getInvociesBybooking(ynwUuid) {
    let uuid;
    uuid = ynwUuid;
    return new Promise((resolve, reject) => {
      this.consumerService.getInvoiceDetailsByuuid(uuid).subscribe(
        data => {
          resolve(data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
          reject(error)
        }
      )
    })

  }
  goToInvoiceList() {
    return new Promise((resolve, reject) => {
      this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
        width: '50%',
        panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
        disableClose: true,
        autoFocus: true,
        data: this.allInvocies
      });
      this.addnotedialogRef.afterClosed().subscribe(result => {
       
        resolve(result);
  
        //   if (result === 'reloadlist') {
        //   }
      });
    })

   
  }
  makePayment(checkin, bill_data) {
    this.paydialogRef = this.dialog.open(ConsumerWaitlistCheckInPaymentComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        checkin: checkin,
        bill_data: bill_data,
        theme: this.theme
      }
    });
    this.paydialogRef.afterClosed().subscribe(() => {
      this.getHistroy();
    });
  }
  getStatusLabel(status) {
    let label_status = status;
    switch (status) {
      case 'cancelled': label_status = 'Cancelled'; break;
      case 'arrived': label_status = 'Arrived'; break;
      case 'done': label_status = 'Done'; break;
      case 'checkedIn': label_status = 'checked in'; break;
      case 'started': label_status = 'Started'; break;
    }
    return label_status;
  }
  rateService(waitlist) {
    this.ratedialogRef = this.dialog.open(ConsumerRateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': waitlist,
        'isFrom': 'checkin',
        theme: this.theme
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
        this.getHistroy();
      }
    });
  }
  isRated(wait) {
    if (wait.hasOwnProperty('rating')) {
      return true;
    } else {
      return false;
    }
  }
  providerDetail(provider) {
    this.router.navigate([this.customId]);
  }
  addApptMessage(waitlist) {
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['uuid'] = waitlist.uid;
    pass_ob['user_id'] = waitlist.providerAccount.id;
    pass_ob['userId'] = waitlist.providerAccount.uniqueId;
    pass_ob['name'] = waitlist.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    pass_ob['appt'] = 'appt';
    pass_ob['theme']=this.theme;
    this.addNote(pass_ob);
  }
  getApptBill(waitlist) {
    console.log("appt1",waitlist)
    // const params = {
    //   account: waitlist.providerAccount.id
    // };
    this.subs.sink = this.consumerService.getApptBill(waitlist.uid)
      .subscribe(
        data => {
          const bill_data = data;
          this.viewApptBill(waitlist, bill_data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }

  getWaitlistBill(waitlist) {
    // const params = {
    //   account: waitlist.providerAccount.id
    // };
    console.log("appt2",waitlist)
    this.subs.sink = this.consumerService.getWaitBill(waitlist.ynwUuid)
      .subscribe(
        data => {
          console.log(data);
          const bill_data = data;
          this.viewBill(waitlist, bill_data);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  rateApptService(waitlist) {
    this.ratedialogRef = this.dialog.open(ConsumerRateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': waitlist,
        'isFrom': 'appointment'
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }
  rateOrderService(waitlist) {
    this.ratedialogRef = this.dialog.open(ConsumerRateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': waitlist,
        'isFrom': 'order',
        theme: this.theme
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }
  viewApptBill(checkin, bill_data) {
    console.log("appt-details",checkin)
    if (checkin.invoiceCreated) {
      this.getInvociesBybooking(checkin.uid).then((data: any) => {

        this.allInvocies = data;

        if (this.allInvocies && this.allInvocies.length === 1) {
          let queryParams = {
            uuid: checkin.uid,
            source: 'history',
            'paidStatus': false,
            invoiceInfo: checkin.invoiceCreated,
            invoiceId: this.allInvocies[0].invoiceUid
          }
          const navigationExtras: NavigationExtras = {
            queryParams: queryParams
          };
          this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
        }
        else {

          this.goToInvoiceList().then((result: any) => {
            this.selectedInoviceId = result;
          if (this.selectedInoviceId) {
            let queryParams = {
              uuid: checkin.uid,
              source: 'history',
              'paidStatus': false,
              invoiceInfo: checkin.invoiceCreated,
              invoiceId: this.selectedInoviceId
            }
            const navigationExtras: NavigationExtras = {
              queryParams: queryParams
            };
            this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
          }
        });
        }
      })
    } else if (!checkin.invoiceCreated) {

      let queryParams = {
        uuid: checkin.uid,
        source: 'history',
        'paidStatus': false,
        invoiceInfo: checkin.invoiceCreated,
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
    }








    // let queryParams = {
    //   uuid: checkin.uid,
    //   source: 'history',
    //   invoiceInfo: checkin.invoiceCreated,
    // }
    // const navigationExtras: NavigationExtras = {
    //   queryParams: queryParams
    // };
    // this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
  }
  viewprescription(checkin) {
    console.log(checkin);
    this.viewrxdialogRef = this.dialog.open(ViewRxComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: {
        accencUid: checkin.prescShortUrl ? (window.location.origin + checkin.prescShortUrl) : checkin.prescUrl,
        theme: this.theme
      }
    });
  }
  goback() {
    this.location.back();
  }
  getOrderHistory() {
    this.loadcomplete.history = false;
    const api_filter = {};
    if (this.accountId) {
      api_filter['account-eq'] = this.accountId;
    }
    this.subs.sink = this.consumerService.getOrderHistory(api_filter)
      .subscribe(
        data => {
          console.log(data);
          this.entire_history = data;
          this.loadcomplete.history = true;
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.loadcomplete.history = true;
        }
      );
  }
  showBookingDetails(booking, type?) {
    let queryParams = {};
    if (booking.apptStatus) {
      queryParams['uuid'] = booking.uid;
      queryParams['type'] = type;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'apptdetails'], navigationExtras);
    } else if (booking.waitlistStatus) {
      queryParams['uuid'] = booking.ynwUuid;
      queryParams['type'] = type;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'checkindetails'], navigationExtras);
    } else {
      console.log('this is order');
      console.log(booking);
      queryParams['uuid'] = booking.uid;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'orderdetails'], navigationExtras);
    }
  }
  addordertMessage(waitlist) {
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['uuid'] = waitlist.uid;
    pass_ob['user_id'] = waitlist.providerAccount.id;
    pass_ob['userId'] = waitlist.providerAccount.uniqueId;
    pass_ob['name'] = waitlist.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    pass_ob['orders'] = 'orders';
    pass_ob['theme'] = this.theme;
    this.addNote(pass_ob);
  }

  getSingleTime(slot) {
    if(slot !==undefined){
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
    
  }
}