import { Component, EventEmitter, Input, OnChanges, OnInit, Output, ViewChild } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CalendarOptions, GoogleCalendar } from 'datebook'
import { BookingService, DateTimeProcessor, Messages, projectConstantsLocal, SharedService, WordProcessor } from 'jconsumer-shared';
import { MatMenuTrigger } from '@angular/material/menu';

@Component({
  selector: 'app-appt-card',
  templateUrl: './appt-card.component.html',
  styleUrls: ['./appt-card.component.scss']
})
export class ApptCardComponent implements OnInit, OnChanges {

  @Input() booking;
  @Input() type;
  @Input() extras;
  @Output() actionPerformed = new EventEmitter<any>();
  @Input() smallDevice;
  @Input() history;
  @ViewChild(MatMenuTrigger) menuTrigger: MatMenuTrigger;

  send_msg_cap = Messages.SEND_MSG_CAP;
  rate_visit = Messages.RATE_VISIT;
  bookingStatusClasses = projectConstantsLocal.BOOKING_STATUS_CLASS;
  monthFormat = projectConstantsLocal.DATE_FORMAT_STARTS_MONTH;
  statusDisplay = projectConstantsLocal.CHECK_IN_STATUSES;
  showFavouritesBtn = false;
  showRateBtn = false;
  showRemFavouritesBtn = false;
  showRescheduleBtn = false;
  showShareLocationBtn = false;
  showJoinVideoBtn = false;
  showViewPrescritionBtn = false;
  showMoreInfoBtn = false;
  showMeetingDetailsBtn = false;
  showViewAttachBtn = false;
  showSendAttachBtn = false;
  showSendMessageBtn = false;
  showCancelBtn = false;
  showLiveTrackIdBtn = false;
  showLiveTrackBtn = false;

  showJoinJaldeeVideoBtn = false;
  showJoinOtherVideoBtn = false;
  videoBtnCaption;

  showPayBtn = false;
  showReceiptBtn = false;
  showPaidInfo = false;
  
  virtualMode;
  customId: any;
  showQnrBtn = false;
  calendarUrl: any;
  selectedApptsTime:any;
  businessName:any;
  selectedbookingsTime: string;
  selectedService: any=[];
  showInvoiceBtn= false;
  provider_label: any;
  cdnPath: string = '';
  hideLocationGlobal: boolean = false;

  constructor(
    private wordProcessor: WordProcessor, 
    private dateTimeProcessor: DateTimeProcessor, 
    public translate: TranslateService,
    private bookingService: BookingService,
    private sharedService: SharedService
    ) { 
      this.cdnPath = this.sharedService.getCDNPath();
    }

