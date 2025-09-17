import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CalendarOptions, GoogleCalendar } from 'datebook'
import { BookingService, DateTimeProcessor, Messages, projectConstantsLocal, SharedService, WordProcessor } from 'jconsumer-shared';
import { imageConstants } from '../image-constants';

@Component({
  selector: 'app-wl-card',
  templateUrl: './wl-card.component.html',
  styleUrls: ['./wl-card.component.scss']
})
export class WlCardComponent implements OnInit, OnChanges {

  @Input() booking;
  @Input() type;
  @Input() extras;
  @Output() actionPerformed = new EventEmitter<any>();
  @Input() smallDevice;
  @Input() history;
  send_msg_cap = Messages.SEND_MSG_CAP;
  rate_visit = Messages.RATE_VISIT;
  bookingStatusClasses = projectConstantsLocal.BOOKING_STATUS_CLASS;
  statusDisplay = projectConstantsLocal.CHECK_IN_STATUSES;
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
  showInvoiceBtn= false;
  showReceiptBtn = false;
  showPaidInfo = false;
  videoBtnCaption;
  customId: any;
  showQnrBtn = false;
  calendarUrl: any;
  selectedApptsTime:any;
  businessName:any;
  selectedbookingsTime: string;
  selectedService: any=[];
  accountProfile: any;
  account: any;
  provider_label: any;
  cdnPath: string = '';
  constructor( 
    private dateTimeProcessor: DateTimeProcessor,
    public translate: TranslateService,
    private wordProcessor:WordProcessor,
    private sharedService: SharedService,
    private bookingService:BookingService) { 
      this.cdnPath = this.sharedService.getCDNPath();
    }

