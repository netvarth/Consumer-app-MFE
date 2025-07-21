import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { ConsumerWaitlistCheckInPaymentComponent } from "./checkin-payment.component";

@NgModule({
    imports: [
        MatDialogModule,
        MatButtonModule,
        FormMessageDisplayModule,
        CapitalizeFirstPipeModule,
        FormsModule,
        CommonModule
    ],
    exports: [ConsumerWaitlistCheckInPaymentComponent],
    declarations: [
        ConsumerWaitlistCheckInPaymentComponent
    ]
})
export class CheckinPaymentModule {}