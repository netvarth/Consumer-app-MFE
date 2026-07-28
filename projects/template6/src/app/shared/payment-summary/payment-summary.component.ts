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
 isCouponApplied(coupon: any): boolean {
    const couponValue = coupon?.value;
    if (!couponValue) {
      return false;
    }
    const systemNote = couponValue.systemNote || [];
    const appliedNoteOnly = Array.isArray(systemNote) && systemNote.length === 1 && systemNote.includes('COUPON_APPLIED');
    return couponValue.value !== '0.0' || appliedNoteOnly;
  }
}
