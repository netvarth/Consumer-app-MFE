import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-payment-summary',
  templateUrl: './payment-summary.component.html',
  styleUrls: ['./payment-summary.component.css']
})
export class PaymentSummaryComponent implements OnInit {

  @Input() paymentDetails;
  @Input() service;
  @Input() serviceOption;
  @Input() paymentMode;
  @Input() gatewayFee;
  @Input() convenientFee;

  constructor(
    public translate: TranslateService) { }

  ngOnInit(): void {
    
  }

}
