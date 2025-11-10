import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { NgxNl2brModule } from "ngx-nl2br";
import { InboxListComponent } from "./inbox-list.component";
import { MatTooltipModule } from "@angular/material/tooltip";
import { MatDialogModule } from "@angular/material/dialog";
import { CapitalizeFirstPipeModule } from "jconsumer-shared";
import { AddInboxMessagesModule } from "../../../shared/add-inbox-messages/add-inbox-messages.module";

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
    ]
})
export class InboxListModule{}
