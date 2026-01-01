import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'jconsumer-shared';

@Component({
  selector: 'app-apply-coupon',
  templateUrl: './apply-coupon.component.html',
  styleUrls: ['./apply-coupon.component.scss']
})
export class ApplyCouponComponent implements OnInit {

  @Input() s3CouponsList;
  @Input() theme: string | null = null;
  @Output() actionPerformed = new EventEmitter<any>();
  selectedCoupon: any;
  couponValid = true;
  couponError = null;
  couponsList: any = [];
  couponChecked: any = true;
  selectedCoupons: any = [];
  cdnPath = '';

  constructor(
    public translate: TranslateService,
    private sharedService: SharedService,
  ) {
    this.cdnPath = this.sharedService.getCDNPath();
   }

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
  applySelectedCoupon(code: string) {
    if (!code) {
      return;
    }
    this.couponChecked = true;
    this.selectedCoupon = code;
    this.clearCouponErrors();
    this.applyCoupons();
  }
  isCurrentCodeApplied(): boolean {
    const code = (this.selectedCoupon || '').trim();
    return code ? this.checkCouponExists(code) : false;
  }
  getApplyButtonLabel(): string {
    return this.isCurrentCodeApplied() ? 'APPLIED' : 'APPLY';
  }
  getCouponsCount(): number {
    const jc = this.s3CouponsList?.JC?.length || 0;
    const own = this.s3CouponsList?.OWN?.length || 0;
    return jc + own;
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
  }
}
