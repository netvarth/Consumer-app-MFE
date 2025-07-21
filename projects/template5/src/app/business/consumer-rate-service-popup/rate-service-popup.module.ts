import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { ConsumerRateServicePopupComponent } from "./consumer-rate-service-popup";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { SharedModule } from "jaldee-framework/shared";
import { RatingStarModule } from "jaldee-framework/ratingstar";
@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        RatingStarModule,
        FormsModule,
        SharedModule,
        FormMessageDisplayModule
    ],
    exports: [ConsumerRateServicePopupComponent],
    declarations: [ConsumerRateServicePopupComponent]
})
export class RateServiceModule {}