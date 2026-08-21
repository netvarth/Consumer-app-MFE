import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule } from '@angular/forms';
import { DeliverySelectionComponent } from './delivery-selection.component';



@NgModule({
  declarations: [DeliverySelectionComponent],
  exports: [DeliverySelectionComponent],
  imports: [
    CommonModule,
    RadioButtonModule,
    FormsModule

  ]
})
export class DeliverySelectionModule { }
