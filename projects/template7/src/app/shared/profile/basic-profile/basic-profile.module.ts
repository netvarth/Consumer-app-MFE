import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatTooltipModule } from "@angular/material/tooltip";
import { BasicProfileComponent } from "./basic-profile.component";
import { CapitalizeFirstPipeModule } from "jconsumer-shared";

@NgModule({
    declarations: [
        BasicProfileComponent
    ],
    imports: [
        CommonModule,
        CapitalizeFirstPipeModule,
        MatTooltipModule
    ],
    exports: [
        BasicProfileComponent
    ]
})

export class BasicProfileModule {}
