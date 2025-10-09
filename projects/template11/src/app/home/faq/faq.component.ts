import { Location } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { AccountService, ServiceMeta, SharedService } from 'jconsumer-shared';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit, OnDestroy {
  account: any;
  accountProfile: any;
  questions: any = [];
  subs: Subscription = new Subscription();
  constructor(
    private sharedService: SharedService,
    private location: Location,
    private servicemeta: ServiceMeta
  ) { }

  ngOnDestroy(): void {
    this.subs.unsubscribe
  }

  ngOnInit(): void {
    const _this = this;
    this.account = this.sharedService.getAccountInfo();
    this.accountProfile = this.sharedService.getJson(this.account['businessProfile']);
    let sub1 = this.getFAQs(this.accountProfile.uniqueId).subscribe(
      (faqs: any) => {
        if (faqs) {
          _this.questions = faqs;
        }
      }
    );  
    this.subs.add(sub1);
  }

  getFAQs(uniqueId: any) {
    const path = this.sharedService.getConfigPath()+ uniqueId + '/faq.json?t=' + new Date();
    return this.servicemeta.httpGet(path);
  }

  goback() {
    this.location.back();
  }
}
