import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmBoxModule } from 'jaldee-framework/confirm';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CartComponent } from './cart.component';
import { ApplyCouponModule } from '../apply-coupon-new/apply-coupon.module';
import { OrderTemplatesModule } from '../order-templates/order-templates.module';
import { DialogService } from 'primeng/dynamicdialog';
import { TabMenuModule } from 'primeng/tabmenu';

const routes:Routes = [
  { path: '', component:CartComponent}
]

@NgModule({
  declarations: [
    CartComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    FormsModule,
    InputNumberModule,
    AuthenticationModule,
    ConfirmBoxModule,
    ApplyCouponModule,
    OrderTemplatesModule,
    TabMenuModule,
    [RouterModule.forChild(routes)]
  ],
  providers: [
    DialogService
  ]
})
export class CartModule { }
