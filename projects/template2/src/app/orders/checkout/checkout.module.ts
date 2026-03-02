import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { CheckoutComponent } from './checkout.component';
import { TableModule } from 'primeng/table';
import { 
  ConfirmBoxModule, 
  CurrencyService, 
  ErrrorMessageModule, 
  FormMessageDisplayModule,
  PaymentsModule,
  PhoneInputModule,
} from 'jconsumer-shared';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { ButtonModule } from 'primeng/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { RadioButtonModule } from 'primeng/radiobutton';
import { TimelineModule } from 'primeng/timeline';
import { AddressComponent } from './address/address.component';
import { ApplyCouponModule } from '../../home/apply-coupon/apply-coupon.module';
import { PaymentModesModule as PaymentModesNewModule } from '../../shared/payment-modes-new/payment-modes.module';
import { PaymentModesModule as PaymentModesLegacyModule } from '../../shared/payment-modes/payment-modes.module';

const routes: Routes = [
  {path: '', component: CheckoutComponent}
]

@NgModule({
  declarations: [
    AddressComponent,
    CheckoutComponent
  ],
  imports: [
    CommonModule,
    TimelineModule,
    ButtonModule,
    ApplyCouponModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    InputTextareaModule,
    FormMessageDisplayModule,
    PaymentModesNewModule,
    PaymentModesLegacyModule,
    DropdownModule,
    InputNumberModule,
    ConfirmBoxModule,
    TableModule,
    PaymentsModule,
    ErrrorMessageModule,
    PhoneInputModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    CheckoutComponent
  ],
  providers: [CurrencyService]
})
export class CheckoutModule { }
