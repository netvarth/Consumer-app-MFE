import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatInputModule } from "@angular/material/input";
import { SharedModule } from "jaldee-framework/shared";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { MeetingDetailsModule } from "../meeting-details/meeting-details.module";
import { ActionPopupComponent } from "./action-popup.component";
import { GalleryModule } from "../gallery/gallery.module";
import { I8nModule } from "../../modules/i8n/i8n.module";

@NgModule({
    imports:[
        MatDialogModule,
        CommonModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        AddInboxMessagesModule,
        MeetingDetailsModule,
        SharedModule,
        GalleryModule,
        I8nModule
    ],
    exports:[
        ActionPopupComponent
    ],
    declarations:[
        ActionPopupComponent
    ]
})
export class ActionPopupModule {}