import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { ApptCardComponent } from "./appt-card.component";
import { BookingService, CapitalizeFirstPipeModule, I8nModule, ToastService } from "jconsumer-shared";
import { MessageService } from "primeng/api";
@NgModule({
    imports:[
        MatTooltipModule,
        MatIconModule,
        MatMenuModule,
        MatButtonModule,
        MatGridListModule,
        CommonModule,
        CapitalizeFirstPipeModule,
        I8nModule
    ],
    exports:[
        ApptCardComponent
    ],
    declarations: [
        ApptCardComponent
    ],
    providers:[BookingService, ToastService, MessageService],
})
export class ApptCardModule {}
