import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatRadioModule } from '@angular/material/radio';
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { JcCouponNoteModule } from "jaldee-framework/jc-coupon-note";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { PaymentModesModule } from "jaldee-framework/payment/modes";
import { SharedModule } from "jaldee-framework/shared";
import { PaytmService } from "jaldee-framework/payment/paytm";
import { RazorpayService } from "jaldee-framework/payment/razorpay";
import { InvoiceListComponent } from "./invoice-list.component";
import { TableModule } from "primeng/table";
import { ButtonModule } from "primeng/button";
import { I8nModule } from "../../modules/i8n/i8n.module";

@NgModule({
    imports:[
        
        MatDialogModule,
        MatTooltipModule,
        LoadingSpinnerModule,
        CommonModule,
        MatCheckboxModule,
        FormsModule,
        TableModule,
        ButtonModule,
        JcCouponNoteModule,
        CapitalizeFirstPipeModule,
        PaymentModesModule,
        MatRadioModule,
        SharedModule,
        I8nModule
    ],
    exports:[InvoiceListComponent],
    declarations:[InvoiceListComponent],
    providers: [RazorpayService, PaytmService]
})
export class InvoiceListModule{}