import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { SubSink } from 'subsink';
import { ConsumerService } from '../../services/consumer-service';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { AccountService } from '../../services/account-service';
import { TranslateService } from '@ngx-translate/core';
import { projectConstants } from '../../constants/project-constants';
import { TeleBookingService } from '../../services/tele-bookings-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { GroupStorageService } from 'jaldee-framework/storage/group';

@Component({
  selector: 'app-appointmentdetail',
  templateUrl: './appointmentdetail.component.html',
  styleUrls: ['./appointmentdetail.component.css']
})
export class ApptDetailComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
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
  redirectTo: string;
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
    private dateTimeProcessor: DateTimeProcessor,
    private teleBookingService: TeleBookingService,
    public translate: TranslateService,
    private lStorageService: LocalStorageService,
    private groupService: GroupStorageService,
  ) {
    this.usrDetails = this.groupService.getitemFromGroupStorage('ynw-user');
    this.activated_route.queryParams.subscribe(
      (qParams) => {
        console.log("qParams",qParams)
        this.ynwUuid = qParams['uuid'];
        this.type = qParams['type'];
        if (this.ynwUuid.startsWith('h_')) {
          this.history = true;
        }
        if (qParams['back'] && qParams['back'] == 0) {
          this.redirectTo = 'home'; 
        }
        console.log("this.redirectTo",this.redirectTo)
      });
  }
  ngOnInit() {
    let language = this.lStorageService.getitemfromLocalStorage('translatevariable');
    this.translate.setDefaultLang(language);
    this.translate.use(language);
    // this.translate.use(JSON.parse(localStorage.getItem('translatevariable')));
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
    this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
    this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
    this.getCommunicationHistory();
    this.getApptDetails();
  }
  getApptDetails() {
    this.subs.sink = this.consumerService.getAppointmentByConsumerUUID(this.ynwUuid, this.accountId).subscribe(
      (data) => {
        this.appt = data;
        console.log("Appointment Details By account ID : ", this.appt)
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
  }
  gotoPrev() {
    if (this.redirectTo && this.redirectTo === 'home') {
      this.providerDetail();
      console.log("providerDetail")
    } else {
      this.locationobj.back();
      console.log("locationobj")
    }
   
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
              console.log(" Communication History Message : ", this);

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
  providerDetail(provider?) {
    // this.router.navigate([this.customId]);
    console.log("providerDetail2")
    this.router.navigate([this.customId, 'dashboard']);  }

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
}
