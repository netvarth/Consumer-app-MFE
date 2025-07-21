import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { projectConstantsLocal } from 'jaldee-framework/constants';
import { SubSink } from 'subsink';
import { AccountService } from '../../services/account-service';
import { ConsumerService } from '../../services/consumer-service';
import { projectConstants } from '../../constants/project-constants';

@Component({
  selector: 'app-confirm-page',
  templateUrl: './confirm-page.component.html',
  styleUrls: ['./confirm-page.component.css']
})
export class ConfirmPageComponent implements OnInit, OnDestroy {

  path = projectConstants.PATH;
  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  apiloading = true;
  donation: any = [];
  private subs = new SubSink();
  customId: any;
  theme: any;
  accountConfig: any;
  account: any;
  accountProfile: any;
  constructor(
    private route: ActivatedRoute, 
    private router: Router,
    private consumerService: ConsumerService,
    private accountService: AccountService
  ) {
    this.subs.sink = this.route.queryParams.subscribe(
      params => {
        if (params['uuid']) {
          this.getDonations(params['uuid']);
        }
      });
  }
  getDonations(uuid) {
    this.subs.sink = this.consumerService.getConsumerDonationByUid(uuid).subscribe(
      (donations) => {
        this.donation = donations;
        this.apiloading = false;
      }
    );
  }
  ngOnInit(): void {
    this.account = this.accountService.getAccountInfo();
    this.accountConfig = this.accountService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
        this.theme = this.accountConfig['theme'];
    }
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.customId = this.accountProfile['customId'] ? this.accountProfile['customId'] : this.accountProfile['accEncUid'];
  }
  okClick() {
    this.router.navigate([this.customId, 'dashboard']);
  }
  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }
}
