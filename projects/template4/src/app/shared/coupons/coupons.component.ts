import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CurrencyService, DateTimeProcessor, SharedService } from 'jconsumer-shared';


@Component({
  selector: 'app-coupons',
  templateUrl: './coupons.component.html',
  styleUrls: ['./coupons.component.css']
})
export class CouponsComponent implements OnInit {
  couponsList: any = [];
  // type=false;
  tempCouponList: any = [];
  providerCouponList: any = [];
  ownCoupons: any = [];
  cdnPath = '';
  appliedCodes: Set<string> = new Set();
  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    private currencyService: CurrencyService,
    private sharedService: SharedService,
    private dialogRef: MatDialogRef<CouponsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.cdnPath = this.sharedService.getCDNPath();
  }
  ngOnInit() {
    console.log("theme",this.data.theme)
    if (this.data.couponsList.JC) {
      this.tempCouponList = this.data.couponsList.JC;
    }
    if (this.data.couponsList.OWN) {
      this.ownCoupons = this.data.couponsList.OWN;
    }
    if (this.data.selectedCoupons && Array.isArray(this.data.selectedCoupons)) {
      this.data.selectedCoupons.forEach(code => this.appliedCodes.add(code));
    }
    this.syncAppliedState(this.tempCouponList, false);
    this.syncAppliedState(this.ownCoupons, true);
    this.showCoupons();
  }
  showCoupons() {
    this.couponsList = [];
    this.providerCouponList = [];
    for (let index = 0; index < this.tempCouponList.length; index++) {
      this.couponsList.push(this.tempCouponList[index]);
      console.log(this.couponsList)
    }
    for (let index = 0; index < this.ownCoupons.length; index++) {
      this.providerCouponList.push(this.ownCoupons[index]);
      console.log(this.providerCouponList)
    }
  }
  formatDateDisplay(dateStr: any) {
    return this.dateTimeProcessor.formatDateDisplay(dateStr);
  }
  toggle_adwordshowmore(type: any, i: any) {
    if (type === 'jc') {
      if (this.couponsList[i].adwordshowmore) {
        this.couponsList[i].adwordshowmore = false;
      } else {
        this.couponsList[i].adwordshowmore = true;
      }
    } else if (type === 'provider') {
      if (this.providerCouponList[i].adwordshowmore) {
        this.providerCouponList[i].adwordshowmore = false;
      } else {
        this.providerCouponList[i].adwordshowmore = true;
      }
    }
  }
  formatPrice(price: any) {
    return this.currencyService.print_PricewithCurrency(price);
  }
  copyText(baseid: any, baseidtooltip: any, mainid: any) {
    let range: any = document.createRange();
    range.selectNode(document.getElementById(baseid + mainid));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    let tooltip: any = document.getElementById(baseidtooltip + mainid);
    tooltip.innerHTML = "Copied to Clipboard";
    tooltip.classList.add("copied-text");
  }
  resetTooltip(basetooltipid: any, mainid: any) {
    let tooltip: any = document.getElementById(basetooltipid + mainid);
    tooltip.innerHTML = "Copy";
    tooltip.classList.remove("copied-text");
  }
  applyCoupon(coupon: any, isProvider: boolean = false) {
    const code = isProvider ? coupon?.couponCode : coupon?.jaldeeCouponCode;
    if (!code) {
      return;
    }
    this.appliedCodes.add(code);
    if (coupon) {
      coupon.applied = true;
    }
    this.dialogRef.close({ couponCode: code, source: isProvider ? 'OWN' : 'JC' });
  }
  getDiscountLabel(coupon: any, isProvider: boolean = false): string {
    if (!coupon) {
      return '';
    }
    const type = isProvider ? (coupon.calculationType || '') : (coupon.discountType || '');
    const value = isProvider ? coupon.amount : coupon.discountValue;
    if (typeof type === 'string' && type.toUpperCase().includes('PERCENT')) {
      return `${value}% OFF`;
    }
    return `${this.currencyService.print_PricewithCurrency(value)} OFF`;
  }
  isCouponApplied(coupon: any): boolean {
    const code = coupon ? (coupon.couponCode || coupon.jaldeeCouponCode) : null;
    if (code && this.appliedCodes.has(code)) {
      return true;
    }
    return !!(coupon?.applied || coupon?.isApplied || coupon?.status === 'APPLIED');
  }
  getApplyLabel(coupon: any): string {
    return this.isCouponApplied(coupon) ? 'APPLIED' : 'APPLY';
  }

  private syncAppliedState(list: any[], isProvider: boolean) {
    if (!Array.isArray(list)) {
      return;
    }
    list.forEach(coupon => {
      const code = coupon ? (isProvider ? coupon.couponCode : coupon.jaldeeCouponCode) : null;
      const applied = code ? this.appliedCodes.has(code) : false;
      coupon.applied = applied;
      coupon.isApplied = applied;
      if (coupon && typeof coupon.status === 'string') {
        if (applied) {
          coupon.status = 'APPLIED';
        } else if (coupon.status === 'APPLIED') {
          coupon.status = '';
        }
      }
    });
  }
}
