import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CartComponent } from './cart.component';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmBoxModule, CurrencyService, ErrrorMessageModule } from 'jconsumer-shared';
import { ApplyCouponModule } from '../../home/apply-coupon/apply-coupon.module';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
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
    ErrrorMessageModule,
    TabMenuModule,
    [RouterModule.forChild(routes)]
  ],
  providers: [CurrencyService]
})
export class CartModule { }
