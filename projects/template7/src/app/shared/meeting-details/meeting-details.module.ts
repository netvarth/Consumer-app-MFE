import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MeetingDetailsComponent } from "./meeting-details.component";
import { TeleBookingService } from "../tele-bookings-service";
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