import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BillComponent } from './bill.component';
import { 
  CapitalizeFirstPipeModule, 
  DateFormatPipeModule, 
  PaymentsModule 
} from 'jconsumer-shared';

const routes: Routes = [
  {path: '', component: BillComponent}
]

@NgModule({
  declarations: [BillComponent],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    DateFormatPipeModule,
    PaymentsModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    BillComponent
  ]
})
export class BillModule { }
