import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ConfirmPageComponent } from "./confirm-page.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { SharedModule } from "jaldee-framework/shared";
import { TranslateModule } from "@ngx-translate/core";
const routes: Routes = [
    { path: '', component: ConfirmPageComponent }
];
@NgModule({
    imports:[
        [RouterModule.forChild(routes)],
        CommonModule,
        LoadingSpinnerModule,
        MatTooltipModule,
        SharedModule,
        TranslateModule
    ],
    exports:[ConfirmPageComponent],
    declarations:[ConfirmPageComponent]
})
export class ConsumerCheckinConfirmModule{}