import { CommonModule } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { QRCodeModule } from 'angularx-qrcode';
import { ViewRxComponent } from "./view-rx.component";
import { ShareIconsModule } from "ngx-sharebuttons/icons";
import { ShareButtonsModule } from "ngx-sharebuttons/buttons";

@NgModule({
    imports: [
        MatDialogModule,
        QRCodeModule,
        CommonModule,        
        ShareButtonsModule,
        ShareIconsModule,
    ],
    declarations: [
        ViewRxComponent
    ],
    exports: [
        ViewRxComponent
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ]
})
export class ViewRxModule {}