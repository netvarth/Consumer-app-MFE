import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-apply-coupon',
  templateUrl: './apply-coupon.component.html',
  styleUrls: ['./apply-coupon.component.scss']
})
export class ApplyCouponComponent implements OnInit, OnChanges {

  @Input() s3CouponsList;
  @Input() appliedCoupons: { provider?: string[]; jaldee?: string[] } | null = null;
  @Input() theme: string | null = null;
  @Output() actionPerformed = new EventEmitter<any>();
  selectedCoupon: any;
  couponValid = true;
  couponError = null;
  couponsList: any = [];
  couponChecked: any;
  selectedCoupons: any = [];
  invalidCoupons: Set<string> = new Set();

  constructor(public translate: TranslateService) { }

  ngOnInit(): void {
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['appliedCoupons'] || changes['s3CouponsList']) {
      this.syncAppliedCoupons();
    }
  }

  private normalizeCouponCode(value: any): string {
    if (typeof value !== 'string') {
      return '';
    }
    return value.replace(/\s+/g, '').trim().toUpperCase();
  }

  couponCheck(event) {
    this.couponChecked = event.target.checked;
  }

  openCoupons() {
    this.actionPerformed.emit({ttype:'open'});
  }
  checkCouponExists(couponCode) {
    const normalized = this.normalizeCouponCode(couponCode);
    let found = false;
    for (let index = 0; index < this.selectedCoupons.length; index++) {
      if (normalized === this.normalizeCouponCode(this.selectedCoupons[index])) {
        found = true;
        break;
      }
    }
    return found;
  }
  removeJCoupon(i) {
    const removedCode = this.selectedCoupons[i];
    this.selectedCoupons.splice(i, 1);
    this.couponsList.splice(i, 1);
    this.actionPerformed.emit({ ttype: 'remove', value: removedCode, selectedCoupons: this.selectedCoupons });
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
  applyCoupons() {
    this.couponError = null;
    this.couponValid = true;
    if (this.selectedCoupon) {
      const enteredCode = this.normalizeCouponCode(this.selectedCoupon);
      if (!enteredCode) {
        this.couponError = 'Coupon invalid';
        this.couponValid = false;
        return false;
      }
      if (this.checkCouponExists(enteredCode)) {
        this.couponError = 'Coupon already applied';
        this.couponValid = false;
        return false;
      }
      this.couponValid = false;
      let found = false;
      const jaldeeCoupons = Array.isArray(this.s3CouponsList?.JC) ? this.s3CouponsList.JC : [];
      const ownCoupons = Array.isArray(this.s3CouponsList?.OWN) ? this.s3CouponsList.OWN : [];
      for (let couponIndex = 0; couponIndex < jaldeeCoupons.length; couponIndex++) {
        const code = this.normalizeCouponCode(jaldeeCoupons[couponIndex]?.jaldeeCouponCode);
        if (code === enteredCode) {
          this.selectedCoupons.push(code);
          this.couponsList.push({
            couponCode: code,
            instructions: jaldeeCoupons[couponIndex]?.consumerTermsAndconditions || ''
          });
          found = true;
          this.selectedCoupon = '';
          break;
        }
      }
      for (let couponIndex = 0; couponIndex < ownCoupons.length; couponIndex++) {
        const code = this.normalizeCouponCode(ownCoupons[couponIndex]?.couponCode);
        if (code === enteredCode) {
          this.selectedCoupons.push(code);
          this.couponsList.push({
            couponCode: code,
            instructions: ownCoupons[couponIndex]?.consumerTermsAndconditions || ''
          });
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

  private syncAppliedCoupons(): void {
    const providerCodes = (this.appliedCoupons?.provider || []).map((code) => this.normalizeCouponCode(code));
    const jaldeeCodes = (this.appliedCoupons?.jaldee || []).map((code) => this.normalizeCouponCode(code));
    const applied = [...jaldeeCodes, ...providerCodes].filter((code) => !!code);
    this.selectedCoupons = applied;
    this.couponsList = [];

    const jcCoupons = Array.isArray(this.s3CouponsList?.JC) ? this.s3CouponsList.JC : [];
    const ownCoupons = Array.isArray(this.s3CouponsList?.OWN) ? this.s3CouponsList.OWN : [];

    applied.forEach((code) => {
      const jcMatch = jcCoupons.find((coupon) => this.normalizeCouponCode(coupon?.jaldeeCouponCode) === code);
      if (jcMatch) {
        this.couponsList.push({
          couponCode: code,
          instructions: jcMatch?.consumerTermsAndconditions || ''
        });
        return;
      }
      const ownMatch = ownCoupons.find((coupon) => this.normalizeCouponCode(coupon?.couponCode) === code);
      if (ownMatch) {
        this.couponsList.push({
          couponCode: code,
          instructions: ownMatch?.consumerTermsAndconditions || ''
        });
      }
    });
  }

  markCouponsNotApplicable(codes: string[] = []) {
    (codes || []).forEach((code) => {
      if (code) {
        this.invalidCoupons.add(code);
      }
    });
  }
}
