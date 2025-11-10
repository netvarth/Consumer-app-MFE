import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { CapitalizeFirstPipeModule, I8nModule } from "jconsumer-shared";
import { ApptCardComponent } from "./appt-card.component";
@NgModule({
    imports:[
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatGridListModule,
        CommonModule,
        I8nModule,
        CapitalizeFirstPipeModule
    ],
    exports:[
        ApptCardComponent
    ],
    declarations: [
        ApptCardComponent
    ]
})
export class ApptCardModule {}