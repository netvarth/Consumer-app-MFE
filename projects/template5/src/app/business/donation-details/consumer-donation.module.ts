import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatChipsModule } from "@angular/material/chips";
import { MatDialogModule } from "@angular/material/dialog";
import { ConsumerDonationComponent } from "./consumer-donation.component";
import { RouterModule, Routes } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {  ReactiveFormsModule } from '@angular/forms';
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { AuthenticationModule } from "../authentication/authentication.module";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { PaymentModesModule } from "jaldee-framework/payment/modes";
import { RazorpayService } from "jaldee-framework/payment/razorpay";
import { PaytmService } from "jaldee-framework/payment/paytm";
import { SharedModule } from "jaldee-framework/shared";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { QuestionaireService } from "jaldee-framework/questionaire";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { BookingAccountinfoModule } from "../../modules/booking/account/booking-accountinfo.module";
const routes: Routes = [
    {path: '', component: ConsumerDonationComponent}
]
@NgModule({
    declarations: [ConsumerDonationComponent],
    exports: [ConsumerDonationComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatChipsModule,
        MatButtonModule,
        FormMessageDisplayModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        QuestionnaireModule,
        MatRadioModule,
        PaymentModesModule,
        NgxIntlTelInputModule,
        BookingAccountinfoModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        SharedModule,
        AuthenticationModule,
        [RouterModule.forChild(routes)]
    ],
    providers: [RazorpayService, PaytmService, QuestionaireService]
})
export class ConsumerDonationModule{}