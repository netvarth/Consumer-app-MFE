import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatDialogModule } from "@angular/material/dialog";
import { CouponNotesComponent } from "./coupon-notes.component";

@NgModule({
    imports:[
        CommonModule,
        MatDialogModule
    ],
    exports: [CouponNotesComponent],
    declarations: [CouponNotesComponent]
})
export class CouponNotesModule {}