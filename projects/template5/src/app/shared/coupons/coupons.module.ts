import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { NgxNl2brModule } from "ngx-nl2br";
import { CouponsComponent } from "./coupons.component";

@NgModule({
    imports: [
        MatDialogModule,
        CommonModule,
        NgxNl2brModule
    ],
    exports: [CouponsComponent],
    declarations: [CouponsComponent]
})
export class CouponsModule {}