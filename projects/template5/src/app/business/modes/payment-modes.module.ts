import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatRadioModule } from '@angular/material/radio';
import { PaymentModesComponent } from './payment-modes.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [PaymentModesComponent],
  exports: [PaymentModesComponent],
  imports: [
    CommonModule,
    MatRadioModule,
    FormsModule
  ]
})
export class PaymentModesModule {}
