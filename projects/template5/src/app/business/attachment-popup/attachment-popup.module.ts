import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { FileService } from "jaldee-framework/file";
import { ShowuploadfileModule } from "jaldee-framework/showuploadfile";
import { AttachmentPopupComponent } from "./attachment-popup.component";

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