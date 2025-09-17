import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgModule } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { ConfirmPageComponent } from "./confirm-page.component";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { CapitalizeFirstPipeModule, I8nModule, LoadingSpinnerModule } from "jconsumer-shared";
import { ServiceInfoModule } from "../../shared/service-info/service-info.module";

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
        I8nModule,
        ServiceInfoModule,
        CapitalizeFirstPipeModule
    ],
    exports:[ConfirmPageComponent],
    declarations:[ConfirmPageComponent]
})
export class ConfirmPageModule{}