import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyCouponComponent } from './apply-coupon.component';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { I8nModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    ApplyCouponComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    I8nModule
  ],
  exports: [
    ApplyCouponComponent
  ]
})
export class ApplyCouponModule { }
