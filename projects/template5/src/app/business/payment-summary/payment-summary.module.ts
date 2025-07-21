import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSummaryComponent } from './payment-summary.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SharedModule } from 'jaldee-framework/shared';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { I8nModule } from '../../modules/i8n/i8n.module';



@NgModule({
  declarations: [
    PaymentSummaryComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    SharedModule,
    I8nModule,
    CapitalizeFirstPipeModule
  ],
  exports: [
    PaymentSummaryComponent
  ]
})
export class PaymentSummaryModule { }
