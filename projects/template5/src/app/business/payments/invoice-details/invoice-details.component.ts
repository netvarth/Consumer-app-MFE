import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { WordProcessor } from 'jaldee-framework/word-processor';
import { Messages } from 'jaldee-framework/constants';
import { ConsumerService } from '../../../services/consumer-service';
import { AccountService } from '../../../services/account-service';

@Component({
  selector: 'app-invoice-details',
  templateUrl: './invoice-details.component.html',
  styleUrls: ['./invoice-details.component.scss']
})
export class InvoiceDetailsComponent implements OnInit {
  invoiceDetailsById: any;
  refund_value: number;
  api_loading = false;
  accId: any;
  invoiceId: any;
  checkJcash = false;
  checkJcredit = false;
  jaldeecash: any;
  jcashamount: any;
  jcreditamount: any;
  billdate = '';
  dueDate = '';
  billtime = '';
  gstnumber = '';
  billnumber = '';
  bname = '';
  splocation: any;
  provider_label = '';
  gstin_cap = Messages.GSTIN_CAP;
  account: any;
  accountProfile: any;
  accountId: any;
  logo: any;
  constructor(private activated_route: ActivatedRoute,
    private wordProcessor: WordProcessor,
    private location: Location,
    private consumerService: ConsumerService,
    private accountService: AccountService,
  ) 
    { this.activated_route.queryParams.subscribe(
      (queryParams) => {
        console.log(queryParams)
          this.api_loading = true;
          if (queryParams['accId']) {
              this.accId = queryParams['accId'];
          }
          if (queryParams['invId']) {
            this.invoiceId = queryParams['invId'];
        }
      }); }

  ngOnInit(): void {
    this.provider_label = this.wordProcessor.getTerminologyTerm('provider');
    this.account = this.accountService.getAccountInfo();
    this.accountProfile = this.accountService.getJson(this.account['businessProfile']);
    this.accountId = this.accountProfile.id;
    if (this.accountProfile && this.accountProfile.businessLogo && this.accountProfile.businessLogo.length > 0) {
      this.logo = this.accountProfile.businessLogo[0].s3path;
    }
    this.getInvoice();
  }
  getInvoice() {
    this.consumerService.getInvoice(this.accId, this.invoiceId)
        .subscribe(data => {
            this.invoiceDetailsById = data;
            if (this.invoiceDetailsById.amountDue < 0) {
                this.refund_value = Math.abs(this.invoiceDetailsById.amountDue);
            }
            if (this.invoiceDetailsById.amountDue > 0) {
                this.getJaldeeCashandCredit();
            }
            this.getInvoiceDateandTime();

        });
}
getInvoiceDateandTime() {
    if (this.invoiceDetailsById.hasOwnProperty('invoiceDate')) {
        this.billdate = this.invoiceDetailsById.invoiceDate;
        const datearr = this.invoiceDetailsById.invoiceDate.split(' ');
        const billdatearr = datearr[0].split('-');
        this.billtime = datearr[1] + ' ' + datearr[2];
        this.billdate = billdatearr[0] + '-' + billdatearr[1] + '-' + billdatearr[2];
    }
    if (this.invoiceDetailsById.hasOwnProperty('dueDate')) {
        this.dueDate = this.invoiceDetailsById.dueDate;
    }
    if (this.invoiceDetailsById.hasOwnProperty('invoiceId')) {
        this.billnumber = this.invoiceDetailsById.invoiceId;
    }
    if(this.invoiceDetailsById.taxSettings && this.invoiceDetailsById.taxSettings.gstNumber){
      this.gstnumber = this.invoiceDetailsById.taxSettings.gstNumber;
  }
    if(this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.businessName){
        this.bname = this.invoiceDetailsById.accountProfile.businessName;
    }
    if (this.invoiceDetailsById.accountProfile && this.invoiceDetailsById.accountProfile.location && this.invoiceDetailsById.accountProfile.location.place) {
        this.splocation = this.invoiceDetailsById.accountProfile.location.place;
    }
   

}
getJaldeeCashandCredit() {
  this.consumerService.getJaldeeCashandJcredit()
      .subscribe(data => {
          this.checkJcash = true
          this.jaldeecash = data;
          this.jcashamount = this.jaldeecash.jCashAmt;
          this.jcreditamount = this.jaldeecash.creditAmt;
      });

}
goBack() {
  this.location.back();
}
}
