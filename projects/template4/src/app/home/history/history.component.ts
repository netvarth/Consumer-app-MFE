import { Component, OnInit, Input, Output, HostListener, OnDestroy } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { EventEmitter } from '@angular/core';
import { Location } from '@angular/common';
import { AuthService ,AccountService, ConsumerService, DateTimeProcessor, ErrorMessagingService, GroupStorageService, LocalStorageService, Messages, OrderService, projectConstantsLocal, SharedService, SubscriptionService, ToastService, WordProcessor } from "jconsumer-shared";
import { TranslateService } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { AddInboxMessagesComponent } from '../../shared/add-inbox-messages/add-inbox-messages.component';
import { InvoiceListComponent } from '../../shared/invoice-list/invoice-list.component';
import { RateServicePopupComponent } from '../../shared/rate-service-popup/rate-service-popup';
import { ViewRxComponent } from '../../shared/view-rx/view-rx.component';
import { TeleBookingService } from '../../shared/tele-bookings-service';

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
  private subs = new Subscription();
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
  hideLocationGlobal: boolean = false;
  constructor(
    private router: Router, private location: Location,
    public dialog: MatDialog, private activateroute: ActivatedRoute,
    private consumerService: ConsumerService,
    public translate: TranslateService,
    private toast: ToastService,
    private authService: AuthService,
    private accountService: AccountService,
    private orderService: OrderService,
    private sharedService: SharedService,
    private lStorageService: LocalStorageService,
    private teleService: TeleBookingService,
    private dateTimeProcessor: DateTimeProcessor) {
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
    this.account = this.sharedService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig?.locationVisible) {
      this.hideLocationGlobal = this.accountConfig?.locationVisible;
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
    this.subs.add(this.activateroute.queryParams.subscribe(params => {
      if (params['is_orderShow'] === 'false') {
        this.isOrder= false;
      } else {
        this.isOrder = true;
        this.showOrderHist = true;
      }
      this.initHistory();
    }));
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
    this.subs.add(this.consumerService.getWaitlistHistory(api_filter)
      .subscribe(
        data => {
          this.history = data;
          this.getAppointmentHistory(api_filter);
        },
        error => {
          this.loading = false;
          this.loadcomplete.history = true;
        }
      ));
  }
  // Getting Appointment History
  getAppointmentHistory(api_filter) {
    this.subs.add(this.consumerService.getAppointmentHistory(api_filter)
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
      ));
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
    this.subs.add(this.consumerService.getHistoryWaitlistCount()
      .subscribe(
        data => {
          this.wtlist_count = data;
          this.getAppointmentHistoryCount();
        }));
  }
  // Get Appointment history count
  getAppointmentHistoryCount() {
    this.subs.add(this.consumerService.getAppointmentHistoryCount()
      .subscribe(
        data => {
          this.appt_count = data;
          this.entire_count = this.wtlist_count.concat(this.appt_count);
          console.log(this.entire_count);
        }));
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

  // getOrderBill(orders) {
  //   this.subs.add(this.orderService.getInvoiceByOrderYnwuuid(this.accountId, orders.uid)
  //     .subscribe(
  //       data => {
  //         const bill_data = data;
  //         this.viewOrderBill(orders, bill_data);
  //       },
  //       error => {
  //         this.toast.showError(error);
  //       }
  //     ));
  // }
  // viewOrderBill(order, type) {
  //   if (order.invoiceCreated) {
  //     this.getInvociesBybooking(order.uid).then((data: any) => {

  //       this.allInvocies = data;

  //       if (this.allInvocies && this.allInvocies.length === 1) {
  //         let queryParams = {
  //           uuid: order.uid,
  //           type: 'order',
  //           'paidStatus': false,
  //           invoiceInfo: order.invoiceCreated,
  //           invoiceId: this.allInvocies[0].uid
  //         }
  //         const navigationExtras: NavigationExtras = {
  //           queryParams: queryParams
  //         };
  //         this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
  //       }
  //       else {

  //         this.goToInvoiceList().then((result: any) => {
  //           this.selectedInoviceId = result;
  //         if (this.selectedInoviceId) {
  //           let queryParams = {
  //             uuid: order.uid,
  //             type: 'order',
  //             'paidStatus': false,
  //             invoiceInfo: order.invoiceCreated,
  //             invoiceId: this.selectedInoviceId
  //           }
  //           const navigationExtras: NavigationExtras = {
  //             queryParams: queryParams
  //           };
  //           this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
  //         }
  //       });
  //       }
  //     })
  //   } else if (!order.invoiceCreated) {

  //     let queryParams = {
  //       uuid: order.uid,
  //       type: 'order',
  //       'paidStatus': false,
  //       invoiceInfo: order.invoiceCreated,
  //     }
  //     const navigationExtras: NavigationExtras = {
  //       queryParams: queryParams
  //     };
  //     this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
  //   }






    // let queryParams = {
    //   uuid: order.uid,
    //   type: 'order',
    //   'paidStatus': false
    // }
    // const navigationExtras: NavigationExtras = {
    //   queryParams: queryParams
    // };
    // this.router.navigate([this.customId, 'order', 'order-bill'], navigationExtras);
  // }
  // viewBill(checkin, bill_data) {
  //   console.log("appt-details2",checkin)
  //   if (checkin.invoiceCreated) {
  //     this.getInvociesBybooking(checkin.ynwUuid).then((data: any) => {

  //       this.allInvocies = data;

  //       if (this.allInvocies && this.allInvocies.length === 1) {
  //         let queryParams = {
  //           uuid: checkin.ynwUuid,
  //           type: 'waitlist',
  //           'paidStatus': false,
  //           invoiceInfo: checkin.invoiceCreated,
  //           invoiceId: this.allInvocies[0].uid
  //         }
  //         const navigationExtras: NavigationExtras = {
  //           queryParams: queryParams
  //         };
  //         this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
  //       }
  //       else {

  //         this.goToInvoiceList().then((result: any) => {
  //           this.selectedInoviceId = result;
  //         if (this.selectedInoviceId) {
  //           let queryParams = {
  //             uuid: checkin.ynwUuid,
  //             source: 'history',
  //             'paidStatus': false,
  //             invoiceInfo: checkin.invoiceCreated,
  //             invoiceId: this.selectedInoviceId
  //           }
  //           const navigationExtras: NavigationExtras = {
  //             queryParams: queryParams
  //           };
  //           this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
  //         }
  //       });
  //       }
  //     })
  //   }
  //   else if (!checkin.invoiceCreated) {

  //     let queryParams = {
  //       uuid: checkin.ynwUuid,
  //       source: 'history',
  //       'paidStatus': false,
  //       invoiceInfo: checkin.invoiceCreated,
  //     }
  //     const navigationExtras: NavigationExtras = {
  //       queryParams: queryParams
  //     };
  //     this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
  //   }



  //   // let queryParams = {
  //   //   uuid: checkin.ynwUuid,
  //   //   source: 'history',
  //   //   invoiceInfo: checkin.invoiceCreated,
  //   // }
  //   // const navigationExtras: NavigationExtras = {
  //   //   queryParams: queryParams
  //   // };
  //   // this.router.navigate([this.customId, 'checkin', 'bill'], navigationExtras);
  // }
  getInvociesBybooking(providerId, ynwUuid) {
    let uuid;
    uuid = ynwUuid;
    return new Promise((resolve, reject) => {
      this.teleService.getInvoiceDetailsByuuid(providerId,uuid).subscribe(
        data => {
          resolve(data);
        },
        error => {
          this.toast.showError(error);
          reject(error);
        }
      );
    });

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
    this.ratedialogRef = this.dialog.open(RateServicePopupComponent, {
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
    this.viewBookingBill(waitlist);
  }

  getWaitlistBill(waitlist) {
    this.viewBookingBill(waitlist);
  }
  rateApptService(waitlist) {
    this.ratedialogRef = this.dialog.open(RateServicePopupComponent, {
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
    this.ratedialogRef = this.dialog.open(RateServicePopupComponent, {
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
  // viewApptBill(checkin, bill_data) {
  //   console.log("appt-details",checkin)
  //   if (checkin.invoiceCreated) {
  //     this.getInvociesBybooking(checkin.uid).then((data: any) => {

  //       this.allInvocies = data;

  //       if (this.allInvocies && this.allInvocies.length === 1) {
  //         let queryParams = {
  //           uuid: checkin.uid,
  //           source: 'history',
  //           'paidStatus': false,
  //           invoiceInfo: checkin.invoiceCreated,
  //           invoiceId: this.allInvocies[0].uid
  //         }
  //         const navigationExtras: NavigationExtras = {
  //           queryParams: queryParams
  //         };
  //         this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
  //       }
  //       else {

  //         this.goToInvoiceList().then((result: any) => {
  //           this.selectedInoviceId = result;
  //         if (this.selectedInoviceId) {
  //           let queryParams = {
  //             uuid: checkin.uid,
  //             source: 'history',
  //             'paidStatus': false,
  //             invoiceInfo: checkin.invoiceCreated,
  //             invoiceId: this.selectedInoviceId
  //           }
  //           const navigationExtras: NavigationExtras = {
  //             queryParams: queryParams
  //           };
  //           this.router.navigate([this.customId, 'booking', 'bill'], navigationExtras);
  //         }
  //       });
  //       }
  //     })
  //   } else if (!checkin.invoiceCreated) {

  //     let queryParams = {
  //       uuid: checkin.uid,
  //       source: 'history',
  //       'paidStatus': false,
  //       invoiceInfo: checkin.invoiceCreated,
  //     }
  //     const navigationExtras: NavigationExtras = {
  //       queryParams: queryParams
  //     };
  //     this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
  //   }








    // let queryParams = {
    //   uuid: checkin.uid,
    //   source: 'history',
    //   invoiceInfo: checkin.invoiceCreated,
    // }
    // const navigationExtras: NavigationExtras = {
    //   queryParams: queryParams
    // };
    // this.router.navigate([this.customId, 'appointment', 'bill'], navigationExtras);
  // }
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
    this.subs.add(this.consumerService.getOrderHistory(api_filter)
      .subscribe(
        data => {
          this.entire_history = data;
          this.loadcomplete.history = true;
          this.loading = false;
        },
        error => {
          this.loading = false;
          this.loadcomplete.history = true;
        }
      ));
  }
  showBookingDetails(booking, type?) {
    let queryParams = {};
    if (booking.apptStatus) {
      let bookingid = booking.uid;
      queryParams['uuid'] = booking.uid;
      queryParams['type'] = type;
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.customId, 'booking',bookingid]);
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

  isWaitlistEntry(entry: any): boolean {
    return !!entry?.waitlistStatus;
  }

  isAppointmentEntry(entry: any): boolean {
    return !!entry?.apptStatus;
  }

  isOrderEntry(entry: any): boolean {
    return !!entry?.orderStatus;
  }

  getEntryHeaderLabel(entry: any): string {
    if (this.isOrderEntry(entry)) {
      return 'Order Details';
    }
    if (this.isAppointmentEntry(entry)) {
      return 'Appointment Details';
    }
    return 'Check-in Details';
  }

  getEntryTitle(entry: any): string {
    if (this.isOrderEntry(entry)) {
      return entry?.orderType || entry?.orderDisplayName || entry?.providerAccount?.businessName || 'Order';
    }
    return entry?.service?.name || 'Service';
  }

  getEntryStatusText(entry: any): string {
    if (this.isOrderEntry(entry)) {
      if (!entry?.orderStatus) {
        return '';
      }
      return entry.orderStatus === 'Order Received'
        ? 'Order Placed - Waiting for confirmation'
        : this.toTitleCase(entry.orderStatus);
    }
    if (this.isAppointmentEntry(entry)) {
      return this.getStatusLabel(entry.apptStatus);
    }
    if (this.isWaitlistEntry(entry)) {
      return entry.waitlistStatus === 'done' ? 'Completed' : this.getStatusLabel(entry.waitlistStatus);
    }
    return '';
  }

  getStatusPillClass(entry: any): string {
    const status = this.isOrderEntry(entry)
      ? entry?.orderStatus
      : this.isAppointmentEntry(entry)
        ? entry?.apptStatus
        : entry?.waitlistStatus;
    return `status-pill status-${this.normalizeStatus(status)}`;
  }

  getHeaderClass(entry: any): string {
    if (this.isOrderEntry(entry)) {
      return 'order';
    }
    if (this.isAppointmentEntry(entry)) {
      return 'appointment';
    }
    return 'waitlist';
  }

  getServiceName(entry: any): string {
    if (this.isOrderEntry(entry)) {
      return entry?.service?.name || entry?.orderType || '—';
    }
    return entry?.service?.name || '—';
  }

  getLocationName(entry: any): string {
    if (this.isOrderEntry(entry)) {
      return entry?.deliveryAddress?.city
        || entry?.deliveryAddress?.address
        || entry?.providerAccount?.businessName
        || '—';
    }
    if (this.isAppointmentEntry(entry)) {
      return entry?.location?.place || '—';
    }
    return entry?.queue?.location?.place || '—';
  }

  getPersonName(entry: any): string {
    if (this.isOrderEntry(entry)) {
      const person = entry?.orderFor;
      return person ? `${person.firstName || ''} ${person.lastName || ''}`.trim() || '—' : '—';
    }
    if (this.isAppointmentEntry(entry)) {
      const person = entry?.appmtFor?.[0];
      return person ? `${person.firstName || ''} ${person.lastName || ''}`.trim() || '—' : '—';
    }
    const person = entry?.waitlistingFor?.[0];
    return person ? `${person.firstName || ''} ${person.lastName || ''}`.trim() || '—' : '—';
  }

  getOrderMode(entry: any): string {
    if (!this.isOrderEntry(entry)) {
      return '';
    }
    if (entry?.storePickup) {
      return 'Store Pickup';
    }
    if (entry?.homeDelivery) {
      return 'Home Delivery';
    }
    return 'Online Order';
  }

  getOrderItemsCount(entry: any): number {
    return Array.isArray(entry?.orderItem) ? entry.orderItem.length : 0;
  }

  viewBookingBill(booking, event?) {
    event?.stopPropagation();
    const bookingID = booking?.apptStatus ? booking?.uid : (booking?.ynwUuid || booking?.uid);
    const qParams: any = { paidInfo: false };
    if (booking?.invoiceCreated) {
      this.getInvociesBybooking(booking.providerAccount.id,bookingID).then((invoices: any) => {
        if (invoices) {
          this.allInvocies = invoices;
          if (invoices.length === 1) {
            qParams['invoiceId'] = invoices[0].uid;
            this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
          } else {
            this.goToInvoiceList().then((invoiceId: any) => {
              if (invoiceId) {
                qParams['invoiceId'] = invoiceId;
                this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
              }
            });
          }
        }
      }).catch(() => {});
    } else {
      const navigationExtras: NavigationExtras = {
        queryParams: { paidStatus: false }
      };
      this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], navigationExtras);
    }
  }

  private toTitleCase(value: string): string {
    if (!value) {
      return '';
    }
    return value.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
  }

  private normalizeStatus(status: string): string {
    return status ? status.toString().toLowerCase().replace(/\s+/g, '-') : '';
  }
}
