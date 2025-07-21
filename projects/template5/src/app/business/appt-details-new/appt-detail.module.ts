import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { RouterModule, Routes } from "@angular/router";
import { ApptDetailComponent } from "./appointmentdetail.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { QRCodeModule } from 'angularx-qrcode';
import { InboxListModule } from "../inbox/inbox-list/inbox-list.module";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { SharedModule } from "jaldee-framework/shared";
import { MatIconModule } from "@angular/material/icon";
import { MeetingDetailsModule } from "../meeting-details/meeting-details.module";
import { ActionPopupModule } from "../action-popup/action-popup.module";
import { I8nModule } from "../../modules/i8n/i8n.module";
import { AttachmentPopupModule } from "../attachment-popup/attachment-popup.module";
import { GalleryModule } from "@ks89/angular-modal-gallery";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { TeleBookingService } from "../../services/tele-bookings-service";
import { BookingService } from "../../services/booking-service";
const routes: Routes = [
    { path: '', component: ApptDetailComponent }
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
        QRCodeModule,
        AddInboxMessagesModule,
        MeetingDetailsModule,
        ActionPopupModule,
        GalleryModule,
        SharedModule,
        MatIconModule,
        AttachmentPopupModule,
        I8nModule
    ],
    exports:[
        ApptDetailComponent
    ],
    declarations: [
        ApptDetailComponent
    ],
    providers: [TeleBookingService,BookingService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
})
export class ApptDetailsModule {

}