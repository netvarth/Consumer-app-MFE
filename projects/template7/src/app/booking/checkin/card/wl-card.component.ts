import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { DateTimeProcessor, Messages, projectConstantsLocal, WordProcessor } from 'jconsumer-shared';


@Component({
  selector: 'app-wl-card',
  templateUrl: './wl-card.component.html',
  styleUrls: ['./wl-card.component.css']
})
export class WlCardComponent implements OnInit, OnChanges {

  @Input() booking;
  @Input() type;
  @Input() extras;
  @Output() actionPerformed = new EventEmitter<any>();

  send_msg_cap = Messages.SEND_MSG_CAP;
  rate_visit = Messages.RATE_VISIT;
  bookingStatusClasses = projectConstantsLocal.BOOKING_STATUS_CLASS;
  monthFormat = projectConstantsLocal.DATE_FORMAT_STARTS_MONTH;
  showFavouritesBtn = false;
  showRateBtn = false;
  showRemFavouritesBtn = false;
  showRescheduleBtn = false;
  showShareLocationBtn = false;
  showJoinJaldeeVideoBtn = false;
  showJoinOtherVideoBtn = false;
  showViewPrescritionBtn = false;
  showMoreInfoBtn = false;
  showMeetingDetailsBtn = false;
  showViewAttachBtn = false;
  showSendAttachBtn = false;
  showSendMessageBtn = true;
  showCancelBtn = false;
  showLiveTrackIdBtn = false;
  showLiveTrackBtn = false;
  showPayBtn = false;
  showInvoiceBtn = false;
  showReceiptBtn = false;
  showPaidInfo = false;
  videoBtnCaption;
  customId: any;
  showQnrBtn = false;
  constructor(private wordProcessor: WordProcessor, private dateTimeProcessor: DateTimeProcessor) { }

