import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
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
    MatTooltipModule,
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