  ngOnInit(): void {
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    let accountConfig = this.sharedService.getAccountConfig();
      if (accountConfig?.locationVisible) {
        this.hideLocationGlobal = accountConfig?.locationVisible;
      }
  }
  ngOnChanges() {
    if(this.booking !==undefined){
      this.bookingDetails();     
    }
    else{
      this.historyDetails(this.history);
    }
  }
  getDisplayName(statusValue) {
    const status = statusValue.charAt(0).toUpperCase() + statusValue.slice(1);
    return this.statusDisplay[status];
  }
  historyDetails(history){
    const waitlistStatus = (history?.waitlistStatus || '').toLowerCase();
    const billStatus = (history?.billStatus || '').toLowerCase();
    const paymentStatus = (history?.paymentStatus || '').toLowerCase();

    if (history.releasedQnr && history.releasedQnr.length > 0 && waitlistStatus !== 'cancelled') {
      const releasedQnrs = history.releasedQnr.filter(qnr => qnr.status === 'released');
      if (releasedQnrs.length > 0) {
        this.showQnrBtn = true;
      }
    }
    if ((waitlistStatus === 'checkedin' || waitlistStatus === 'arrived') && this.type!=='previous') {
      this.showRescheduleBtn = true;
    }
    if ((waitlistStatus === 'checkedin' || waitlistStatus === 'arrived' || waitlistStatus === 'prepaymentpending') && this.type!=='previous') {
      this.showCancelBtn = true;
    }
    if (history.questionnaire && history.questionnaire.questionAnswers && history.questionnaire.questionAnswers.length > 0) {
      this.showMoreInfoBtn = true;
    }
    if (history.prescShared) {
      this.showViewPrescritionBtn = true;
    }
    if (((waitlistStatus === 'checkedin' || waitlistStatus === 'prepaymentpending') && (history.jaldeeWaitlistDistanceTime &&
      history.service.livetrack && waitlistStatus === 'checkedin')) && this.type!=='previous') {
      this.showLiveTrackBtn = true;
    }
    if ((!history.jaldeeWaitlistDistanceTime && history.service.livetrack && waitlistStatus === 'checkedin') && this.type!=='previous') {
      this.showLiveTrackIdBtn = true;
    }
    if ((history.service.serviceType === 'virtualService' && waitlistStatus !== 'done'
      && waitlistStatus !== 'cancelled')  && this.type!=='previous') {
      this.showMeetingDetailsBtn = true;
    }
    if (waitlistStatus === 'done') {
      this.showRateBtn = true;
    }
    if (history.hasAttachment) {
      this.showViewAttachBtn = true;
    }
    console.log(this.type !== 'future' && history.videoCallButton && history.videoCallButton === 'ENABLED' && history.service.serviceType === 'virtualService' && history.service.virtualCallingModes.length > 0
      && history.service.virtualCallingModes[0].callingMode === 'VideoCall'
      && (history.waitlistStatus === 'started' || history.waitlistStatus === 'arrived' || history.waitlistStatus === 'checkedIn'));
    if (this.type !== 'future' && history.videoCallButton && history.videoCallButton === 'ENABLED' && history.service.serviceType === 'virtualService' && history.service.virtualCallingModes.length > 0
      && history.service.virtualCallingModes[0].callingMode === 'VideoCall'
      && (history.waitlistStatus === 'started' || history.waitlistStatus === 'arrived' || history.waitlistStatus === 'checkedIn')) {
      this.showJoinJaldeeVideoBtn = true;
      this.showJoinOtherVideoBtn = false;
      this.videoBtnCaption = 'Join Video';
      if (history.videoCallMessage && history.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if (this.type !== 'future' && history.videoCallButton && history.videoCallButton === 'ENABLED' && history.service.serviceType === 'virtualService' &&
      history.service.virtualCallingModes.length > 0 &&
      (history.service.virtualCallingModes[0].callingMode === 'Zoom' || history.service.virtualCallingModes[0].callingMode === 'GoogleMeet')
      && (history.waitlistStatus === 'started' || history.waitlistStatus === 'arrived' || history.waitlistStatus === 'checkedIn')) {
      this.showJoinJaldeeVideoBtn = false;
      this.showJoinOtherVideoBtn = true;
      this.videoBtnCaption = 'Join Video';
      if (history.videoCallMessage && history.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if (history.amountDue > 0 && (history.billViewStatus == 'Show') && waitlistStatus != 'cancelled' && billStatus != 'settled') {
      this.showPayBtn = true;
    }
    if ((waitlistStatus != 'cancelled' && billStatus != 'settled')) {
      this.showInvoiceBtn = true;
    }
    if (history.billViewStatus == 'Show' && ((!(history.amountDue > 0) && waitlistStatus != 'cancelled') || (waitlistStatus === 'cancelled' && paymentStatus !== 'notpaid'))) {
      this.showReceiptBtn = true;
    }
    if (history.amountPaid) {
      this.showPaidInfo = true;
    }
    // this.getServiceGallery(this.history)
  }
  bookingDetails(){
    const apptStatus = (this.booking?.apptStatus || '').toLowerCase();
    const billStatus = (this.booking?.billStatus || '').toLowerCase();
    const paymentStatus = (this.booking?.paymentStatus || '').toLowerCase();

    if (this.booking && this.booking.releasedQnr && this.booking.releasedQnr.length > 0 && apptStatus !== 'cancelled') {
      const releasedQnrs = this.booking.releasedQnr.filter(qnr => qnr.status === 'released');
      if (releasedQnrs.length > 0) {
        this.showQnrBtn = true;
      }
    }
    if (apptStatus === 'confirmed' || apptStatus === 'arrived') {
      this.showRescheduleBtn = true;
    }
    if (apptStatus === 'confirmed' || apptStatus === 'arrived' || apptStatus === 'prepaymentpending') {
      this.showCancelBtn = true;
    }
    if (this.booking.hasAttachment) {
      this.showViewAttachBtn = true;
    }
    if (apptStatus === 'completed') {
      this.showRateBtn = true;
    }
    if (this.booking && this.booking.service.serviceType === 'virtualService' && apptStatus !== 'completed'
      && apptStatus !== 'cancelled') {
      this.showMeetingDetailsBtn = true;
    }
    if (this.booking.questionnaire && this.booking.questionnaire.questionAnswers &&
      this.booking.questionnaire.questionAnswers.length > 0) {
      this.showMoreInfoBtn = true;
    }
    if (this.type !== 'future' && this.booking.prescShared) {
      this.showViewPrescritionBtn = true;
    }
    if (this.type !== 'future' && !this.booking.jaldeeApptDistanceTime && this.booking && this.booking.service.livetrack && apptStatus === 'confirmed') {
      this.showLiveTrackIdBtn = true;
    }
    if (this.type !== 'future' && (apptStatus === 'confirmed' || apptStatus === 'prepaymentpending')
      && (this.booking.jaldeeApptDistanceTime && this.booking && this.booking.service.livetrack && apptStatus === 'confirmed')) {
      this.showLiveTrackBtn = true;
    }
    if (this.type !== 'future' && (this.booking.videoCallButton && this.booking.videoCallButton==='ENABLED') && this.booking && this.booking.service.serviceType === 'virtualService' && this.booking.service.virtualCallingModes.length > 0 &&
      this.booking.service.virtualCallingModes[0].callingMode === 'VideoCall' &&
      (apptStatus === 'started' || apptStatus === 'arrived' || apptStatus === 'confirmed')) {
      this.showJoinJaldeeVideoBtn = true;
      this.showJoinOtherVideoBtn = false;
      this.videoBtnCaption = 'Join Video';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if (this.type !== 'future' && this.booking.videoCallButton && this.booking.videoCallButton==='ENABLED' && this.booking.service.serviceType === 'virtualService' && this.booking.service.virtualCallingModes.length > 0 &&
      (this.booking && this.booking.service.virtualCallingModes[0].callingMode === 'Zoom' || this.booking.service.virtualCallingModes[0].callingMode === 'GoogleMeet')
      && (apptStatus === 'started' || apptStatus === 'arrived' || apptStatus === 'confirmed')) {
        this.showJoinJaldeeVideoBtn = false;
      this.showJoinOtherVideoBtn = true;
      this.videoBtnCaption = 'Join Video';
      if (this.booking.videoCallMessage && this.booking.videoCallMessage === 'Call in progress') {
        this.videoBtnCaption = 'Re-join Video';
      }
    }
    if(this.booking.amountDue>0 && (this.booking.billViewStatus=='Show') && apptStatus !== 'cancelled' 
    && apptStatus !== 'rejected' && billStatus!=='settled'){
      this.showPayBtn = true;
    }
    const hasInvoice = this.booking.invoiceCreated || this.booking.billViewStatus === 'Show';
    if (apptStatus !== 'cancelled' && apptStatus !== 'rejected' && hasInvoice) {
      this.showInvoiceBtn = true;
    }
    if (this.booking.billViewStatus == 'Show' && 
    ((!(this.booking.amountDue>0) && apptStatus !== 'cancelled' && apptStatus !== 'rejected')
     || (apptStatus === 'cancelled' || apptStatus === 'rejected' && paymentStatus !== 'notpaid'))){
      this.showReceiptBtn = true;
    }
    if(this.booking.amountPaid){
      this.showPaidInfo = true;
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
    // this.getServiceGallery(this.booking);
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
    this.menuTrigger?.closeMenu(); // keep menu from staying open when triggering actions
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
    return this.dateTimeProcessor.convertMinutesToHourMinute(min);
  }
  getSingleTime(slot) {
    if(slot !==undefined){
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    } else{
      if(this.booking && (this.booking['apptStatus']==='RequestRejected' || this.booking['apptStatus']==='Requested')){
        const slots = this.booking['apptTakenTime'].split('-');
        return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
      }
    }
    return null;
  }
  stopprop(event) {
    event.stopPropagation();
  }
  joinOtherVideoPerform(data){
    window.open(data);
  }
  addToCalendar(event) {
    event.stopPropagation();
    this.calendarUrl;
    let config: CalendarOptions;
    if (this.booking && this.booking.providerAccount && this.booking.providerAccount.businessName) {
      this.businessName = this.booking.providerAccount.businessName;
    }
    console.log("booking time:", this.booking.appmtTime);
    let times = this.booking.appmtTime.split("-");
    const startTime = times[0];
    const endTime = times[1];
    const startDate = new Date(this.booking.appmtDate + 'T' + startTime);
    const endDate = new Date(this.booking.appmtDate + 'T' + endTime);
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
  getServiceGallery(apptInfo){
    this.bookingService.getAppointmentServices(apptInfo['location']['id']).then((appointmentServices:any)=>{
      console.log('services',appointmentServices);
      let departmentApptServices = appointmentServices.filter(service => ((service.id == apptInfo['service']['id'])));
      console.log('departmentApptServices',departmentApptServices);
      if(departmentApptServices && departmentApptServices[0] && departmentApptServices[0].servicegallery && departmentApptServices[0].servicegallery.length>0){
        this.selectedService.push(departmentApptServices);
      }
      else{
        this.selectedService=[];
      }
      console.log('selectedService',this.selectedService);
    })

  }
}
