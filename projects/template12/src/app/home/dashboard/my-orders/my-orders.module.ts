import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyOrdersComponent } from './my-orders.component';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapitalizeFirstPipeModule, ErrrorMessageModule, I8nModule } from 'jconsumer-shared';
import { AuthenticationModule } from '../../../shared/authentication/authentication.module';
import { InvoiceListModule } from '../../../shared/invoice-list/invoice-list.module';


const routes: Routes = [{
  path:'', component: MyOrdersComponent
}]

@NgModule({
  declarations: [
    MyOrdersComponent
  ],
  imports: [
    CommonModule,
    MatTooltipModule,
    I8nModule,
    AuthenticationModule,
    InvoiceListModule,
    CapitalizeFirstPipeModule,
    ErrrorMessageModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    MyOrdersComponent
  ]
})
export class MyOrdersModule { }
