import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { QuickActionsComponent } from "./quick-actions.component";
import { SafeHtmlModule } from "jconsumer-shared";

@NgModule({
    declarations: [
        QuickActionsComponent

    ],
    imports: [
        SafeHtmlModule,
        CommonModule
    ],
    exports: [
        QuickActionsComponent
    ]
})

export class QuickActionsModule {}