import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { OrderBillComponent } from "./order-bill.component";
import { MatRadioModule } from "@angular/material/radio";
import { JcCouponNoteModule } from "jaldee-framework/jc-coupon-note";
import { PaymentModesModule } from "jaldee-framework/payment/modes";
import { PaytmService } from "jaldee-framework/payment/paytm";
import { RazorpayService } from "jaldee-framework/payment/razorpay";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { SharedModule } from "jaldee-framework/shared";
const routes: Routes= [
    {path: '', component: OrderBillComponent}
]
@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatTooltipModule,
        MatCheckboxModule,
        JcCouponNoteModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        MatRadioModule,
        PaymentModesModule,
        SharedModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [OrderBillComponent],
    declarations: [OrderBillComponent],
    providers: [RazorpayService, PaytmService]
})
export class OrderBillModule {}