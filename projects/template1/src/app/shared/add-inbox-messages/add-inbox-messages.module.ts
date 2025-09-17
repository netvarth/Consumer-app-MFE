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
import { AddInboxMessagesComponent } from "./add-inbox-messages.component";
import { PdfViewerModule } from "ng2-pdf-viewer";
import { ErrrorMessageModule, FormMessageDisplayModule, LoadingSpinnerModule, ToastService } from "jconsumer-shared";
import { ToastModule } from "primeng/toast";
import { MessageService } from "primeng/api";

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
        PdfViewerModule,
        ErrrorMessageModule,
        ToastModule
    ],
    exports: [AddInboxMessagesComponent],
    declarations: [
        AddInboxMessagesComponent
    ],
    providers: [
        ToastService,
        MessageService
    ]
})
export class AddInboxMessagesModule {}