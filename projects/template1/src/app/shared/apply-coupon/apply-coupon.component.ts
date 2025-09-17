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
  couponValid = true;
  couponError = null;
  couponsList: any = [];
  couponChecked: any;
  selectedCoupons: any = [];

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
  }

  couponCheck(event) {
    this.couponChecked = event.target.checked;
  }

  openCoupons() {
    this.actionPerformed.emit({ttype:'open'});
  }
  checkCouponExists(couponCode) {
    let found = false;
    for (let index = 0; index < this.selectedCoupons.length; index++) {
      if (couponCode === this.selectedCoupons[index]) {
        found = true;
        break;
      }
    }
    return found;
  }
  removeJCoupon(i) {
    this.selectedCoupons.splice(i, 1);
    this.couponsList.splice(i, 1);
    this.actionPerformed.emit({ttype:'validate', value: this.selectedCoupons});
  }

  toggleterms(i) {
    if (this.couponsList[i].showme) {
      this.couponsList[i].showme = false;
    } else {
      this.couponsList[i].showme = true;
    }
  }
  clearCouponErrors() {
    this.couponValid = true;
    this.couponError = null;
  }
  applyCoupons() {
    this.couponError = null;
    this.couponValid = true;
    const couponInfo = {
      'couponCode': '',
      'instructions': ''
    };
    if (this.selectedCoupon) {
      const jaldeeCoupn = this.selectedCoupon.trim();
      if (this.checkCouponExists(jaldeeCoupn)) {
        this.couponError = 'Coupon already applied';
        this.couponValid = false;
        return false;
      }
      this.couponValid = false;
      let found = false;
      for (let couponIndex = 0; couponIndex < this.s3CouponsList.JC.length; couponIndex++) {
        if (this.s3CouponsList.JC[couponIndex].jaldeeCouponCode.trim() === jaldeeCoupn) {
          this.selectedCoupons.push(this.s3CouponsList.JC[couponIndex].jaldeeCouponCode);
          couponInfo.couponCode = this.s3CouponsList.JC[couponIndex].jaldeeCouponCode;
          couponInfo.instructions = this.s3CouponsList.JC[couponIndex].consumerTermsAndconditions;
          this.couponsList.push(couponInfo);
          found = true;
          this.selectedCoupon = '';
          break;
        }
      }
      for (let couponIndex = 0; couponIndex < this.s3CouponsList.OWN.length; couponIndex++) {
        if (this.s3CouponsList.OWN[couponIndex].couponCode.trim() === jaldeeCoupn) {
          this.selectedCoupons.push(this.s3CouponsList.OWN[couponIndex].couponCode);
          couponInfo.couponCode = this.s3CouponsList.OWN[couponIndex].couponCode;
          if (this.s3CouponsList.OWN[couponIndex].consumerTermsAndconditions) {
            couponInfo.instructions = this.s3CouponsList.OWN[couponIndex].consumerTermsAndconditions;
          }
          this.couponsList.push(couponInfo);
          found = true;
          this.selectedCoupon = '';
          break;
        }
      }
      if (found) {
        this.couponValid = true;
        this.actionPerformed.emit({ttype:'validate', value: this.selectedCoupons});
      } else {
        this.couponError = 'Coupon invalid';
      }
    }
    return true;
  }
}