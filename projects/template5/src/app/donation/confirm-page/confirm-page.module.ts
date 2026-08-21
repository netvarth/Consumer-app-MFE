import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConfirmPageComponent } from "./confirm-page.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { RouterModule, Routes } from "@angular/router";
import { LoadingSpinnerModule } from "jconsumer-shared";
const routes: Routes = [
    {path: '', component: ConfirmPageComponent}
]
@NgModule({
    declarations: [ConfirmPageComponent],
    exports: [ConfirmPageComponent],
    imports: [
        CommonModule,
        LoadingSpinnerModule,
        MatTooltipModule,
        [RouterModule.forChild(routes)]
    ]
})
export class ConfirmPageModule{}