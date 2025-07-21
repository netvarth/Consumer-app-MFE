import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { projectConstantsLocal } from 'jaldee-framework/constants';
import { LocalStorageService } from 'jaldee-framework/storage/local';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { SubSink } from 'subsink';
import { projectConstants } from '../../constants/project-constants';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-confirm-page',
  templateUrl: './confirm-page.component.html',
  styleUrls: ['./confirm-page.component.css']
})
export class ConfirmPageComponent implements OnInit, OnDestroy {
  infoParams;
  waitlist: any = [];
  private subs = new SubSink();
  path = projectConstants.PATH;
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;

  email;
  apiloading = true;
  provider_label;
  type;
  uuids: any;
  theme: any;
  accountId: any; // Business Landing Page
  customId: any;
  from: any;
  account: any;
  accountConfig: any;
  accountProfile: any;
  constructor(
    private route: ActivatedRoute, private router: Router,
    private accountService: AccountService,
    private wordProcessor: WordProcessor, private lStorageService: LocalStorageService,
    private dateTimeProcessor: DateTimeProcessor, private consumerService: ConsumerService,
    public translate: TranslateService

  ) {
    this.wordProcessor.setTerminologies(this.accountService.getTerminologies());
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
  }
  addScript(script) {
    let script_tag = document.createElement("script");
    script_tag.type = "text/javascript";
    script_tag.text = script;
    document.getElementById('scriptContainer').appendChild(script_tag);
  }
  ngOnInit() {
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
    this.lStorageService.removeitemfromLocalStorage('itemArray');
    this.lStorageService.removeitemfromLocalStorage('serviceOPtionInfo');
    this.lStorageService.removeitemfromLocalStorage('serviceTotalPrice');
    this.lStorageService.removeitemfromLocalStorage('quesStore');
    this.subs.sink = this.route.queryParams.subscribe(
      (params) => {
        console.log(params);
        this.infoParams = params;
        if (this.infoParams.type === 'waitlistreschedule') {
          this.type = this.infoParams.type;
        }
        if (params['uuid']) {
          this.uuids = params['uuid'];
          console.log("UUIDs",this.uuids);
          if (params['multiple']) {
            for (const uuid of this.uuids) {
              this.subs.sink = this.consumerService.getCheckinByConsumerUUID(uuid, this.accountId).subscribe(
                (waitlist: any) => {
                  this.waitlist.push(waitlist);
                  this.apiloading = false;
                  if (this.accountConfig && this.accountConfig['scripts'] && this.accountConfig['scripts']['token_confirm']) {
                    console.log(this.accountConfig['scripts']['token_confirm_app']);
                    this.addScript(this.accountConfig['scripts']['token_confirm_app']);
                  }
                });
            }
          } else {
            console.log(this.uuids);
            this.subs.sink = this.consumerService.getCheckinByConsumerUUID(this.uuids, this.accountId).subscribe(
              (waitlist: any) => {
                this.waitlist.push(waitlist);
                this.apiloading = false;
              });
          }
        }
      });
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
  okClick(waitlist) {
    if (waitlist.service.livetrack) {
      this.router.navigate([this.customId, 'checkin', 'track', waitlist.ynwUuid]);
    } else {
      this.router.navigate([this.customId, 'dashboard']);
    }
    this.lStorageService.setitemonLocalStorage('orderStat', false);
  }
  updateEmail() {
  }
  getWaitTime(waitlist) {
    if (waitlist.calculationMode !== 'NoCalc') {
      if (waitlist.serviceTime) {
        return waitlist.serviceTime;
      } else if (waitlist.appxWaitingTime === 0) {
        return 'Now';
      } else if (waitlist.appxWaitingTime !== 0) {
        return this.dateTimeProcessor.convertMinutesToHourMinute(waitlist.appxWaitingTime);
      }
    }
  }
}
