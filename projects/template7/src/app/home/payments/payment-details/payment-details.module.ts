import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PaymentDetailsComponent } from "./payment-details.component";
import { CapitalizeFirstPipeModule, LoadingSpinnerModule, QuestionnaireModule } from "jconsumer-shared";
const routes: Routes = [
    { path: '', component: PaymentDetailsComponent },
];
@NgModule({
    imports: [
        [RouterModule.forChild(routes)],
        CommonModule,
        QuestionnaireModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule
    ],
    exports: [PaymentDetailsComponent],
    declarations: [
        PaymentDetailsComponent
    ]
})
export class PaymentDetailsModule {}