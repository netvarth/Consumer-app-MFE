import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-apply-coupon',
  templateUrl: './apply-coupon.component.html',
  styleUrls: ['./apply-coupon.component.scss']
})
export class ApplyCouponComponent implements OnInit {

  @Input() s3CouponsList;
  @Output() actionPerformed = new EventEmitter<any>();
  selectedCoupon: any;
  couponChecked: boolean;

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
  }

  couponCheck(event) {
    this.couponChecked = event.target.checked;
  }

  openCoupons() {
    this.actionPerformed.emit({ttype:'open'});
  }

  applyCoupons() {
    console.log("this.selectedCoupon",this.selectedCoupon)
    this.actionPerformed.emit({ttype:'validate', value: this.selectedCoupon});
  }
}