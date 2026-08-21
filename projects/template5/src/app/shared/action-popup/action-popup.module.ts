import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatInputModule } from "@angular/material/input";
import { ActionPopupComponent } from "./action-popup.component";
import { MeetingDetailsModule } from "../meeting-details/meeting-details.module";
import { AddInboxMessagesModule } from "../add-inbox-messages/add-inbox-messages.module";
import { ErrrorMessageModule } from "jconsumer-shared";

@NgModule({
    imports:[
        MatDialogModule,
        CommonModule,
        MatGridListModule,
        MatFormFieldModule,
        MatInputModule,
        AddInboxMessagesModule,
        MeetingDetailsModule,
        ErrrorMessageModule
    ],
    exports:[
        ActionPopupComponent
    ],
    declarations:[
        ActionPopupComponent
    ]
})
export class ActionPopupModule {}