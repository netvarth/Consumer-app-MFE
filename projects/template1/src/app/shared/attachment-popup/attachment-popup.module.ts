import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { AttachmentPopupComponent } from "./attachment-popup.component";
import { FileService, ShowuploadfileModule } from "jconsumer-shared";

@NgModule({
    imports: [
        MatDialogModule,
        ShowuploadfileModule,
        CommonModule
    ],
    exports: [
        AttachmentPopupComponent
    ],
    declarations: [
        AttachmentPopupComponent
    ],
    providers: [
        FileService
    ]
})
export class AttachmentPopupModule {}