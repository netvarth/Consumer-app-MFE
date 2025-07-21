import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApplyCouponComponent } from './apply-coupon.component';
import { FormsModule } from '@angular/forms';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';

@NgModule({
  declarations: [
    ApplyCouponComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    SharedModule,
    I8nModule
  ],
  exports: [
    ApplyCouponComponent
  ]
})
export class ApplyCouponModule { }
