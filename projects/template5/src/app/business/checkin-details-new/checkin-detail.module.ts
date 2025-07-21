import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { RouterModule, Routes } from "@angular/router";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { CheckinDetailComponent } from "./checkindetail.component";
import { InboxListModule } from "../inbox/inbox-list/inbox-list.module";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { SharedModule } from "jaldee-framework/shared";
import { MeetingDetailsModule } from "../meeting-details/meeting-details.module";
import { ActionPopupModule } from "../action-popup/action-popup.module";
import { TeleBookingService } from "../../services/tele-bookings-service";
import { BookingService } from "../../services/booking-service";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { AttachmentPopupModule } from "../attachment-popup/attachment-popup.module";
import { I8nModule } from "../../modules/i8n/i8n.module";
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { QRCodeModule } from "angularx-qrcode";

const routes: Routes = [
    { path: '', component: CheckinDetailComponent }
];
@NgModule({
    imports:[
        [RouterModule.forChild(routes)],
        MatDialogModule,
        CommonModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        QuestionnaireModule,
        MatExpansionModule,
        InboxListModule,
        MatTabsModule,
        AddInboxMessagesModule,
        MeetingDetailsModule,
        ActionPopupModule,
        AttachmentPopupModule,
        GalleryModule,
        SharedModule,
        I8nModule,
        QRCodeModule
    ],
    exports:[
        CheckinDetailComponent
    ],
    declarations: [
        CheckinDetailComponent
    ],
    providers: [TeleBookingService,BookingService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
})
export class CheckinDetailsModule {}