import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { PrescriptionsComponent } from "./prescriptions.component";
import { MatDialogModule } from "@angular/material/dialog";
import { AuthenticationModule } from "../authentication/authentication.module";
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { SharedModule } from "jaldee-framework/shared";
import { FileService } from "jaldee-framework/file";
import { PreviewuploadedfilesModule } from "jaldee-framework/previewuploadedfiles";
import { I8nModule } from "../../modules/i8n/i8n.module";
const routes: Routes = [
    { path: '', component: PrescriptionsComponent }
];
@NgModule({
    declarations: [
        PrescriptionsComponent
    ],
    imports: [
        CommonModule,
        LoadingSpinnerModule,
        MatDialogModule,
        PreviewuploadedfilesModule,
        AuthenticationModule,
        SharedModule,
        I8nModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        PrescriptionsComponent
    ],
    providers: [
        FileService
    ]
})
export class PrescriptionsModule {}