  ngOnInit(): void {
  }
  ngOnChanges() {
    console.log("Bookings :",this.booking)
    if (this.booking.releasedQnr && this.booking.releasedQnr.length > 0 && this.booking.waitlistStatus !== 'cancelled') {
      const releasedQnrs = this.booking.releasedQnr.filter(qnr => qnr.status === 'released');
      if (releasedQnrs.length > 0) {
        this.showQnrBtn = true;
      }
    }
    if (this.booking.waitlistStatus == 'checkedIn' || this.booking.waitlistStatus === 'arrived') {
      this.showRescheduleBtn = true;
    }
    if (this.booking.waitlistStatus == 'checkedIn' || this.booking.waitlistStatus == 'arrived' || this.booking.waitlistStatus == 'prepaymentPending') {
      this.showCancelBtn = true;
    }
    if (this.booking.questionnaire && this.booking.questionnaire.questionAnswers && this.booking.questionnaire.questionAnswers.length > 0) {
      this.showMoreInfoBtn = true;
    }
    if (this.booking.prescShared) {
      this.showViewPrescritionBtn = true;
    }
    if ((this.booking.waitlistStatus == 'checkedIn' || 'prepaymentPending') && (this.booking.jaldeeWaitlistDistanceTime &&
      this.booking.service.livetrack && this.booking.waitlistStatus === 'checkedIn')) {
      this.showLiveTrackBtn = true;
    }
    if (!this.booking.jaldeeWaitlistDistanceTime && this.booking.service.livetrack && this.booking.waitlistStatus === 'checkedIn') {
      this.showLiveTrackIdBtn = true;
    }
    if (this.booking.service.serviceType === 'virtualService' && this.booking.waitlistStatus !== 'done'
      && this.booking.waitlistStatus !== 'cancelled') {
      this.showMeetingDetailsBtn = true;
    }
    if (this.booking.waitlistStatus == 'done') {
      this.showRateBtn = true;
    }
    if (this.extras  && this.extras['customId']) {
      this.customId = this.extras['customId'];
    }
    if (this.extras && this.extras['favourites'] && !this.extras['customId']) {
      if (!this.checkIfFav(this.booking.providerAccount.id)) {
        this.showFavouritesBtn = true;
        this.showRemFavouritesBtn = false;
      } else {
        this.showFavouritesBtn = false;
        this.showRemFavouritesBtn = true;
      }
    }
    if (this.booking.hasAttachment) {
      this.showViewAttachBtn = true;
    }
    console.log(this.type !== 'future' && this.booking.videoCallButton && this.booking.videoCallButton === 'ENABLED' && this.booking.service.serviceType === 'virtualService' && this.booking.service.virtualCallingModes.length > 0
      && this.booking.service.virtualCallingModes[0].callingMode === 'VideoCall'
      && (this.booking.waitlistStatus === 'started' || this.booking.waitlistStatus === 'arrived' || this.booking.waitlistStatus === 'checkedIn'));
    if (this.type !== 'future' && this.booking.videoCallButton && this.booking.videoCallButton === 'ENABLED' && this.booking.service.serviceType === 'virtualService' && this.booking.service.virtualCallingModes.length > 0
      && this.booking.service.virtualCallingModes[0].callingMode === 'VideoCall'
      && (this.booking.waitlistStatus === 'started' || this.booking.waitlistStatus === 'arrived' || this.booking.waitlistStatus === 'checkedIn')) {

      console.log("Show ME");
      this.showJoinJaldeeVideoBtn = true;
      this.showJoinOtherVideoBtn = false;
      this.videoBtnCaption = 'Join Video';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if (this.type !== 'future' && this.booking.videoCallButton && this.booking.videoCallButton === 'ENABLED' && this.booking.service.serviceType === 'virtualService' &&
      this.booking.service.virtualCallingModes.length > 0 &&
      (this.booking.service.virtualCallingModes[0].callingMode === 'Zoom' || this.booking.service.virtualCallingModes[0].callingMode === 'GoogleMeet')
      && (this.booking.waitlistStatus === 'started' || this.booking.waitlistStatus === 'arrived' || this.booking.waitlistStatus === 'checkedIn')) {
      this.showJoinJaldeeVideoBtn = false;
      this.showJoinOtherVideoBtn = true;
      this.videoBtnCaption = 'Join Video';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if (this.booking.amountDue > 0 && (this.booking.billViewStatus == 'Show') && this.booking.waitlistStatus != 'cancelled' && this.booking.billStatus != 'Settled') {
      this.showPayBtn = true;
    }
    if (this.booking.waitlistStatus != 'cancelled' && this.booking.billStatus != 'Settled') {
      this.showInvoiceBtn = true;
    }
    if (this.booking.billViewStatus == 'Show' && ((!(this.booking.amountDue > 0) && this.booking.waitlistStatus != 'cancelled') || (this.booking.waitlistStatus === 'cancelled' && this.booking.paymentStatus !== 'NotPaid'))) {
      this.showReceiptBtn = true;
    }
    if (this.booking.amountPaid) {
      console.log("Booking Amount :",this.booking)
      this.showPaidInfo = true;
    }
  }
  checkIfFav(id) {
    let fav = false;
    this.extras['favourites'].map((e) => {
      if (e === id) {
        fav = true;
      }
    });
    return fav;
  }
  cardActionPerformed(type, action, booking, event) {
    event.stopPropagation();
    const actionObj = {};
    actionObj['type'] = type;
    actionObj['action'] = action;
    actionObj['booking'] = booking;
    actionObj['event'] = event;
    actionObj['timetype'] = this.type;
    this.actionPerformed.emit(actionObj);
  }
  getBookingStatusClass(status) {
    const retdet = this.bookingStatusClasses.filter(
      soc => soc.value === this.wordProcessor.firstToUpper(status));
    if (retdet[0]) {
      return retdet[0].class;
    } else {
      return '';
    }
  }
  getTimeToDisplay(min) {
    if (this.dateTimeProcessor.convertMinutesToHourMinute(min) === '0 minutes') {
      return 'Now';
    } else {
      return this.dateTimeProcessor.convertMinutesToHourMinute(min);
    }
  }
  getSingleTime(slot) {
    const slots = slot.split('-');
    return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
  }
  stopprop(event) {
    event.stopPropagation();
  }
}
