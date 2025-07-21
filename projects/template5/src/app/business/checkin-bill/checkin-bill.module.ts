import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { ConsumerCheckinBillComponent } from "./checkin-bill.component";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { MatRadioModule } from "@angular/material/radio";
    import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { PaymentModesModule } from "jaldee-framework/payment/modes";
import { RazorpayService } from "jaldee-framework/payment/razorpay";
import { PaytmService } from "jaldee-framework/payment/paytm";
import { SharedModule } from "jaldee-framework/shared";
import { JcCouponNoteModule } from "jaldee-framework/jc-coupon-note";
import { InvoiceListModule } from "../invoice-list/invoice-list.module";
const routes: Routes = [
    { path: '', component: ConsumerCheckinBillComponent }
];
@NgModule({
    imports:[
        [RouterModule.forChild(routes)],
        MatDialogModule,
        MatTooltipModule,
        LoadingSpinnerModule,
        CommonModule,
        MatCheckboxModule,
        FormsModule,
        JcCouponNoteModule,
        MatRadioModule,
        PaymentModesModule,
        SharedModule,
        InvoiceListModule,
        CapitalizeFirstPipeModule
    ],
    exports:[ConsumerCheckinBillComponent],
    declarations:[ConsumerCheckinBillComponent],
    providers: [RazorpayService, PaytmService]
})
export class ConsumerCheckinBillModule{}