  ngOnInit(): void {
    // this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
  }
  ngOnChanges() {
    if(this.booking !==undefined){
      this.bookingDetails() ;     
    }
    else{
      this.historyDetails(this.history)
    }
    console.log("Bookings token :",this.booking)
  }
  getIconContent(key) {
    return "{content: url(" + (this.cdnPath + imageConstants[key]) + ")}";
  }
  getDisplayName(statusValue) {
    const status = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    return this.statusDisplay[status];
  }
  historyDetails(history){
    if (history.releasedQnr && history.releasedQnr.length > 0 && history.waitlistStatus !== 'cancelled') {
      const releasedQnrs = history.releasedQnr.filter(qnr => qnr.status === 'released');
      if (releasedQnrs.length > 0) {
        this.showQnrBtn = true;
      }
    }
    if ((history.waitlistStatus == 'checkedIn' || history.waitlistStatus === 'arrived')  && this.type!=='previous') {
      this.showRescheduleBtn = true;
    }
    if ((history.waitlistStatus == 'checkedIn' || history.waitlistStatus == 'arrived' || history.waitlistStatus == 'prepaymentPending') && this.type!=='previous') {
      this.showCancelBtn = true;
    }
    if (history.questionnaire && history.questionnaire.questionAnswers && history.questionnaire.questionAnswers.length > 0) {
      this.showMoreInfoBtn = true;
    }
    if (history.prescShared) {
      this.showViewPrescritionBtn = true;
    }
    if (((history.waitlistStatus == 'checkedIn' || 'prepaymentPending') && (history.jaldeeWaitlistDistanceTime &&
      history.service.livetrack && history.waitlistStatus === 'checkedIn')) && this.type!=='previous') {
      this.showLiveTrackBtn = true;
    }
    if ((!history.jaldeeWaitlistDistanceTime && history.service.livetrack && history.waitlistStatus === 'checkedIn') && this.type!=='previous') {
      this.showLiveTrackIdBtn = true;
    }
    if ((history.service.serviceType === 'virtualService' && history.waitlistStatus !== 'done'
      && history.waitlistStatus !== 'cancelled') && this.type!=='previous') {
      this.showMeetingDetailsBtn = true;
    }
    if (history.waitlistStatus == 'done') {
      this.showRateBtn = true;
    }

    if (history.hasAttachment) {
      this.showViewAttachBtn = true;
    }
    if (this.type !== 'future' && history.videoCallButton && history.videoCallButton === 'ENABLED' && history.service.serviceType === 'virtualService' && history.service.virtualCallingModes.length > 0
      && history.service.virtualCallingModes[0].callingMode === 'VideoCall'
      && (history.waitlistStatus === 'started' || history.waitlistStatus === 'arrived' || history.waitlistStatus === 'checkedIn')) {

      console.log("Show ME");
      this.showJoinJaldeeVideoBtn = true;
      this.showJoinOtherVideoBtn = false;
      this.videoBtnCaption = 'Join Video Consultation';
      if (history.videoCallMessage && history.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video Consultation';
      }
    }
    if (this.type !== 'future' && history.videoCallButton && history.videoCallButton === 'ENABLED' && history.service.serviceType === 'virtualService' &&
      history.service.virtualCallingModes.length > 0 &&
      (history.service.virtualCallingModes[0].callingMode === 'Zoom' || history.service.virtualCallingModes[0].callingMode === 'GoogleMeet')
      && (history.waitlistStatus === 'started' || history.waitlistStatus === 'arrived' || history.waitlistStatus === 'checkedIn')) {
      this.showJoinJaldeeVideoBtn = false;
      this.showJoinOtherVideoBtn = true;
      this.videoBtnCaption = 'Join Video Consultation';
      if (history.videoCallMessage && history.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video Consultation';
      }
    }
    if (history.amountDue > 0 && (history.billViewStatus == 'Show') && history.waitlistStatus != 'cancelled' && history.billStatus != 'Settled') {
      this.showPayBtn = true;
    }
    if ((history.waitlistStatus != 'cancelled' && history.billStatus != 'Settled')) {
      this.showInvoiceBtn = true;
    }
    if (history.billViewStatus == 'Show' && ((!(history.amountDue > 0) && history.waitlistStatus != 'cancelled') || (history.waitlistStatus === 'cancelled' && history.paymentStatus !== 'NotPaid'))) {
      this.showReceiptBtn = true;
    }
    if (history.amountPaid) {
      console.log("Booking Amount :",history)
      this.showPaidInfo = true;
    }
    // this.getServiceGallery(this.history);
  }
  bookingDetails(){
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
      this.videoBtnCaption = 'Join Video Consultation';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video Consultation';
      }
    }
    if (this.type !== 'future' && this.booking.videoCallButton && this.booking.videoCallButton === 'ENABLED' && this.booking.service.serviceType === 'virtualService' &&
      this.booking.service.virtualCallingModes.length > 0 &&
      (this.booking.service.virtualCallingModes[0].callingMode === 'Zoom' || this.booking.service.virtualCallingModes[0].callingMode === 'GoogleMeet')
      && (this.booking.waitlistStatus === 'started' || this.booking.waitlistStatus === 'arrived' || this.booking.waitlistStatus === 'checkedIn')) {
      this.showJoinJaldeeVideoBtn = false;
      this.showJoinOtherVideoBtn = true;
      this.videoBtnCaption = 'Join Video Consultation';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video Consultation';
      }
    }
    if (this.booking.amountDue > 0 && (this.booking.billViewStatus == 'Show') && this.booking.waitlistStatus != 'cancelled' && this.booking.billStatus != 'Settled') {
      this.showPayBtn = true;
    }
    if ((this.booking.waitlistStatus != 'cancelled' && this.booking.billStatus != 'Settled')) {
      this.showInvoiceBtn = true;
    }
    if (this.booking.billViewStatus == 'Show' && ((!(this.booking.amountDue > 0) && this.booking.waitlistStatus != 'cancelled') || (this.booking.waitlistStatus === 'cancelled' && this.booking.paymentStatus !== 'NotPaid'))) {
      this.showReceiptBtn = true;
    }
    if (this.booking.amountPaid) {
      console.log("Booking Amount :",this.booking)
      this.showPaidInfo = true;
    }
    // this.getServiceGallery(this.booking)
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
    console.log('actionObj::-',actionObj)
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

  joinOtherVideoPerform(data){
    console.log('data',data)
    window.open(data);
  }
  addToCalendar(event) {
    event.stopPropagation();
    console.log("Bookings token :",this.booking)
    this.calendarUrl;
    let config: CalendarOptions;
    if (this.booking && this.booking.providerAccount && this.booking.providerAccount.businessName) {
      this.businessName = this.booking.providerAccount.businessName;
    }
    console.log(this.booking)
    console.log("booking time:", this.booking.checkInTime);
    let times = this.booking.checkInTime.split("-");
    const startTime = times[0];
    const endTime = times[1];
    const startDate = new Date(this.booking.date + 'T' + startTime);
    const endDate = new Date(this.booking.date + 'T' + endTime);
    config = {
      title: this.businessName + ' - ' + this.booking.service.name,
      location: this.booking.location?.place,
      description: 'Service provider : ' + this.businessName,
      start: startDate,
      end: endDate
    }
    console.log("config:", config);
    const googleCalendar = new GoogleCalendar(config);
    this.calendarUrl = googleCalendar.render();
    console.log('this.calendarUrl', this.calendarUrl);
    window.open(this.calendarUrl)
  }
  dwnldPres(data){
    window.open(data)
  }
  getServiceGallery(waitlistInfo){
    console.log('waitlistInfo',waitlistInfo)
    this.bookingService.getCheckinServices( this.accountProfile['baseLocation']['id']).then((waitlistServices:any)=>{
      console.log('services',waitlistServices);
      let departmentWaitlistServices = waitlistServices.filter(service => ((service.id == waitlistInfo['service']['id'])));
      console.log('departmentWaitlistServices',departmentWaitlistServices);
      if(departmentWaitlistServices && departmentWaitlistServices[0] && departmentWaitlistServices[0].servicegallery && departmentWaitlistServices[0].servicegallery.length>0){
        this.selectedService.push(departmentWaitlistServices);
      }
      else{
        this.selectedService=[];
      }
      console.log('selectedServicewaitlist',this.selectedService);
    })

  }
}
