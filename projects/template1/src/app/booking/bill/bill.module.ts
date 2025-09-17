import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './bill.component';
import { 
  CapitalizeFirstPipeModule, 
  DateFormatPipeModule, 
  ErrrorMessageModule, 
  PaymentModesModule, 
  PaymentsModule 
} from 'jconsumer-shared';
import { PrintService } from './print.service';

const routes: Routes = [
  {path: '', component: BillComponent}
]

@NgModule({
  declarations: [
    BillComponent
  ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    DateFormatPipeModule,
    PaymentsModule,
    ErrrorMessageModule,
    PaymentModesModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    BillComponent
  ],
  providers: [
    PrintService
  ]
})
export class BillModule { }
