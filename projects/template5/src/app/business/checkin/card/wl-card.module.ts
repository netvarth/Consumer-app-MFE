import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { SharedModule } from "jaldee-framework/shared";
import { WlCardComponent } from "./wl-card.component";
import { I8nModule } from "../../../modules/i8n/i8n.module";

@NgModule({
    imports:[
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatGridListModule,
        CommonModule,
        CapitalizeFirstPipeModule,
        SharedModule,
        I8nModule
    ],
    exports:[
        WlCardComponent
    ],
    declarations: [
        WlCardComponent
    ]
})
export class WLCardModule {}