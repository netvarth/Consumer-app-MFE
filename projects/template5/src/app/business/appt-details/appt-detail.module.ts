import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { RouterModule, Routes } from "@angular/router";
import { ApptDetailComponent } from "./appointmentdetail.component";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { QRCodeModule } from 'angularx-qrcode';
import { ActionPopupModule } from "../action-popup/action-popup.module";
import { MeetingDetailsModule } from "../meeting-details/meeting-details.module";
import { InboxListModule } from "../inbox/inbox-list/inbox-list.module";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { TeleBookingService } from "../../services/tele-bookings-service";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { SharedModule } from "jaldee-framework/shared";
import { QuestionnaireModule } from "jaldee-framework/questionaire/edit";
import { GalleryModule } from "../gallery/gallery.module";
import { I8nModule } from "../../modules/i8n/i8n.module";
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
        I8nModule
    ],
    exports:[
        ApptDetailComponent
    ],
    declarations: [
        ApptDetailComponent
    ],
    providers: [TeleBookingService],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
})
export class ApptDetailsModule {

}