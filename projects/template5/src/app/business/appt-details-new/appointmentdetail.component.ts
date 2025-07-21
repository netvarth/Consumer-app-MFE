import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { SubSink } from 'subsink';
import { TranslateService } from '@ngx-translate/core';
import { CalendarOptions, GoogleCalendar } from 'datebook';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SharedService } from 'jaldee-framework/shared';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { projectConstants } from '../../constants/project-constants';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { TeleBookingService } from '../../services/tele-bookings-service';
import { BookingService } from '../../services/booking-service';
import { GalleryService } from '../gallery/galery-service';
import { AttachmentPopupComponent } from '../attachment-popup/attachment-popup.component';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { GalleryImportComponent } from '../gallery/import/gallery-import.component';
import { GroupStorageService } from 'jaldee-framework/storage/group';


@Component({
  selector: 'app-appointmentdetail',
  templateUrl:'./appointmentdetail.component.html',
  styleUrls: ['./appointmentdetail.component.scss']
})
export class ApptDetailComponent implements OnInit, OnDestroy {

  private subs = new SubSink(); 
  showviewAttachment=false;
  elementType = 'url';
  api_loading = false;
  date_cap = Messages.CHECK_DET_DATE_CAP;
  location_cap = Messages.CHECK_DET_LOCATION_CAP;
  service_cap = Messages.CHECK_DET_SERVICE_CAP;
  send_msg_cap = Messages.CHECK_DET_SEND_MSG_CAP;
  checkin_label = '';
  dateFormatSp = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT_WITH_DAY;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  dateTimeFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_TIME_FORMAT;
  check_in_statuses = projectConstantsLocal.CHECK_IN_STATUSES;
  cancelledReasons = projectConstantsLocal.WAITLIST_CANCEL_REASON;
  cust_notes_cap = '';
  addnotedialogRef: any;
  customer_label: any;
  no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP;
  ynwUuid: any;
  communication_history: any = [];
  appt;
  provider_label: any;
  qr_value: string;
  path = projectConstants.PATH;
  iconClass: string;
  view_more = false;
  actiondialogRef;
  fav_providers;
  fav_providers_id_list: any[];
  apptHistory: ArrayBuffer;
  questionnaire_heading = Messages.QUESTIONNAIRE_CONSUMER_HEADING;
  type;
  accountId: any;
  customId: any;
  questionnaires: any = [];
  whatsAppNumber: any;
  history: boolean = false;
  account: any;
  accountConfig: any;
  theme: any;
  accountProfile: any;
  smallDevice:boolean;
  blogo: any;
  selectedApptsTime: any;
  businessName: any;
  calendarUrl: string;
  meetingDetails: any;
  galleryDialog: any;
  selectedService: any=[];
  showattachmentDialogRef: any;
  config: any;
  usrDetails: any;
  constructor(
    private activated_route: ActivatedRoute,
    private dialog: MatDialog,
    private locationobj: Location,
    private router: Router,
    @Inject(DOCUMENT) public document,
    private consumerService: ConsumerService,
    private accountService: AccountService,
    private snackbarService: SnackbarService,
    private wordProcessor: WordProcessor,
    private sharedService: SharedService,
    private dateTimeProcessor: DateTimeProcessor,
    private teleBookingService: TeleBookingService,
    public translate: TranslateService,
    private bookingService: BookingService,
    private galleryService: GalleryService,
    private groupService: GroupStorageService
  ) {
    this.usrDetails = this.groupService.getitemFromGroupStorage('ynw-user');
    this.activated_route.queryParams.subscribe(
      (qParams) => {
        this.ynwUuid = qParams['uuid'];
        this.type = qParams['type'];
        if (this.ynwUuid.startsWith('h_')) {
          this.history = true;
        }
      });
        }
  ngOnInit() {
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    console.log('type',this.type)
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.config = this.accountService.getTemplateJson();
    if (this.config.theme) {
      this.theme = this.config.theme;
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    console.log('this.provider_label',this.provider_label)
    this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
    this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
    this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
    this.getCommunicationHistory();
    this.getApptDetails();
    this.businessInfo(this.accountProfile);
    this.onResizeDevice();
    this.subs.sink = this.galleryService.getMessage().subscribe(input => {
      console.log("Reached Here:");
      if (input && input.accountId && input.uuid && input.type === 'appt' && input.value) {
        this.consumerService.addAppointmentAttachment(input.accountId, input.uuid, input.value)
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
      } else {
        if (input && input.accountId && input.uuid && input.type === 'checkin') {
          this.consumerService.addWaitlistAttachment(input.accountId, input.uuid, input.value)
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
  
  onResizeDevice() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  businessInfo(acInfo) {
    if (acInfo && acInfo.logo && acInfo.logo.url)
      this.blogo = acInfo.logo.url
  }
  getServiceGallery(apptInfo){
    this.bookingService.getAppointmentServices(apptInfo['location']['id']).then((appointmentServices:any)=>{
      console.log('services',appointmentServices);
      let departmentApptServices = appointmentServices.filter(service => ((service.id == this.appt['service']['id'])));
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
  getApptDetails() {
    this.subs.sink = this.consumerService.getAppointmentByConsumerUUID(this.ynwUuid, this.accountId).subscribe(
      (data) => {
        this.appt = data;
        console.log("Appointment Details By account ID : ", this.appt)
        this.getApptMeetingDetails(this.appt);
        this.getServiceGallery(this.appt);
        if (this.appt && this.appt.service && this.appt.service.virtualCallingModes) {
          this.whatsAppNumber = this.teleBookingService.getTeleNumber(this.appt.virtualService[this.appt.service.virtualCallingModes[0].callingMode]);
        }
        console.log("Deatils:", this.appt)
        if (this.appt.questionnaires && this.appt.questionnaires.length > 0) {
          this.questionnaires = this.appt.questionnaires;
        }
        if (this.appt.releasedQnr && this.appt.releasedQnr.length > 0 && this.appt.apptStatus !== 'Cancelled') {
          const releasedQnrs = this.appt.releasedQnr.filter(qnr => qnr.status === 'released');
          if (releasedQnrs.length > 0) {
            this.getReleasedQnrs(releasedQnrs);
          }
        }
        this.api_loading = true;
        this.generateQR();
        this.getAppointmentHistory(this.appt.uid, this.appt.providerAccount.id);
        if (this.appt.service.serviceType === 'virtualService') {
          switch (this.appt.service.virtualCallingModes[0].callingMode) {
            case 'Zoom': {
              this.iconClass = 'fa zoom-icon';
              break;
            }
            case 'GoogleMeet': {
              this.iconClass = 'fa meet-icon';
              break;
            }
            case 'WhatsApp': {
              if (this.appt.service.virtualServiceType === 'audioService') {
                this.iconClass = 'fa wtsapaud-icon';
              } else {
                this.iconClass = 'fa wtsapvid-icon';
              }
              break;
            }
            // Added by Mani
            case 'VideoCall': {
              this.iconClass = 'fa jvideo-icon jvideo-icon-s jvideo-icon-mgm5';
              break;
            }
            case 'Phone': {
              this.iconClass = 'fa phon-icon';
              break;
            }
          }
        }
      },
      (error) => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      });
    //}
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  generateQR() {
    this.qr_value = this.path + 'status/' + this.appt.appointmentEncId;
    console.log("this.qr_value",this.qr_value)
  }
  gotoPrev() {
    // this.consumerService.backToDashboard='fromApptDetails';
    this.locationobj.back();
  }
  addCommonMessage(appt, event) {
    event.stopPropagation();
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['uuid'] = this.ynwUuid;
    pass_ob['user_id'] = appt.providerAccount.id;
    pass_ob['userId'] = appt.providerAccount.uniqueId;
    pass_ob['name'] = appt.providerAccount.businessName;
    pass_ob['appt'] = 'appt';
    pass_ob['typeOfMsg'] = 'single';
    this.addNote(pass_ob);
  }
  addNote(pass_ob) {
    // this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
    //   width: '50%',
    //   panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
    //   disableClose: true,
    //   autoFocus: true,
    //   data: pass_ob
    // });
    // this.addnotedialogRef.afterClosed().subscribe(result => {
    //   if (result === 'reloadlist') {
    //   }
    // });
  }
  getSingleTime(slot) {
    if (slot) {
      const slots = slot.split('-');
      return this.dateTimeProcessor.convert24HourtoAmPm(slots[0]);
    }
  }
  getCommunicationHistory() {
    this.subs.sink = this.consumerService.getConsumerCommunications(this.accountId)
      .subscribe(
        data => {
          console.log(" Communication History : ", data);
          const history: any = data;
          this.communication_history = [];
          for (const his of history) {
            if (his.waitlistId === this.ynwUuid) {
              this.communication_history.push(his);
              console.log(" Communication History Message : ", this.communication_history);

            }
          }
          this.sortMessages();
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  // getCommunicationHistory() {
  //   this.subs.sink = this.consumer_services.getConsumerCommunications(this.accountId)
  //     .subscribe(
  //       data => {
  //         const history: any = data;
  //         this.communication_history = [];
  //         for (const his of history) {
  //           if (his.waitlistId === this.ynwUuid) {
  //             this.communication_history.push(his);
  //           }
  //         }
  //         this.sortMessages();
  //       },
  //       error => {
  //         this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
  //       }
  //     );
  // }
  sortMessages() {
    this.communication_history.sort(function (message1, message2) {
      if (message1.timeStamp < message2.timeStamp) {
        return 11;
      } else if (message1.timeStamp > message2.timeStamp) {
        return -1;
      } else {
        return 0;
      }
    });
  }
  providerDetail(provider) {
    this.router.navigate([this.customId]);
  }

  viewMore() {
    this.view_more = !this.view_more;
  }
  gotoActions(booking) {
    if (this.customId) {
      booking['customId'] = this.customId;
    }
    this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: { booking,
        theme:this.theme
       }
    });
    this.actiondialogRef.afterClosed().subscribe(data => {
    });
  }
  getAppointmentHistory(u_id, accid) {
    this.subs.sink = this.consumerService.getApptHistory(u_id, accid)
      .subscribe(
        data => {
          this.apptHistory = data;
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  joinMeetitng(actionObj) {
    if (actionObj === 'appt') {
      this.getMeetingDetails(this.appt, 'appt');
    }
  }
  getMeetingDetails(details, source) {
    console.log("details",details)
    if (details.videoCallButton && details.videoCallButton !== 'DISABLED') {
      if (details.uid) {
        this.router.navigate([this.customId, 'meeting', this.usrDetails.primaryPhoneNumber, details.uid]);
      }
    } else {
      return false;
    }
    // const passData = {
    //   'type': source,
    //   'details': details
    // };
    // this.addnotedialogRef = this.dialog.open(MeetingDetailsComponent, {
    //   width: '50%',
    //   panelClass: ['commonpopupmainclass', 'popup-class'],
    //   disableClose: true,
    //   data: passData
    // });
    // this.addnotedialogRef.afterClosed().subscribe(result => {
    // });
  }
  getReleasedQnrs(releasedQnrs) {
    this.consumerService.getApptQuestionnaireByUid(this.ynwUuid, this.accountId)
      .subscribe(
        (data: any) => {
          const qnrs = data.filter(function (o1) {
            return releasedQnrs.some(function (o2) {
              return o1.id === o2.id;
            });
          });
          this.questionnaires = this.questionnaires.concat(qnrs);
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  getQuestionAnswers(event) {
    if (event === 'reload') {
      this.getApptDetails();
    }
  }
  getQnrStatus(qnr) {
    const id = (qnr.questionnaireId) ? qnr.questionnaireId : qnr.id;
    const questr = this.appt.releasedQnr.filter(questionnaire => questionnaire.id === id);
    if (questr[0]) {
      return questr[0].status;
    }
  }

  addWaitlistMessage(data) {
    console.log('waitListMessage::',data);
    const pass_ob = {};
    if (data.appointmentEncId) {
      this.type = 'appt';
    } else {
      this.type = 'checkin';
    }
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['user_id'] = data.providerAccount.id;
    pass_ob['userId'] = data.providerAccount.uniqueId;
    pass_ob['name'] = data.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
    if (this.type === 'appt') {
      pass_ob['appt'] = this.type;
      pass_ob['uuid'] = data.uid;
    } else {
      pass_ob['uuid'] = data.ynwUuid;
    }
    this.addNoteMsg(pass_ob);
  }

  addNoteMsg(pass_ob) {
    // this.dialogRef.close();
    if (this.theme) {
      pass_ob['theme'] = this.theme;
    }
    this.addnotedialogRef = this.dialog.open(AddInboxMessagesComponent, {
      width: '50%',
      panelClass: ['commonpopupmainclass', 'popup-class', 'loginmainclass', 'smallform'],
      disableClose: true,
      autoFocus: true,
      data: pass_ob
    });
    this.addnotedialogRef.afterClosed().subscribe(result => {
      this.addnotedialogRef.close()
      if (result === 'reloadlist') {
      }
    });
  }
  addToCalendar() {
    this.calendarUrl;
    let config: CalendarOptions;

    if (this.selectedApptsTime) {
      if (this.appt.providerAccount && this.appt.providerAccount.businessName) {
        this.businessName = this.appt.providerAccount.businessName;
      }
      const startDate = new Date(this.appt.appmtDate);
      config = {
        title: this.businessName + ' - ' + this.appt.service.name,
        location: this.appt.location?.place,
        description: 'Time Slots: ' + this.selectedApptsTime,
        start: startDate
      }
    } else {
      if (this.type === 'reschedule') {
        if (this.appt.providerAccount && this.appt.providerAccount.businessName) {
          this.businessName = this.appt.providerAccount.businessName;
        }
        let times = this.appt.appmtTime.split("-");

        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.appt.appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.appt.appmtDate + 'T' + startTime);
        const endDate = new Date(this.appt.appmtDate + 'T' + endTime);
        config = {
          title: this.businessName + ' - ' + this.appt.service.name,
          location: this.appt.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate,
        }
      } else {
        if (this.appt.providerAccount && this.appt.providerAccount.businessName) {
          this.businessName = this.appt.providerAccount.businessName;
        }
        console.log("Appt time:", this.appt.appmtTime);
        let times = this.appt.appmtTime.split("-");
        const startTime = times[0];
        const endTime = times[1];
        console.log("Appt Date:", this.appt.appmtDate);
        console.log("End Time:", endTime);

        const startDate = new Date(this.appt.appmtDate + 'T' + startTime);
        const endDate = new Date(this.appt.appmtDate + 'T' + endTime);
        config = {
          title: this.businessName + ' - ' + this.appt.service.name,
          location: this.appt.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate
        }
      }
    }
    console.log("config:", config);
    const googleCalendar = new GoogleCalendar(config);
    this.calendarUrl = googleCalendar.render();
    console.log('this.calendarUrl', this.calendarUrl);
    window.open(this.calendarUrl)
  }
  getApptMeetingDetails(appt) {
    console.log(appt)
    if (appt.service.serviceType === 'virtualService') {
      const _this = this;
      let callingMode: any;
      if (appt && appt.service && appt.service.virtualCallingModes && appt.service.virtualCallingModes[0] && appt.service.virtualCallingModes[0].callingMode) {
        callingMode = appt.service.virtualCallingModes[0].callingMode
      }
      return new Promise((resolve, reject) => {
        _this.consumerService.getConsumerApptMeetingDetails(appt.uid, callingMode, appt.providerAccount.id).subscribe(data => {
          if (data) {
            resolve(data)
            // console.log(data);
            _this.meetingDetails = data;
          }
        }, ((error) => {
          reject(error);
          _this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }));
      })
    }
  }
  rescheduleAction(booking) {
    this.gotoAptmtReschedule(booking)
    // if (this.customId) {
    //   booking['customId'] = this.customId;
    // }
    // this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
    //   width: '50%',
    //   panelClass: ['popup-class', 'commonpopupmainclass'],
    //   disableClose: true,
    //   data: { booking: booking, requestTye: 'rescheduleAction', }
    // });
    // this.actiondialogRef.afterClosed().subscribe(data => {
    // });
  }
  gotoAptmtReschedule(booking) {
    let queryParams = {
      uuid: booking.uid,
      type: 'reschedule',
      service_id: booking.service.id
    }
    const navigationExtras: NavigationExtras = {
      queryParams: queryParams
    };
    this.router.navigate([this.customId, 'appointment'], navigationExtras);
  }
  cancelAction(booking) {
    this.doCancelWaitlist(booking);
    // if (this.customId) {
    //   booking['customId'] = this.customId;
    // }
    // this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
    //   width: '50%',
    //   panelClass: ['popup-class', 'commonpopupmainclass'],
    //   disableClose: true,
    //   data: { booking: booking, requestTye: 'cancelAction', }
    // });
    // this.actiondialogRef.afterClosed().subscribe(data => {
    // });
  }
  doCancelWaitlist(booking) {
    if (booking.appointmentEncId) {
      this.type = 'appointment';
    } else {
      this.type = 'checkin';
    }
    this.sharedService.doCancelWaitlist(booking, this.type, this.theme, this)
      .then(
        data => {
          if (data === 'reloadlist' && this.type === 'checkin') {
            this.router.navigate([this.customId, 'dashboard']);
          } else if (data === 'reloadlist' && this.type === 'appointment') {
            this.router.navigate([this.customId, 'dashboard']);
          }
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  sendAttachment(booking,type) {
    if (this.customId) { 
      booking['customId'] = this.customId;
    }
    this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: { booking: booking,requestTye:'attachmentAction', attchmentFrom:'apptDetails', theme:this.theme}
    });
    this.actiondialogRef.afterClosed().subscribe(data => {
      console.log("data1",data);
      this.showviewAttachment=true;
    });
    
  }
  sendAttachmentBooking(booking,type) {
    console.log(booking);
    console.log(type);
    const pass_ob = {};
    pass_ob['user_id'] = booking.providerAccount.id;
    if (type === 'appt') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.uid;
    } 
    else if (type === 'checkin') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.ynwUuid;
    } else {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.uid;
    }
    this.addattachment(pass_ob);
  }
  viewAttachment(booking, type) {
    if (type === 'appt') {
      console.log(type);
      this.subs.sink = this.consumerService.getAppointmentAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
        (communications: any) => {
          console.log("Communicaitons:", communications);
          this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
            width: '50%',
            panelClass: ['popup-class', 'commonpopupmainclass'],
            disableClose: true,
            data: {
              attachments: communications,
              type: 'appt',
              theme: this.theme
            }
          });
          this.showattachmentDialogRef.afterClosed().subscribe(result => {
            if (result === 'reloadlist') {
            }
          });
        });
    } else if (type === 'checkin') {
      this.subs.sink = this.consumerService.getWaitlistAttachmentsByUuid(booking.ynwUuid, booking.providerAccount.id).subscribe(
        (communications: any) => {
          this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
            width: '50%',
            panelClass: ['popup-class', 'commonpopupmainclass'],
            disableClose: true,
            data: {
              attachments: communications,
              type: 'checkin',
              theme: this.theme
            }
          });
          this.showattachmentDialogRef.afterClosed().subscribe(result => {
            if (result === 'reloadlist') {
            }
          });
        });
    }
  }
  // viewAttachment(booking, type) {
  //   if (type === 'appt') {
  //     console.log(type);
  //     this.subs.sink = this.bookingService.getConsumerAppointmentAttachmentsByUuid(booking.uid, booking.providerAccount.id).subscribe(
  //       (communications: any) => {

  //         this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
  //           width: '50%',
  //           panelClass: ['popup-class', 'commonpopupmainclass'],
  //           disableClose: true,
  //           data: {
  //             attachments: communications,
  //             type: 'appt',
  //             theme: this.theme
  //           }
  //         });
  //         this.showattachmentDialogRef.afterClosed().subscribe(result => {
  //           if (result === 'reloadlist') {
  //           }
  //         });
  //       });
  //   } else if (type === 'checkin') {
  //     this.subs.sink = this.bookingService.getConsumerWaitlistAttachmentsByUuid(booking.ynwUuid, booking.providerAccount.id).subscribe(
  //       (communications: any) => {
  //         this.showattachmentDialogRef = this.dialog.open(AttachmentPopupComponent, {
  //           width: '50%',
  //           panelClass: ['popup-class', 'commonpopupmainclass'],
  //           disableClose: true,
  //           data: {
  //             attachments: communications,
  //             type: 'checkin',
  //             theme: this.theme
  //           }
  //         });
  //         this.showattachmentDialogRef.afterClosed().subscribe(result => {
  //           if (result === 'reloadlist') {
  //           }
  //         });
  //       });
  //   }
  // }
  getCancelledReasonDisplayName(name) {
    let cancelReasons = this.cancelledReasons.filter(reason => reason.value == name);
    if (cancelReasons.length > 0) {
      return cancelReasons[0].title;
    }
    return name;
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
      this.galleryDialog.close('reload');
      // this.reloadAPIs();
    });
  }
}