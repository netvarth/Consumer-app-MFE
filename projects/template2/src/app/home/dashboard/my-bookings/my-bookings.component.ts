import { Component, HostListener, OnDestroy, OnInit } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import {
  AuthService,
  BookingService,
  ConsumerService,
  DateTimeProcessor,
  ErrorMessagingService,
  GroupStorageService,
  LocalStorageService,
  Messages,
  SharedService,
  SubscriptionService,
  ToastService
} from 'jconsumer-shared';
import { Subscription } from 'rxjs';
import { GalleryService } from '../../../shared/gallery/galery-service';
import { GalleryImportComponent } from '../../../shared/gallery/import/gallery-import.component';
import { ViewRxComponent } from '../../../shared/view-rx/view-rx.component';
import { InvoiceListComponent } from '../../../shared/invoice-list/invoice-list.component';
import { RateServicePopupComponent } from '../../../shared/rate-service-popup/rate-service-popup';
import { AttachmentPopupComponent } from '../../../shared/attachment-popup/attachment-popup.component';
import { AddInboxMessagesComponent } from '../../../shared/add-inbox-messages/add-inbox-messages.component';
import { MeetingDetailsComponent } from '../../../shared/meeting-details/meeting-details.component';

@Component({
  selector: 'app-my-bookings',
  templateUrl: './my-bookings.component.html',
  styleUrls: ['./my-bookings.component.scss']
})
export class MyBookingsComponent implements OnInit, OnDestroy {
  requestLimit = 2;
  bookingsLimit = 2;
  limit = 2;
  appointmentRequests: any = [];
  appointmentRequestsCount = 0;
  bookings: any = [];
  // allBookings: any = [];
  bookingTitle;
  bookingTitles: any = [
    { id: 1, caption: 'today', displayName: 'Today\'s Booking' },
    { id: 2, caption: 'future', displayName: 'Upcoming Bookings' },
    { id: 3, caption: 'previous', displayName: 'Previous Bookings', imgPath: '' }
  ]

  addnotedialogRef;
  accountId: any;
  screenWidth: number;
  smallDevice: boolean;
  moment;
  todayDate = new Date();
  rupee_symbol = 'Ã¢â€šÂ¹';
  loading: boolean;
  showattachmentDialogRef;
  theme: any
  ratedialogRef;
  privacydialogRef;
  canceldialogRef;
  private subscriptions: Subscription = new Subscription();
  loggedIn: boolean = true;
  activeUser;
  viewrxdialogRef;
  galleryDialog;
  showCancelledBookings = false;
  activeBookings: any;
  cancelledBookings: any;
  cdnPath: string = '';
  constructor(
    private sharedService: SharedService,
    private router: Router,
    private subscriptionService: SubscriptionService,
    private dateTimeProcessor: DateTimeProcessor,
    private errorService: ErrorMessagingService,
    private bookingService: BookingService,
    private dialog: MatDialog,
    private toastService: ToastService,
    private authService: AuthService,
    private groupService: GroupStorageService,
    private consumerService: ConsumerService,
    private galleryService: GalleryService,
    private lStorageService: LocalStorageService
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
    this.moment = this.dateTimeProcessor.getMoment();
    this.onResize();
    let subscription = this.subscriptionService.getMessage().subscribe(
      (message) => {
        switch (message.ttype) {
          case 'locationChanged':
            this.bookingTitleChanged(this.bookingTitle);
            break;
        }
      });
    this.subscriptions.add(subscription);
  }
  @HostListener('window:resize', ['$event'])
  onResize() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  goBack() {
    this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
  }

  ngOnDestroy(): void {
    this.subscriptionService.sendMessage({ ttype: 'hideLocation' });
    setTimeout(() => {
      this.subscriptions.unsubscribe();
    }, 100);
  }

