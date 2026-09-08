import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { InvoiceDetailsComponent } from "./invoice-details.component";
import { CapitalizeFirstPipeModule, LoadingSpinnerModule, QuestionnaireModule } from "jconsumer-shared";
const routes: Routes = [
    { path: '', component: InvoiceDetailsComponent },
];
@NgModule({
    imports: [
        [RouterModule.forChild(routes)],
        CommonModule,
        QuestionnaireModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule
    ],
    exports: [InvoiceDetailsComponent],
    declarations: [
        InvoiceDetailsComponent
    ]
})
export class InvoiceDetailsModule {}