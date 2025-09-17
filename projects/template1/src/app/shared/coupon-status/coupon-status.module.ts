import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponStatusComponent } from './coupon-status.component';
import { I8nModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    CouponStatusComponent
  ],
  imports: [
    CommonModule,
    I8nModule
  ],
  exports: [
    CouponStatusComponent
  ]
})
export class CouponStatusModule { }
