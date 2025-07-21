import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { TeleBookingService } from "../../services/tele-bookings-service";
import { MeetingDetailsComponent } from "./meeting-details.component";
@NgModule({
    imports: [
        MatDialogModule,
        CommonModule
    ],
    exports: [MeetingDetailsComponent],
    declarations: [
        MeetingDetailsComponent
    ],
    providers: [TeleBookingService]
})
export class MeetingDetailsModule {}