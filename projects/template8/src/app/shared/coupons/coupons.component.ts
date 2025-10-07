import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { CurrencyService, DateTimeProcessor } from 'jconsumer-shared';


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
  constructor(
    private dateTimeProcessor: DateTimeProcessor,
    private currencyService: CurrencyService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
  }
  ngOnInit() {
    console.log("theme",this.data.theme)
    if (this.data.couponsList.JC) {
      this.tempCouponList = this.data.couponsList.JC;
    }
    if (this.data.couponsList.OWN) {
      this.ownCoupons = this.data.couponsList.OWN;
    }
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
}
