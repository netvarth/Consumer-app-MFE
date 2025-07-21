import { Component, Input, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { projectConstantsLocal } from 'jaldee-framework/constants';

@Component({
  selector: 'app-coupon-status',
  templateUrl: './coupon-status.component.html',
  styleUrls: ['./coupon-status.component.css']
})
export class CouponStatusComponent implements OnInit {

  @Input() paymentDetails;
  
  coupon_notes = projectConstantsLocal.COUPON_NOTES;

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
  }

}
