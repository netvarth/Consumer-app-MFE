import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ConsumerService } from 'jconsumer-shared';
import { TeleBookingService } from '../tele-bookings-service';

@Component({
  selector: 'app-meeting-details',
  templateUrl: './meeting-details.component.html',
  styleUrls: ['./meeting-details.component.scss']
})
export class MeetingDetailsComponent implements OnInit {

  iconClass: string;
  showJaldeeVideo = false;
  callingNumber: any;

  constructor(
    private teleBookingService: TeleBookingService,
    private consumerService: ConsumerService,
    public dialogRef: MatDialogRef<MeetingDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { }
  meetingDetails: any = [];
  ngOnInit() {
    if (this.data.details.service.serviceType === 'virtualService') {
      switch (this.data.details.service.virtualCallingModes[0].callingMode) {
        case 'Zoom': {
          this.iconClass = 'fa zoom-icon';
          break;
        }
        case 'VideoCall': {
          this.iconClass = 'fa jvideo-icon jvideo-icon-s jvideo-icon-mgm5';
          break;
        }
        case 'GoogleMeet': {
          this.iconClass = 'fa meet-icon';
          break;
        }
        case 'WhatsApp': {
          if (this.data.details.service.virtualServiceType === 'audioService') {
            this.iconClass = 'fa wtsapaud-icon';
          } else {
            this.iconClass = 'fa wtsapvid-icon';
          }
          this.callingNumber = this.teleBookingService.getTeleNumber(this.data.details.virtualService['WhatsApp']);
          break;
        }
        case 'Phone': {
          this.iconClass = 'fa phon-icon';
          this.callingNumber = this.teleBookingService.getTeleNumber(this.data.details.virtualService['Phone']);
          break;
        }
      }
    }
    if (this.data.type === 'appt') {
      this.getApptMeetingDetails();
    } else {
      this.getWaitlistMeetingDetails();
    }
  }

  getWaitlistMeetingDetails() {
   this.consumerService.getConsumerWaitlistMeetingDetails(this.data.details.ynwUuid, this.data.details.service.virtualCallingModes[0].callingMode, this.data.details.providerAccount.id).subscribe(data => {
      this.meetingDetails = data;
    });
  }
  getApptMeetingDetails() {
    this.consumerService.getConsumerApptMeetingDetails(this.data.details.uid, this.data.details.service.virtualCallingModes[0].callingMode, this.data.details.providerAccount.id).subscribe(data => {
      this.meetingDetails = data;
    });
  }
}
