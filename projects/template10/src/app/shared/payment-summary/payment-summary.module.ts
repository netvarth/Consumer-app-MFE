import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PaymentSummaryComponent } from './payment-summary.component';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { CapitalizeFirstPipeModule, I8nModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    PaymentSummaryComponent
  ],
  imports: [
    CommonModule,
    MatCheckboxModule,
    I8nModule,
    CapitalizeFirstPipeModule
  ],
  exports: [
    PaymentSummaryComponent
  ]
})
export class PaymentSummaryModule { }
