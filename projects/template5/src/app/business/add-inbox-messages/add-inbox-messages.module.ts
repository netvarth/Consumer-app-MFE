import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { SharedModule } from "jaldee-framework/shared";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { AddInboxMessagesComponent } from "./add-inbox-messages.component";
import { I8nModule } from "../../modules/i8n/i8n.module";

@NgModule({
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatInputModule,
        MatFormFieldModule,
        MatCheckboxModule,
        MatMenuModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        FormMessageDisplayModule,
        LoadingSpinnerModule,
        FormsModule,
        CommonModule,
        SharedModule,
        I8nModule
    ],
    exports: [AddInboxMessagesComponent],
    declarations: [
        AddInboxMessagesComponent
    ]
})
export class AddInboxMessagesModule {}