import { Component, OnInit, OnDestroy } from '@angular/core';
import { SubSink } from 'subsink';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ConsumerService } from '../../services/consumer-service';
import { AccountService } from '../../services/account-service';
import { Messages, projectConstantsLocal } from 'jaldee-framework/constants';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { ProviderWaitlistCheckInConsumerNoteComponent } from '../../modules/provider-waitlist-checkin-consumer-note/provider-waitlist-checkin-consumer-note.component';

@Component({
    selector: 'app-consumer-donations',
    templateUrl: './donations.component.html'
})
export class ConsumerDonationsComponent implements OnInit,OnDestroy {
  
    payments: any;

    date_cap = Messages.DATE_CAP;
    time_cap = Messages.TIME_CAP;
    refundable_cap = Messages.REFUNDABLE_CAP;
    amount_cap = Messages.AMOUNT_CAP;
    status_cap = Messages.PAY_STATUS;
    mode_cap = Messages.MODE_CAP;
    refunds_cap = Messages.REFUNDS_CAP;
    donations: any = [];

    newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
    private subs=new SubSink();
    customId: any;
    accountId: any;
    accountConfig: any;
    account: any;
    theme: any;
    accountProfile: any;
    constructor(
        private dateTimeProcessor: DateTimeProcessor,
        private consumerService: ConsumerService,
        private router: Router,
        private dialog: MatDialog,
        private accountService: AccountService
    ) { }
    ngOnInit() {
        const _this = this;
        _this.account = _this.accountService.getAccountInfo();
        _this.accountConfig = _this.accountService.getAccountConfig();
        if (_this.accountConfig && _this.accountConfig['theme']) {
            _this.theme = _this.accountConfig['theme'];
        }
        _this.accountProfile = _this.accountService.getJson(_this.account['businessProfile']);
        _this.accountId = _this.accountProfile.id;
        this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
        this.getDonations();
    }
    ngOnDestroy(): void {
       this.subs.unsubscribe();
    }
    stringtoDate(dt, mod) {
        return this.dateTimeProcessor.stringtoDate(dt, mod);
    }
    getDonations() {
        let filter = {
            'donationStatus-eq' : 'SUCCESS'
        };
        if (this.accountId){
            filter['account-eq'] = this.accountId;
        }
       this.subs.sink= this.consumerService.getConsumerDonations(filter).subscribe(
            (donations) => {
                this.donations = donations;
            }
        );
    }
    showConsumerNote(donation) {
        const notedialogRef = this.dialog.open(ProviderWaitlistCheckInConsumerNoteComponent, {
          width: '50%',
          panelClass: ['popup-class', 'commonpopupmainclass'],
          disableClose: true,
          data: {
            checkin: donation,
            type: 'donation'
          }
        });
        notedialogRef.afterClosed().subscribe(result => {
          if (result === 'reloadlist') {
          }
        });
      }
      gotoDashboard() {
        this.router.navigate([this.customId, 'dashboard']);
      }
}