  ngOnInit(): void {
    this.accountId = this.sharedService.getAccountID();
    this.authService.goThroughLogin().then((status) => {
      console.log("Status:", status);
      if (status) {
        this.initMyBookings();
        setTimeout(() => {
          this.subscriptionService.sendMessage({ ttype: 'showLocation' });
        }, 100);
      } else {
        this.loggedIn = false;
      }
    });
    let subs = this.galleryService.getMessage().subscribe(input => {
      console.log("Reached Here:");
      if (input && input.accountId && input.uuid && input.type === 'appt') {
        this.consumerService.addAppointmentAttachment(input.accountId, input.uuid, input.value)
          .subscribe(
            () => {
              this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
              this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
            },
            error => {
              this.toastService.showError(error.error);
              this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
            }
          );
      } else {
        if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
              },
              error => {
                this.toastService.showError(error.error);
                this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        }
      }
    });
    this.subscriptions.add(subs);
  }
  initMyBookings() {
    this.activeUser = this.groupService.getitemFromGroupStorage('jld_scon');
    this.setAppointmentRequests();
    let bookingType = this.groupService.getitemFromGroupStorage('b-t');
    if (bookingType) {
      let orderTitle = this.bookingTitles.filter(orderFilter => orderFilter.id == bookingType)[0];
      this.bookingTitleChanged(orderTitle);
    } else {
      this.bookingTitleChanged(this.bookingTitles[0]);
    }
  }
  actionPerformed(event) {
    this.initMyBookings();
  }
  setAppointmentRequests() {
    this.bookingService.getAppointmentRequests(this.accountId).subscribe(
      (requests: any) => {
        this.appointmentRequests = requests;
        this.appointmentRequestsCount = requests.length;
      }
    )
  }

  showMore(type) {
    this.bookings = [...this.activeBookings];
    switch (type) {
      case 'requests':
        if (this.appointmentRequests.length > this.limit) {
          this.requestLimit = this.appointmentRequests.length;
        }
        break;
      case 'bookings':
        if (this.bookings.length > this.limit) {
          this.bookingsLimit = this.bookings.length;
        }
        break;
    }
  }

  showLess(type) {
    this.bookings = [...this.activeBookings];
    switch (type) {
      case 'requests':
        if (this.appointmentRequests.length > this.limit) {
          this.requestLimit = 2;
        }
        break;
      case 'bookings':
        if (this.bookings.length > this.limit) {
          this.bookingsLimit = 2;
        }
        break;
    }
  }

  setTodayBookings() {
    const _this = this;
    let selectedLocation = this.lStorageService.getitemfromLocalStorage('c-location');
    let appointmentFilters = { 'apptStatus-neq': 'failed,prepaymentPending', 'account-eq': this.accountId };
    selectedLocation ? appointmentFilters['location-eq'] = selectedLocation : '';
    this.bookingService.getAppointmentToday(appointmentFilters).subscribe(
      (appointments: any) => {
        let todaydate = this.dateTimeProcessor.transformToYMDFormat(this.todayDate);
        let waitlistFilters = {
          'waitlistStatus-neq': 'failed,prepaymentPending', 'date-eq': todaydate, 'account-eq': this.accountId
        };
        this.bookingService.getWaitlist(waitlistFilters).subscribe(
          (waitlists) => {
            let bookings = appointments.concat(waitlists);
            _this.setBookings(bookings);
            this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            this.loading = false;
          }
        )
      }
    )
  }

  setFutureBookings() {
    const _this = this;
    let selectedLocation = this.lStorageService.getitemfromLocalStorage('c-location');
    let appointmentFilters = { 'apptStatus-neq': 'failed,prepaymentPending', 'account-eq': this.accountId };
    selectedLocation ? appointmentFilters['location-eq'] = selectedLocation : '';
    this.bookingService.getAppointmentFuture(appointmentFilters).subscribe(
      (appointments: any) => {
        let waitlistFilters = {
          'waitlistStatus-neq': 'failed,prepaymentPending', 'account-eq': this.accountId
        };
        _this.bookingService.getFutureWaitlist(waitlistFilters).subscribe(
          (waitlists) => {
            let bookings = appointments.concat(waitlists);
            _this.setBookings(bookings);
            _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            _this.loading = false;
          });
      });
  }

  setPreviousBookings() {
    const _this = this;
    let selectedLocation = this.lStorageService.getitemfromLocalStorage('c-location');
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    let filter = { 'account-eq': this.accountId };
    selectedLocation ? filter['location-eq'] = selectedLocation : '';
    this.bookingService.getAppointmentHistory(filter).subscribe(
      (appointments: any) => {
        this.bookingService.getWaitlistHistory(filter).subscribe(
          (waitlists) => {
            let allbookings = appointments.concat(waitlists);
            let bookings = allbookings.map((booking) => {
              if (booking['appmtDate']) {
                booking['date'] = booking['appmtDate'];
              }
              return booking;
            })
            _this.setBookings(bookings);
            _this.subscriptionService.sendMessage({ ttype: 'loading_stop' });
            this.loading = false;
          });
      });
  }

  setBookings(bookings) {
    this.activeBookings = this.getActiveBookings(bookings);
    this.cancelledBookings = this.getCancelledBookings(bookings);
    if (this.activeBookings.length === 0 && this.cancelledBookings.length > 0) {
      this.bookings = [...this.cancelledBookings];
    } else {
      this.bookings = [...this.activeBookings];
    }

  }

  bookingTitleChanged(bookingTitle) {
    this.showCancelledBookings = false;
    this.bookingTitle = bookingTitle;
    console.log("Booking Caption", bookingTitle.caption);
    this.subscriptionService.sendMessage({ ttype: 'loading_start' });
    this.loading = true;
    switch (bookingTitle.caption) {
      case 'today':
        this.bookingsLimit = 2;
        this.limit = 2;
        this.setTodayBookings();
        this.groupService.setitemToGroupStorage('b-t', '1');
        break;
      case 'future':
        this.bookingsLimit = 2;
        this.limit = 2;
        this.setFutureBookings();
        this.groupService.setitemToGroupStorage('b-t', '2');
        break;
      case 'previous':
        this.limit = 10;
        this.bookingsLimit = 10;
        this.setPreviousBookings();
        this.groupService.setitemToGroupStorage('b-t', '3');
        break;
    }
  }

  bookingDetails(booking) {
    console.log("booking" + booking);
    
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    this.router.navigate([this.sharedService.getRouteID(), 'booking', bookingID]);
  }
  rescheduleBooking(booking) {
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    let queryParams = {
      uuid: bookingID,
      type: 'reschedule',
      service_id: booking.service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.sharedService.getRouteID(), 'booking'], navigationExtras);
  }
  addWaitlistMessage(booking, type?) {
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = booking.providerAccount.id;
    pass_ob['userId'] = booking.providerAccount.uniqueId;
    pass_ob['name'] = booking.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    pass_ob['uuid'] = bookingID;
    pass_ob['theme'] = this.theme;
    if (type === 'appt') {
      pass_ob['appt'] = type;
    }
    this.addNote(pass_ob);
  }
  addNote(pass_ob) {
    this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob
    });
    this.addnotedialogRef.afterClosed().subscribe(() => {
    });
  }
  btnJoinVideoClicked(booking, event) {
    event.stopPropagation();
    let bookingID = booking.apptStatus ? booking.appointmentEncId : booking.checkinEncId;
    if (booking.videoCallButton && booking.videoCallButton !== 'DISABLED') {
      this.router.navigate([this.sharedService.getRouteID(), 'meeting', this.activeUser.primaryPhoneNumber, bookingID]);
    }
    return false;
  }
  viewprescription(booking) {
    this.viewrxdialogRef = this.dialog.open(ViewRxComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: {
        theme: this.theme,
        accencUid: booking.prescShortUrl ? (window.location.origin + booking.prescShortUrl) : booking.prescUrl
      }
    });
  }
  getMeetingDetails(booking) {
    let bookingSource = booking.apptStatus ? 'appt' : 'waitlist';
    const passData = {
      'type': bookingSource,
      'details': booking,
      'theme': this.theme
    };
    this.addnotedialogRef = this.dialog.open(MeetingDetailsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: passData
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
    });
  }
  doCancelWaitlist(booking) {
    const _this = this;
    let bookingType = booking.apptStatus ? 'appointment' : 'checkin';
    this.bookingService.doCancelWaitlist(booking, bookingType, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist') {
            _this.bookingTitleChanged(_this.bookingTitle);
          }
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        }
      );
  }
  rateService(booking) {
    let bookingType = booking.apptStatus ? 'appointment' : 'checkin';
    this.ratedialogRef = this.dialog.open(RateServicePopupComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      autoFocus: true,
      data: {
        'detail': booking,
        'isFrom': bookingType,
        'theme': this.theme
      }
    });
    this.ratedialogRef.afterClosed().subscribe(result => {
      this.bookingTitleChanged(this.bookingTitle);
    });
  }
  gotoQuestionnaire(booking) {
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    let bookingType = booking.apptStatus ? 'consAppt' : 'consCheckin';
    const navigationExtras: NavigationExtras = {
      queryParams: {
        uuid: bookingID,
        providerId: booking.providerAccount.id,
        type: bookingType
      }
    };
    this.router.navigate([this.sharedService.getRouteID(), 'questionnaire'], navigationExtras);
  }
  sendAttachment(booking, bookingType) {
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    this.galleryDialog = this.dialog.open(GalleryImportComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: {
        source_id: 'consumerimages',
        accountId: booking.providerAccount.id,
        uid: bookingID,
        type: bookingType,
        theme: this.theme
      }
    });
    this.galleryDialog.afterClosed().subscribe(result => {
    });
  }
  getAttachments(booking) {
    const _this = this;
    return new Promise(function (resolve, reject) {
      if (booking.apptStatus) {
        _this.bookingService.getAppointmentAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
          (attachments: any) => {
            resolve(attachments);
          }, (error) => { reject(error) });
      } else {
        _this.bookingService.getWaitlistAttachmentsByUuid(booking.ynwUuid, booking.providerAccount.id).subscribe(
          (attachments: any) => {
            resolve(attachments);
          }, (error) => { reject(error) });
      }
    })
  }
  viewAttachment(booking, bookingType) {
    const _this = this;
    this.getAttachments(booking).then((attachments: any) => {
      _this.showattachmentDialogRef = _this.dialog.open(AttachmentPopupComponent, {
        width: '50%',
        panelClass: ['popup-class', 'commonpopupmainclass'],
        disableClose: true,
        data: {
          attachments: attachments,
          type: bookingType,
          theme: this.theme
        }
      });
      _this.showattachmentDialogRef.afterClosed().subscribe(result => {
        if (result === 'reloadlist') {
        }
      });
    }).catch((error) => {
      let errorObj = _this.errorService.getApiError(error);
      _this.toastService.showError(errorObj);
    })
  }
  providerDetail() {
    this.router.navigate([this.sharedService.getRouteID()]);
  }
  getBookingInvoices(bookingID) {
    return new Promise((resolve, reject) => {
      this.consumerService.getInvoiceDetailsByuuid(bookingID).subscribe(
        (invoices: any) => {
          resolve(invoices);
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
          reject(error)
        }
      )
    })
  }
  selectInvoiceFromList(invoices: any) {
    return new Promise((resolve, reject) => {
      this.addnotedialogRef = this.dialog.open(InvoiceListComponent, {
        width: '50%',
        panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
        disableClose: true,
        autoFocus: true,
        data: invoices
      });
      this.addnotedialogRef.afterClosed().subscribe(invoiceID => {
        resolve(invoiceID);
      });
    })
  }
  viewBill(booking, event) {
    event.stopPropagation();
    let bookingID = booking.apptStatus ? booking.uid : booking.ynwUuid;
    let qParams = {
      paidInfo: false
    }
    console.log("Booking Info:", booking);
    if (booking.invoiceCreated) {
      this.getBookingInvoices(bookingID).then((invoices: any) => {
        if (invoices) {
          if (invoices && invoices.length == 1) {
            qParams['invoiceId'] = invoices[0].invoiceUid;
            this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
          } else {
            this.selectInvoiceFromList(invoices).then((invoiceID) => {
              if (invoiceID) {
                qParams['invoiceId'] = invoiceID;
                this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], { queryParams: qParams });
              }
            })
          }
        }
      })
    } else {
      let queryParams = {
        paidStatus: false
      }
      const navigationExtras: NavigationExtras = {
        queryParams: queryParams
      };
      this.router.navigate([this.sharedService.getRouteID(), 'booking', 'bill', bookingID], navigationExtras);
    }
  }

  cardClicked(actionObj) {
    console.log("ACtion Obj:", actionObj);
    let booking = actionObj['booking'];
    let action = actionObj['action'];
    let event = actionObj['event'];
    let bookingType = booking.apptStatus ? 'appt' : 'checkin';
    switch (action) {
      case 'details':
        this.bookingDetails(booking);
        break;
      case 'reschedule':
        this.rescheduleBooking(booking);
        break;
      case 'rating':
        this.rateService(booking);
        break;
      case 'cancel':
        this.doCancelWaitlist(booking);
        break;
      case 'communicate':
        this.addWaitlistMessage(booking, bookingType);
        break;
      case 'sendMessage':
        this.addWaitlistMessage(booking, bookingType);
        break;
      case 'sendAttachment':
        this.sendAttachment(booking, bookingType);
        break;
      case 'viewAttachment':
        this.viewAttachment(booking, bookingType);
        break;
      case 'meetingDetails':
        this.getMeetingDetails(booking);
        break;
      case 'moreInfo':
        this.gotoQuestionnaire(booking);
        break;
      case 'viewPrescription':
        this.viewprescription(booking);
        break;
      case 'viewBill':
        this.viewBill(booking, event);
        break;
      case 'joinVideo':
        this.btnJoinVideoClicked(booking, event);
        break;
      case 'providerDetails':
        this.providerDetail();
        break;
    }
  }

  stopprop(event) {
    event.stopPropagation();
  }

  getCancelledBookings(bookings) {
    return bookings.filter(booking =>
      booking.apptStatus === 'Cancelled' ||
      booking.waitlistStatus === 'cancelled'
    );
  }

  getActiveBookings(bookings) {
    return bookings.filter(booking =>
      booking.apptStatus !== 'Cancelled' ||
      booking.waitlistStatus !== 'cancelled'
    );
  }
}
