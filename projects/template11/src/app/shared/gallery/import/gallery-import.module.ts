import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatIconModule } from "@angular/material/icon";
import { MatInputModule } from "@angular/material/input";
import { MatMenuModule } from "@angular/material/menu";
import { GalleryImportComponent } from "./gallery-import.component";
import { ErrrorMessageModule, FileService, FormMessageDisplayModule } from "jconsumer-shared";

@NgModule({
    declarations: [GalleryImportComponent],
    exports: [GalleryImportComponent],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatButtonModule,
        MatInputModule,
        MatMenuModule,
        MatIconModule,
        FormMessageDisplayModule,
        ErrrorMessageModule
    ],
    providers: [
        FileService
    ]
})
export class GalleryImportModule {}