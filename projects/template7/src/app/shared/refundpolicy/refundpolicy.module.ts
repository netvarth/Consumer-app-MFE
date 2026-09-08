import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RefundpolicyComponent } from './refundpolicy.component';
import { CapitalizeFirstPipeModule } from 'jconsumer-shared';


@NgModule({
  declarations: [
    RefundpolicyComponent
  ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule
  ],
  exports: [
    RefundpolicyComponent
  ]
})
export class RefundpolicyModule { }
