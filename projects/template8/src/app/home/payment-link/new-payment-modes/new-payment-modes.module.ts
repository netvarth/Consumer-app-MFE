import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewPaymentModesComponent } from './new-payment-modes.component';
import { MatRadioModule } from '@angular/material/radio';



@NgModule({
  declarations: [
    NewPaymentModesComponent
  ],
  imports: [
    CommonModule,
    MatRadioModule
  ],
  exports: [NewPaymentModesComponent]
})
export class NewPaymentModesModule { }
