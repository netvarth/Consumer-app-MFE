import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AccountService } from '../../services/account-service';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  account: any;
  accountProfile: any;
  questions: any = [];

  constructor(
    private accountService: AccountService,
    private location: Location
  ) { }

  ngOnInit(): void {
    const _this= this;
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountService.getFAQs(this.accountProfile.uniqueId).then(
      (faqs: any) => {
        if (faqs) {
          _this.questions = faqs;
        }
      }
    );
  }

  goback() {
    this.location.back();
  }
}
