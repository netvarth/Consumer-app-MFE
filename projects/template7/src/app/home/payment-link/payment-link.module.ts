import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatRadioModule } from "@angular/material/radio";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { PaymentLinkComponent } from "./payment-link.component";
import { NgxNl2brModule } from "ngx-nl2br";
import { ButtonModule } from "primeng/button";
import { CapitalizeFirstPipeModule, DateFormatPipeModule, ErrrorMessageModule, I8nModule, LoadingSpinnerModule, PaymentModesModule, PaytmService, RazorpayService } from "jconsumer-shared";
import { NewPaymentModesModule } from "./new-payment-modes/new-payment-modes.module";
const routes: Routes = [
    {path: '', component: PaymentLinkComponent}
]
@NgModule({
    imports: [
        MatTooltipModule,
        CommonModule,
        NgxNl2brModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule,
        MatRadioModule,
        ButtonModule,
        PaymentModesModule,
        NewPaymentModesModule,
        DateFormatPipeModule,
        I8nModule,
        ErrrorMessageModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        PaymentLinkComponent
    ],
    declarations: [
        PaymentLinkComponent
    ],
    providers: [RazorpayService, PaytmService]
})
export class PaymentLinkModule {}