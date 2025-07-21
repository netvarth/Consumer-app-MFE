import { Component, Inject, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { DOCUMENT } from '@angular/common';
import { Location } from '@angular/common';
import { ActionPopupComponent } from '../action-popup/action-popup.component';
import { SubSink } from 'subsink';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { MeetingDetailsComponent } from '../meeting-details/meeting-details.component';
import { TranslateService } from '@ngx-translate/core';
import { AddInboxMessagesComponent } from '../add-inbox-messages/add-inbox-messages.component';
import { TeleBookingService } from '../../services/tele-bookings-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { SnackbarService } from 'jaldee-framework/snackbar';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { projectConstants } from '../../constants/project-constants';
import { GroupStorageService } from 'jaldee-framework/storage/group';

@Component({
  selector: 'app-checkindetail',
  templateUrl: './checkindetail.component.html',
  styleUrls: ['./checkindetail.component.css']
})
export class CheckinDetailComponent implements OnInit, OnDestroy {

  private subs = new SubSink();
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
    this.subs.sink = this.activated_route.queryParams.subscribe(
      (qParams) => {
        console.log("qParams",qParams)
        this.ynwUuid = qParams['uuid'];
        if (this.ynwUuid.startsWith('h_')) {
          this.history = true;
        }
        this.type = qParams['type'];
        if (qParams['back'] && qParams['back'] == 0) {
          this.redirectTo = 'home'; 
        }
        console.log("this.redirectTo",this.redirectTo)
      });
      this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.customer_label = this.wordProcessor.getTerminologyTerm('customer');
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.cust_notes_cap = Messages.CHECK_DET_CUST_NOTES_CAP.replace('[customer]', this.customer_label);
    this.checkin_label = this.wordProcessor.getTerminologyTerm('checkin');
    this.no_cus_notes_cap = Messages.CHECK_DET_NO_CUS_NOTES_FOUND_CAP.replace('[customer]', this.customer_label);
    // this.phonenumber = waitlistjson.waitlistPhoneNumber;
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
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.getCommunicationHistory();
    this.getCheckinDetails();
    // this.getFavouriteProvider();
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
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  generateQR() {
    this.qr_value = this.path + 'status/' + this.waitlist.checkinEncId;
  }
  gotoPrev() {
    if (this.redirectTo && this.redirectTo === 'home') {
      this.providerDetail();
    } else {
      this.locationobj.back();
    }
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
    this.router.navigate([this.customId, 'dashboard']);
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
      theme: this.theme }
    });
    this.actiondialogRef.afterClosed().subscribe(data => {
    });
  }

  // getFavouriteProvider() {
  //   this.subs.sink = this.consumerService.getFavProvider()
  //     .subscribe(
  //       data => {
  //         this.fav_providers = data;
  //         this.fav_providers_id_list = [];
  //         this.setWaitlistTimeDetails();
  //       },
  //       error => {
  //       }
  //     );
  // }

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
}
