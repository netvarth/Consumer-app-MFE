import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Router, NavigationExtras } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Messages } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { SubSink } from 'subsink';
import { ConsumerService } from '../../services/consumer-service';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { SharedService } from 'jaldee-framework/shared';
import { GalleryService } from '../gallery/galery-service';
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
  apptLvTrackon = false;
  apptLvTrackoff = false;
  chekinLvTrackoff = false;
  chekinLvTrackon = false;
  showRescheduleWtlist = false;
  fromOrderDetails = false;
  galleryDialog: any;
  private subs=new SubSink();
  customId: any;
  theme: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    private router: Router,
    private dialog: MatDialog,
    private sharedService: SharedService,
    private snackbarService: SnackbarService,
    private galleryService: GalleryService,
    public translate: TranslateService,
    private lStorageService: LocalStorageService,
    private consumerService: ConsumerService,
    public dialogRef: MatDialogRef<ActionPopupComponent>) { 
      console.log("theme :",this.data);
    }

  ngOnInit() {
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.bookingDetails = this.data.booking;
    this.customId = this.data.booking.customId;
    this.theme = this.data.theme
    console.log("Consumer Note :", this.bookingDetails.service);
    if (this.bookingDetails.quantity) {
      this.fromOrderDetails = true;
    } else {
    this.checkLvTrack();
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

    this.subs.sink = this.galleryService.getMessage().subscribe(input => {
      console.log(input);
      if (input && input.accountId && input.uuid && input.type === 'appt') {
        console.log(input);
        this.consumerService.addAppointmentAttachment(input.accountId ,input.uuid ,input.value)
              .subscribe(
                  () => {                      
                      this.snackbarService.openSnackBar(Messages.ATTACHMENT_SEND, { 'panelClass': 'snackbarnormal' });
                      this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
                  },
                  error => {
                      this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
                      this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
                  }
              );
       }  else {
          console.log(input);
          if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId ,input.uuid ,input.value)
                .subscribe(
                    () => {                      
                        this.snackbarService.openSnackBar(Messages.ATTACHMENT_SEND, { 'panelClass': 'snackbarnormal' });
                        this.galleryService.sendMessage({ ttype: 'upload', status: 'success' });
                    },
                    error => {
                        this.snackbarService.openSnackBar(error.error, { 'panelClass': 'snackbarerror' });
                        this.galleryService.sendMessage({ ttype: 'upload', status: 'failure' });
                    }
                );
              }
        } 
  });
  }
  ngOnDestroy() {
    this.subs.unsubscribe();
  }
  gotoAptmtReschedule() {
    let queryParams = {
      uuid: this.bookingDetails.uid,
      type: 'reschedule',
      account_id: this.bookingDetails.providerAccount.id,
      unique_id: this.bookingDetails.providerAccount.uniqueId,
      service_id:this.bookingDetails.service.id
    }
    if (this.bookingDetails['customId']) {
      queryParams['customId']=this.bookingDetails['customId'];
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate(['consumer', 'appointment'], navigationExtras);
    this.dialogRef.close();
  }

  doCancelWaitlist() {
    if (this.bookingDetails.appointmentEncId) {
      this.type = 'appointment';
    } else {
      this.type = 'checkin';
    }
    this.sharedService.doCancelWaitlist(this.bookingDetails, this.type, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist' && this.type === 'checkin') {
            this.router.navigate([this.customId, 'dashboard']);
            this.dialogRef.close();
          } else if (data === 'reloadlist' && this.type === 'appointment') {
            this.router.navigate([this.customId, 'dashboard']);
            this.dialogRef.close();
          }
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
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
    pass_ob['theme']=this.theme
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
    console.log("this.bookingDetails", this.bookingDetails.service)
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

  checkLvTrack() {
    if (this.bookingDetails.appointmentEncId) {
      if ((this.bookingDetails.apptStatus === 'Confirmed' || 'prepaymentPending') && (this.bookingDetails.jaldeeApptDistanceTime && this.bookingDetails.service.livetrack && this.bookingDetails.apptStatus === 'Confirmed')) {
        this.apptLvTrackon = true;
        this.apptLvTrackoff = false;
      } else if (!this.bookingDetails.jaldeeApptDistanceTime && this.bookingDetails.service.livetrack && this.bookingDetails.apptStatus === 'Confirmed') {
        this.apptLvTrackoff = true;
        this.apptLvTrackon = false;
      }
    } else {
      if ((this.bookingDetails.waitlistStatus === 'checkedIn' || 'prepaymentPending') && (this.bookingDetails.jaldeeWaitlistDistanceTime && this.bookingDetails.service.livetrack && this.bookingDetails.waitlistStatus === 'checkedIn')) {
        this.chekinLvTrackon = true;
        this.chekinLvTrackoff = false;
      } else if (!this.bookingDetails.jaldeeWaitlistDistanceTime && this.bookingDetails.service.livetrack && this.bookingDetails.waitlistStatus === 'checkedIn') {
        this.chekinLvTrackon = false;
        this.chekinLvTrackoff = true;
      }
    }
  }

  gotoLivetrack(stat) {
    let uid;
    if (this.bookingDetails.appointmentEncId) {
      uid = this.bookingDetails.uid;
    } else {
      uid = this.bookingDetails.ynwUuid;
    }
    let queryParams = {
      account_id: this.bookingDetails.providerAccount.id,
      status: stat
    }
    if (this.bookingDetails['customId']) {
      queryParams['customId']=this.bookingDetails['customId'];
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.dialogRef.close();
    if (this.bookingDetails.appointmentEncId) {
      this.router.navigate([this.customId, 'appointment', 'track', uid], navigationExtras);
    } else {
      this.router.navigate([this.customId, 'checkin', 'track', uid], navigationExtras);
    }

  }
  gotoWaitlistReschedule() {
    let queryParams = {
      uuid: this.bookingDetails.ynwUuid,
      type: 'waitlistreschedule',
      account_id: this.bookingDetails.providerAccount.id,
      unique_id: this.bookingDetails.providerAccount.uniqueId,
      service_id:this.bookingDetails.service.id
    }
    if (this.bookingDetails['customId']) {
      queryParams['customId']=this.bookingDetails['customId'];
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
         accountId:pass_ob.user_id,
         uid:pass_ob.uuid,
         type:pass_ob.type,
         theme: this.data.theme
      }
    });
     this.galleryDialog.afterClosed().subscribe(result => {
       console.log(result);
       this.dialogRef.close('reload');
      // this.reloadAPIs();
    });
  }

}
