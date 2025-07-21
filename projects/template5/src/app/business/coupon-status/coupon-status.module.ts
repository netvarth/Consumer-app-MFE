import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CouponStatusComponent } from './coupon-status.component';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';



@NgModule({
  declarations: [
    CouponStatusComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    I8nModule
  ],
  exports: [
    CouponStatusComponent
  ]
})
export class CouponStatusModule { }
