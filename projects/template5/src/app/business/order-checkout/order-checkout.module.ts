import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderCheckoutComponent } from './order-checkout.component';
import { RouterModule, Routes } from '@angular/router';
import { TimelineModule } from 'primeng/timeline';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { DropdownModule } from 'primeng/dropdown';
import { TableModule } from 'primeng/table';
import { InputNumberModule } from 'primeng/inputnumber';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { ConfirmBoxModule } from 'jaldee-framework/confirm';
import { FormMessageDisplayModule } from 'jaldee-framework/form-message';
import { AddressComponent } from './address/address.component';
import { CouponsModule } from '../coupons/coupons.module';
import { ApplyCouponModule } from '../apply-coupon-new/apply-coupon.module';
import { OrderTemplatesModule } from '../order-templates/order-templates.module';
import { DialogService } from 'primeng/dynamicdialog';
import { PaymentModesModule } from './modes/payment-modes.module';


const routes: Routes =[
  { path:'', component:OrderCheckoutComponent}
]

@NgModule({
  declarations: [
    OrderCheckoutComponent,
    AddressComponent
  ],
  imports: [
    CommonModule,
    TimelineModule,
    ButtonModule,
    CouponsModule,
    ApplyCouponModule,
    RadioButtonModule,
    FormsModule,
    ReactiveFormsModule,
    NgxIntlTelInputModule,
    InputTextModule,
    InputTextareaModule,
    FormMessageDisplayModule,
    PaymentModesModule, 
    DropdownModule,
    InputNumberModule,
    ConfirmBoxModule,
    TableModule,
    OrderTemplatesModule,
    [RouterModule.forChild(routes)]
  ],
  providers: [RazorpayService, PaytmService, DialogService]
})
export class OrderCheckoutModule { }
