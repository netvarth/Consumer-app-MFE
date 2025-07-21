import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgxNl2brModule } from "ngx-nl2br";
import { InboxListComponent } from "./inbox-list.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { InboxServices } from "../inbox.service";
import { AddInboxMessagesModule } from "../../add-inbox-messages/add-inbox-messages.module";
import { CapitalizeFirstPipeModule } from "jaldee-framework/pipes/capitalize";
import { SharedModule } from "jaldee-framework/shared";

@NgModule({
    declarations: [InboxListComponent],
    exports: [InboxListComponent],
    imports: [
        CommonModule,
        AddInboxMessagesModule,
        NgxNl2brModule,
        CapitalizeFirstPipeModule,
        MatTooltipModule,
        MatDialogModule,
        SharedModule
    ],
    providers: [
        InboxServices
    ]
})
export class InboxListModule{}
