import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { QRCodeGeneratordetailComponent } from "./qrcodegeneratordetail.component";
import { QRCodeModule } from 'angularx-qrcode';
import { ShareButtonsModule } from "ngx-sharebuttons/buttons";
import { ShareIconsModule } from "ngx-sharebuttons/icons";
@NgModule({
    declarations: [QRCodeGeneratordetailComponent],
    exports: [QRCodeGeneratordetailComponent],
    imports: [
        CommonModule,
        MatDialogModule,        
        ShareButtonsModule,
        ShareIconsModule,
        QRCodeModule
    ]
})
export class QRCodeGeneratordetailModule{}