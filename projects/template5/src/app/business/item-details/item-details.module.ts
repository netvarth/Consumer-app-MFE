import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ItemDetailsComponent } from "./item-details.component";
import { RouterModule, Routes } from "@angular/router";
const routes: Routes= [
    {path: '', component: ItemDetailsComponent}
]
@NgModule({
    declarations: [ItemDetailsComponent],
    exports: [ItemDetailsComponent],
    imports: [
        CommonModule,
        [RouterModule.forChild(routes)]
    ]
})
export class ItemDetailsModule{}