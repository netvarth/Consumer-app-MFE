import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { ConfirmPageComponent } from "./confirm-page.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { SharedModule } from "jaldee-framework/shared";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { I8nModule } from "../../modules/i8n/i8n.module";
const routes: Routes = [
    { path: '', component: ConfirmPageComponent }
];
@NgModule({
    imports:[
        [RouterModule.forChild(routes)],
        CommonModule,
        MatCheckboxModule,
        LoadingSpinnerModule,
        MatTooltipModule,
        FormsModule,
        SharedModule,
        I8nModule
    ],
    exports:[ConfirmPageComponent],
    declarations:[ConfirmPageComponent]
})
export class ConsumerApptConfirmModule{}