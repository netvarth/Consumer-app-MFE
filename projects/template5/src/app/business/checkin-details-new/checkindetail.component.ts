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
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { TeleBookingService } from '../../services/tele-bookings-service';
import { BookingService } from '../../services/booking-service';
import { GalleryService } from '../gallery/galery-service';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { AttachmentPopupComponent } from '../attachment-popup/attachment-popup.component';
import { GalleryImportComponent } from '../gallery/import/gallery-import.component';
import { projectConstants } from '../../constants/project-constants';
import { GroupStorageService } from 'jaldee-framework/storage/group';

@Component({
  selector: 'app-checkindetail',
  templateUrl: './checkindetail.component.html',
  styleUrls: ['./checkindetail.component.scss']
})
export class CheckinDetailComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
  showviewAttachment=false;
  elementType = 'url';
  waitlist: any;
  api_loading = false;
  date_cap = Messages.CHECK_DET_DATE_CAP;
  location_cap = Messages.CHECK_DET_LOCATION_CAP;
  service_cap = Messages.CHECK_DET_SERVICE_CAP;
  send_msg_cap = Messages.CHECK_DET_SEND_MSG_CAP;
  checkin_label = '';
  dateFormatSp = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT_WITH_DAY;
  check_in_statuses = projectConstantsLocal.CHECK_IN_STATUSES;
  dateTimeFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_TIME_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  cancelledReasons = projectConstantsLocal.WAITLIST_CANCEL_RESON;
  cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP;
  addnotedialogRef: any;
  customer_label: any;
  no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP;
  consumerNote: any;
  ynwUuid: any;
  communication_history: any = [];
  titlename = 'Check-in Details';
  showtoken: any;
  provider_label;
  iconClass: string;
  view_more = false;
  path = projectConstants.PATH;
  qr_value: string;
  actiondialogRef: any;
  fav_providers: any;
  fav_providers_id_list: any[];
  wthistory;
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
  smallDevice: boolean;
  blogo: any;
  businessName: string;
  calendarUrl: string;
  selectedApptsTime: any;
  galleryDialog: any;
  homeView: any;
  reload_history_api = { status: true };
  showattachmentDialogRef: any;
  meetingDetails: ArrayBuffer;
  usrDetails: any;
  constructor(
    private activated_route: ActivatedRoute,
    private dialog: MatDialog,
    public locationobj: Location,
    private router: Router,
    @Inject(DOCUMENT) public document,
    private consumerService: ConsumerService,
    private accountService: AccountService,
    // private questionaireService: QuestionaireService,
    private sharedService: SharedService,
    private snackbarService: SnackbarService,
    private wordProcessor: WordProcessor,
    private dateTimeProcessor: DateTimeProcessor,
    private teleBookingService: TeleBookingService,
    private bookingService:BookingService,
    public translate: TranslateService,
    private galleryService: GalleryService,
    private groupService: GroupStorageService
  ) {
    this.usrDetails = this.groupService.getitemFromGroupStorage('ynw-user');
    this.subs.sink = this.activated_route.queryParams.subscribe(
      (qParams) => {
        this.ynwUuid = qParams['uuid'];
        if (this.ynwUuid.startsWith('h_')) {
          this.history = true;
        }
        this.type = qParams['type'];
      });
      this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
    this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
    this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
    // this.phonenumber = waitlistjson.waitlistPhoneNumber;
  }
  onResizeDevice() {
    if (window.innerWidth <= 767) {
      this.smallDevice = true;
    } else {
      this.smallDevice = false;
    }
  }
  ngOnInit() {
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.accountService.sendMessage({ ttype: 'showLocation' });
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    console.log('accountConfig',this.accountConfig);
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    if (this.accountConfig && this.accountConfig['mode']) {
      this.homeView = this.accountConfig['mode'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.getCommunicationHistory();
    this.getCheckinDetails();
    // this.getFavouriteProvider();
    this.onResizeDevice();
    this.businessInfo(this.accountProfile);
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
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
  businessInfo(acInfo) {
    if (acInfo && acInfo.logo && acInfo.logo.url){
      this.blogo = acInfo.logo.url;      
    }
  }
  processS3s(type, res) {
    let result = this.accountService.getJson(res);
    switch (type) {
      case 'terminologies': {
        this.wordProcessor.setTerminologies(result);
        this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
        this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
        this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
        this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
        this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
        break;
      }
    }
  }
  getCheckinDetails() {
    this.subs.sink = this.consumerService.getCheckinByConsumerUUID(this.ynwUuid, this.accountId).subscribe(
      (data) => {
        this.waitlist = data;
        this.getCheckintMeetingDetails(this.waitlist);
        if(this.waitlist && this.waitlist.service && this.waitlist.service.virtualCallingModes){
          this.whatsAppNumber = this.teleBookingService.getTeleNumber(this.waitlist.virtualService[this.waitlist.service.virtualCallingModes[0].callingMode]);
        }
        console.log(this.waitlist);
        if (this.waitlist.questionnaires && this.waitlist.questionnaires.length > 0) {
          this.questionnaires = this.waitlist.questionnaires;
        }
        if (this.waitlist.releasedQnr && this.waitlist.releasedQnr.length > 0 && this.waitlist.waitlistStatus !== 'cancelled') {
          const releasedQnrs = this.waitlist.releasedQnr.filter(qnr => qnr.status === 'released');
          if (releasedQnrs.length > 0) {
            this.getReleasedQnrs(releasedQnrs);
          }
        }
        this.api_loading = true;
        this.generateQR();
        this.getWtlistHistory(this.waitlist.ynwUuid, this.waitlist.providerAccount.id);
        if (this.waitlist.service.serviceType === 'virtualService') {
          switch (this.waitlist.service.virtualCallingModes[0].callingMode) {
            case 'Zoom': {
              this.iconClass = 'fa zoom-icon';
              break;
            }
            case 'GoogleMeet': {
              this.iconClass = 'fa meet-icon';
              break;
            }
            case 'WhatsApp': {
              if (this.waitlist.service.virtualServiceType === 'audioService') {
                this.iconClass = 'fa wtsapaud-icon';
              } else {
                this.iconClass = 'fa wtsapvid-icon';
              }
              break;
            }
            case 'Phone': {
              this.iconClass = 'fa phon-icon';
              break;
            }
            // Added by Mani
            case 'VideoCall': {
              this.iconClass = 'fa jvideo-icon jvideo-icon-s jvideo-icon-mgm5';
              break;
            }
          }
        }
        this.showtoken = this.waitlist.showToken;
        if (this.showtoken) {
          this.titlename = 'Token Details';
        }
      },
      (error) => {
        this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
      });
  }
  getCheckintMeetingDetails(checkin){
    console.log(checkin)
    if (checkin.service.serviceType === 'virtualService') {
      const _this = this;
      let callingMode: any;
      if (checkin && checkin.service && checkin.service.virtualCallingModes && checkin.service.virtualCallingModes[0] && checkin.service.virtualCallingModes[0].callingMode) {
        callingMode = checkin.service.virtualCallingModes[0].callingMode
      }
      return new Promise((resolve, reject) => {
        _this.consumerService.getConsumerWaitlistMeetingDetails(checkin.ynwUuid, callingMode, checkin.providerAccount.id).subscribe(data => {
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  generateQR() {
    this.qr_value = this.path + 'status/' + this.waitlist.checkinEncId;
  }
  gotoPrev() {
    // this.consumerService.backToDashboard='fromCheckinDetails';
    this.locationobj.back();
  }
  addCommonMessage(event) {
    event.stopPropagation();
    const pass_ob = {};
    pass_ob['source'] = 'consumer-waitlist';
    pass_ob['uuid'] = this.ynwUuid;
    pass_ob['user_id'] = this.waitlist.providerAccount.id;
    pass_ob['userId'] = this.waitlist.providerAccount.uniqueId;
    pass_ob['name'] = this.waitlist.providerAccount.businessName;
    pass_ob['typeOfMsg'] = 'single';
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
    this.addnotedialogRef.afterClosed().subscribe(result => {
      if (result === 'reloadlist') {
      }
    });
  }
  getCancelledReasonDisplayName(name) {
    let cancelReasons = this.cancelledReasons.filter(reason => reason.value == name);
    if (cancelReasons.length > 0) {
      return cancelReasons[0].title;
    }
    return name;
  }
  getCommunicationHistory() {
    this.subs.sink = this.consumerService.getConsumerCommunications(this.accountId)
      .subscribe(
        data => {
          const history: any = data;
          this.communication_history = [];
          for (const his of history) {
            if (his.waitlistId === this.ynwUuid) {
              this.communication_history.push(his);
            }
          }
          this.sortMessages();
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
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
  providerDetail() {
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
        theme: this.theme
      }
    });
    this.actiondialogRef.afterClosed().subscribe(data => {
    });
  }

  getFavouriteProvider() {
    this.subs.sink = this.consumerService.getFavProvider()
      .subscribe(
        data => {
          this.fav_providers = data;
          this.fav_providers_id_list = [];
          this.setWaitlistTimeDetails();
        },
        error => {
        }
      );
  }

  setWaitlistTimeDetails() {
    // let k = 0;
    for (const x of this.fav_providers) {
      this.fav_providers_id_list.push(x.id);
      // k++;
    }
  }

  checkIfFav(id) {
    let fav = false;
    if (this.fav_providers_id_list) {
      this.fav_providers_id_list.map((e) => {
        if (e === id) {
          fav = true;
        }
      });
      return fav;
    }
  }

  // doDeleteFavProvider(fav, event) {
  //   event.stopPropagation();
  //   if (!fav.id) {
  //     return false;
  //   }
  //   this.shared_functions.doDeleteFavProvider(fav, this)
  //     .then(
  //       data => {
  //         if (data === 'reloadlist') {
  //           this.getFavouriteProvider();
  //         }
  //       },
  //       error => {
  //         this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
  //       });
  // }
  // addFavProvider(id, event) {
  //   event.stopPropagation();
  //   if (!id) {
  //     return false;
  //   }
  //   this.subs.sink = this.sharedServices.addProvidertoFavourite(id)
  //     .subscribe(
  //       data => {
  //         this.getFavouriteProvider();
  //       },
  //       error => {
  //       }
  //     );
  // }
  getWtlistHistory(uuid, accid) {
    this.subs.sink = this.consumerService.getWtlistHistory(uuid, accid)
      .subscribe(
        data => {
          this.wthistory = data;
        },
        error => {
          this.snackbarService.openSnackBar(error, { 'panelClass': 'snackbarerror' });
        }
      );
  }
  getTimeToDisplay(min) {
    if (this.dateTimeProcessor.convertMinutesToHourMinute(min) === '0 minutes') {
      return 'Now';
    } else {
      return this.dateTimeProcessor.convertMinutesToHourMinute(min);
    }
  }
  joinMeetitng(actionObj) {
    if (actionObj === 'wl') {
      this.getMeetingDetails(this.waitlist, 'waitlist');
    }
  }
  getMeetingDetails(details, source) {
    console.log("details",details)
    if (details.videoCallButton && details.videoCallButton !== 'DISABLED') {
      if (details.ynwUuid) {
        this.router.navigate([this.customId, 'meeting', this.usrDetails.primaryPhoneNumber, details.ynwUuid]);
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
    this.consumerService.getWaitlistQuestionnaireByUid(this.ynwUuid, this.accountId)
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
      this.getCheckinDetails();
    }
  }
  getQnrStatus(qnr) {
    const id = (qnr.questionnaireId) ? qnr.questionnaireId : qnr.id;
    const questr = this.waitlist.releasedQnr.filter(questionnaire => questionnaire.id === id);
    if (questr[0]) {
      return questr[0].status;
    }
  }
  addWaitlistMessage(data) {
    const pass_ob = {};
    if (!data.checkinEncId) {
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
      if (this.waitlist.providerAccount && this.waitlist.providerAccount.businessName) {
        this.businessName = this.waitlist.providerAccount.businessName;
      }
      const startDate = new Date(this.waitlist.date);
      config = {
        title: this.businessName + ' - ' + this.waitlist.service.name,
        location: this.waitlist.location?.place,
        description: 'Time Slots: ' + this.selectedApptsTime,
        start: startDate
      }
    } else {
      if (this.type === 'reschedule') {
        if (this.waitlist.providerAccount && this.waitlist.providerAccount.businessName) {
          this.businessName = this.waitlist.providerAccount.businessName;
        }
        let times = this.waitlist.appxWaitingTime.split("-");

        const startTime = times[0];
        const endTime = times[1];
        console.log("waitlist Date:", this.waitlist.date);
        console.log("End Time:", endTime);

        const startDate = new Date(this.waitlist.date + 'T' + startTime);
        const endDate = new Date(this.waitlist.date + 'T' + endTime);
        config = {
          title:  this.businessName + ' - ' + this.waitlist.service.name,
          location: this.waitlist.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate,
        }
      } else {
        if (this.waitlist.providerAccount && this.waitlist.providerAccount.businessName) {
          this.businessName = this.waitlist.providerAccount.businessName;
        }
        console.log("Appt time:",this.waitlist.appxWaitingTime);
        let times = this.waitlist.appxWaitingTime.split("-");
        const startTime = times[0];
        const endTime = times[1];
        console.log("waitlist Date:", this.waitlist.date);
        console.log("End Time:", endTime);

        const startDate = new Date(this.waitlist.date + 'T' + startTime);
        const endDate = new Date(this.waitlist.date + 'T' + endTime);
        config = {
          title:  this.businessName + ' - ' + this.waitlist.service.name,
          location: this.waitlist.location?.place,
          description: 'Service provider : ' + this.businessName,
          start: startDate,
          end: endDate
        }
      }
    }
    console.log("config:", config);
    const googleCalendar = new GoogleCalendar(config);
    this.calendarUrl = googleCalendar.render();
    console.log('this.calendarUrl',this.calendarUrl);
    window.open(this.calendarUrl)
  }
  rescheduleAction(booking){
    this.gotoWaitlistReschedule(booking)
    // if (this.customId) { 
    //   booking['customId'] = this.customId;
    // }
    // this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
    //   width: '50%',
    //   panelClass: ['popup-class', 'commonpopupmainclass'],
    //   disableClose: true,
    //   data: { booking: booking,requestTye:'rescheduleAction', }
    // });
    // this.actiondialogRef.afterClosed().subscribe(data => {
    // });
  }
  gotoWaitlistReschedule(booking) {
    let queryParams = {
    uuid: booking.ynwUuid,
    type: 'waitlistreschedule',
    service_id: booking.service.id
  }
  const navigationExtras: NavigationExtras = {
    queryParams: queryParams
  };
  this.router.navigate([this.customId, 'checkin'], navigationExtras);
  }
  cancelAction(booking){
    this.doCancelWaitlist(booking);
    // if (this.customId) { 
    //   booking['customId'] = this.customId;
    // }
    // this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
    //   width: '50%',
    //   panelClass: ['popup-class', 'commonpopupmainclass'],
    //   disableClose: true,
    //   data: { booking: booking,requestTye:'cancelAction', }
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
    console.log('booking',booking);
    console.log('type',type);
    // this.sendAttachmentBooking(booking,type);
    if (this.customId) { 
      booking['customId'] = this.customId;
    }
    this.actiondialogRef = this.dialog.open(ActionPopupComponent, {
      width: '50%',
      panelClass: ['popup-class', 'commonpopupmainclass'],
      disableClose: true,
      data: { booking: booking,requestTye:'attachmentAction', attchmentFrom:'checkinDetails'}
    });
    this.actiondialogRef.afterClosed().subscribe(data => {
      this.showviewAttachment=true;
    });
  }
  sendAttachmentBooking(booking,type) {
    console.log('booking',booking);
    console.log('type',type);
    const pass_ob = {};
    // if (booking.appointmentEncId) {
    //   this.type = 'appt';
    // } else {
    //   this.type = 'checkin';
    // }
    pass_ob['user_id'] = booking.providerAccount.id;
    if (type === 'appt') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.uid;
    } else if (type === 'checkin') {
      pass_ob['type'] = type;
      pass_ob['uuid'] = booking.ynwUuid;
    } 
    console.log('pass_ob',pass_ob);
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
      this.reloadAPIs();
    });
  }
  reloadAPIs() {
    this.getCheckinDetails();
    this.reload_history_api = { status: true };
  }
  // sendAttachment(booking,type) {
  //   console.log('booking',booking);
  //   console.log('type',type);
  //   console.log('type',this.type);
  //   const pass_ob = {};
  //   if (booking.appointmentEncId) {
  //     this.type = 'appt';
  //   } else {
  //     this.type = 'checkin';
  //   }
  //   pass_ob['user_id'] = booking.providerAccount.id;
  //   if (this.type === 'appt') {
  //     pass_ob['type'] = this.type;
  //     pass_ob['uuid'] = booking.uid;
  //   } else if (this.type === 'checkin') {
  //     pass_ob['type'] = this.type;
  //     pass_ob['uuid'] = booking.ynwUuid;
  //   } 
  //   this.addattachment(pass_ob);
  // }
  // addattachment(pass_ob) {
  //   console.log(pass_ob);
  //   this.galleryDialog = this.dialog.open(GalleryImportComponent, {
  //     width: '50%',
  //     panelClass: ['popup-class', 'commonpopupmainclass'],
  //     disableClose: true,
  //     data: {
  //        source_id: 'consumerimages',
  //        accountId:pass_ob.user_id,
  //        uid:pass_ob.uuid,
  //        type:pass_ob.type,
  //        theme: this.theme
  //     }
  //   });
  //    this.galleryDialog.afterClosed().subscribe(result => {
  //      console.log(result);
  //      this.galleryDialog.close('reload');
  //     // this.reloadAPIs();
  //   });
  // }
  payBalanceServiceCharge(data){
    console.log(data)
  }
}