import { Component, OnInit } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-coupon-handler',
  templateUrl: './coupon-handler.component.html',
  styleUrls: ['./coupon-handler.component.scss']
})
export class CouponHandlerComponent implements OnInit {
  showCouponWB = false;     // To show hide the Coupon Work Bench area
  couponsList: any;
  constructor(private bookingService: BookingService) { }

  ngOnInit(): void {
    this.couponsList = this.bookingService.getCouponsList();
    if(this.couponsList.length > 0) {
      this.showCouponWB = true;
    }
  }

}
