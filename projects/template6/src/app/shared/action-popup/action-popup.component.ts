
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, NavigationExtras } from '@angular/router';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { GalleryService } from '../gallery/galery-service';
import { BookingService, ConsumerService, ErrorMessagingService, Messages, SharedService, SubscriptionService, ToastService } from 'jconsumer-shared';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { GalleryImportComponent } from '../gallery/import/gallery-import.component';

@Component({
  selector: 'app-action-popup',
  templateUrl: './action-popup.component.html',
  styleUrls: ['./action-popup.component.css']
})
export class ActionPopupComponent implements OnInit {
  bookingDetails: any;
  type: string;
  addnotedialogRef: any;
  showapptCancel = false;
  showcheckinCancel = false;
  showRescheduleAppt = false;
  showapptMeet = false;
  showcheckinMeet = false;
  showRescheduleWtlist = false;
  fromOrderDetails = false;
  galleryDialog: any;
  customId: any;
  theme: any;
  cdnPath: string = '';
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dialog: MatDialog,
    private galleryService: GalleryService,
    private bookingService: BookingService,
    private consumerService: ConsumerService,
    private toastService: ToastService,
    private sharedService: SharedService,
    private errorService: ErrorMessagingService,
    private subscriptionService: SubscriptionService,
    public dialogRef: MatDialogRef<ActionPopupComponent>) {
      this.cdnPath = this.sharedService.getCDNPath();
  }

  ngOnInit() {
    console.log('data', this.data);
    this.theme = this.data.theme;
    this.bookingDetails = this.data.booking;
    this.customId = this.data.booking.customId;
    console.log("Consumer Note :", this.bookingDetails);
    if (this.bookingDetails.quantity) {
      this.fromOrderDetails = true;
    } else {
      if (this.bookingDetails.apptStatus === 'Confirmed' || this.bookingDetails.apptStatus === 'Arrived') {
        this.showRescheduleAppt = true;
      }
      if (this.bookingDetails.waitlistStatus === 'checkedIn' || this.bookingDetails.waitlistStatus === 'arrived') {
        this.showRescheduleWtlist = true;
      }
      if (this.bookingDetails.waitlistStatus) {
        if (this.bookingDetails.service.serviceType === 'virtualService' && this.bookingDetails.waitlistStatus !== 'done'
          && this.bookingDetails.waitlistStatus !== 'cancelled') {
          this.showcheckinMeet = true;
        }
      } else {
        if (this.bookingDetails.service.serviceType === 'virtualService' && this.bookingDetails.apptStatus !== 'Completed'
          && this.bookingDetails.apptStatus !== 'Cancelled') {
          this.showapptMeet = true;
        }
      }
      if (this.bookingDetails.apptStatus === 'Confirmed' || this.bookingDetails.apptStatus === 'Arrived' || this.bookingDetails.apptStatus === 'prepaymentPending') {
        this.showapptCancel = true;
        this.showcheckinCancel = false;
      } else if (this.bookingDetails.waitlistStatus === 'checkedIn' || this.bookingDetails.waitlistStatus === 'arrived' || this.bookingDetails.waitlistStatus === 'prepaymentPending') {
        this.showcheckinCancel = true;
        this.showapptCancel = false;
      }
    }

    this.galleryService.getMessage().subscribe(input => {
      console.log(input);
      if (input && input.accountId && input.uuid && input.type === 'appt') {
        console.log(input);
        this.consumerService.addConsumerAppointmentAttachment(input.accountId, input.uuid, input.value)
          .subscribe(
            () => {
              this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
              this.subscriptionService.sendMessage({ ttype: 'upload', status: 'success' });
            },
            error => {
              this.toastService.showError(error.error);
              this.subscriptionService.sendMessage({ ttype: 'upload', status: 'failure' });
            }
          );
      } else {
        console.log(input);
        if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addConsumerWaitlistAttachment(input.accountId, input.uuid, input.value)
            .subscribe(
              () => {
                this.toastService.showSuccess(Messages.ATTACHMENT_SEND);
                this.subscriptionService.sendMessage({ ttype: 'upload', status: 'success' });
              },
              error => {
                this.toastService.showError(error.error);
                this.subscriptionService.sendMessage({ ttype: 'upload', status: 'failure' });
              }
            );
        }
      }
    });
    if (this.data && this.data['attchmentFrom'] && (this.data['attchmentFrom'] === 'checkinDetails' || this.data['attchmentFrom'] === 'apptDetails')) {
      this.sendAttachment();
    }
  }
  ngOnDestroy() {
  }
  gotoAptmtReschedule() {
    let queryParams = {
      uuid: this.bookingDetails.uid,
      type: 'reschedule',
      account_id: this.bookingDetails.providerAccount.id,
      unique_id: this.bookingDetails.providerAccount.uniqueId,
      service_id: this.bookingDetails.service.id
    }
    if (this.bookingDetails['customId']) {
      queryParams['customId'] = this.bookingDetails['customId'];
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.sharedService.getRouteID(), 'appointment'], navigationExtras);
    this.dialogRef.close();
  }

  doCancelWaitlist() {
    if (this.bookingDetails.appointmentEncId) {
      this.type = 'appointment';
    } else {
      this.type = 'checkin';
    }
    this.bookingService.doCancelWaitlist(this.bookingDetails, this.type, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist' && this.type === 'checkin') {
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
            this.dialogRef.close();
          } else if (data === 'reloadlist' && this.type === 'appointment') {
            this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
            this.dialogRef.close();
          }
        }, error => {
          let errorObj = this.errorService.getApiError(error);
          this.toastService.showError(errorObj);
        });
  }

  addWaitlistMessage() {
    const pass_ob = {};
    if (this.bookingDetails.appointmentEncId) {
      this.type = 'appt';
    } else {
      this.type = 'checkin';
    }
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = this.bookingDetails.providerAccount.id;
    pass_ob['userId'] = this.bookingDetails.providerAccount.uniqueId;
    pass_ob['name'] = this.bookingDetails.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    if (this.type === 'appt') {
      pass_ob['appt'] = this.type;
      pass_ob['uuid'] = this.bookingDetails.uid;
    } else {
      pass_ob['uuid'] = this.bookingDetails.ynwUuid;
    }
    this.addNote(pass_ob);
  }

  addNote(pass_ob) {
    pass_ob['theme'] = this.theme
    this.dialogRef.close();
    this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }

  getMeetingDetails() {
    if (this.bookingDetails.appointmentEncId) {
      this.type = 'appt';
    } else {
      this.type = 'waitlist';
    }
    const passData = {
      'type': this.type,
      'details': this.bookingDetails,
      'theme': this.theme
    };
    this.dialogRef.close();
    this.addnotedialogRef = this.dialog.open(MeetingDetailsComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class'],
      disableClose: true,
      data: passData
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
    });
  }
  gotoWaitlistReschedule() {
    let queryParams = {
      uuid: this.bookingDetails.ynwUuid,
      type: 'waitlistreschedule',
      account_id: this.bookingDetails.providerAccount.id,
      unique_id: this.bookingDetails.providerAccount.uniqueId,
      service_id: this.bookingDetails.service.id
    }
    if (this.bookingDetails['customId']) {
      queryParams['customId'] = this.bookingDetails['customId'];
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate(['consumer', 'checkin'], navigationExtras);
    this.dialogRef.close();
  }

  sendAttachment() {
    const pass_ob = {};
    if (this.bookingDetails.appointmentEncId) {
      this.type = 'appt';
    } else {
      this.type = 'checkin';
    }
    pass_ob['user_id'] = this.bookingDetails.providerAccount.id;
    if (this.type === 'appt') {
      pass_ob['type'] = this.type;
      pass_ob['uuid'] = this.bookingDetails.uid;
    } else if (this.type === 'checkin') {
      pass_ob['type'] = this.type;
      pass_ob['uuid'] = this.bookingDetails.ynwUuid;
    }
    this.addattachment(pass_ob);
  }
  addattachment(pass_ob) {
    console.log(pass_ob);
    this.galleryDialog = this.dialog.open(GalleryImportComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: {
        source_id: 'consumerimages',
        accountId: pass_ob.user_id,
        uid: pass_ob.uuid,
        type: pass_ob.type,
        theme: this.theme
      }
    });
    this.galleryDialog.afterClosed().subscribe(result => {
      console.log(result);
      this.dialogRef.close('reload');
    });
  }

}
