import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { InvoiceDetailsComponent } from "./invoice-details.component";
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