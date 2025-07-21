import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { ConsumerPaymentDetailsComponent } from "./payment-details.component";
const routes: Routes = [
    { path: '', component: ConsumerPaymentDetailsComponent },
];
@NgModule({
    imports: [
        [RouterModule.forChild(routes)],
        CommonModule,
        QuestionnaireModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule
    ],
    exports: [ConsumerPaymentDetailsComponent],
    declarations: [
        ConsumerPaymentDetailsComponent
    ]
})
export class PaymentDetailsModule {}