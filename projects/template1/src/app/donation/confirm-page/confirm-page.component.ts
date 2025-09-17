import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsumerService, projectConstantsLocal, SharedService } from 'jconsumer-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-confirm-page',
  templateUrl: './confirm-page.component.html',
  styleUrls: ['./confirm-page.component.css']
})
export class ConfirmPageComponent implements OnInit, OnDestroy {

  dateFormat = projectConstantsLocal.PIPE_DISPLAY_DATE_FORMAT;
  newDateFormat = projectConstantsLocal.DATE_EE_MM_DD_YY_FORMAT;
  apiloading = true;
  donation: any = [];
  theme: any;
  accountConfig: any;
  private subscriptions: Subscription = new Subscription();
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consumerService: ConsumerService,
    private sharedService: SharedService
  ) {
    let subs = this.route.queryParams.subscribe(params => {
      if (params['uuid']) {
        this.getDonations(params['uuid']);
      }
    });
    this.subscriptions.add(subs);
  }
  getDonations(uuid) {
    let subs = this.consumerService.getConsumerDonationByUid(uuid).subscribe(
      (donations) => {
        this.donation = donations;
        this.apiloading = false;
      }
    );
    this.subscriptions.add(subs);
  }
  ngOnInit(): void {
    this.accountConfig = this.sharedService.getAccountConfig();
    if (this.accountConfig && this.accountConfig['theme']) {
      this.theme = this.accountConfig['theme'];
    }
  }
  okClick() {
    this.router.navigate([this.sharedService.getRouteID(), 'dashboard']);
  }
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
