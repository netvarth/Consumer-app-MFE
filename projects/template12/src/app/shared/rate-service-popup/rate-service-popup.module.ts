import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { FormsModule } from "@angular/forms";
import { ErrrorMessageModule, FormMessageDisplayModule } from "jconsumer-shared";
import { RateServicePopupComponent } from "./rate-service-popup";
import { RatingStarModule } from "../ratingstar/ratingstar.module";
@NgModule({
    imports: [
        CommonModule,
        MatButtonModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        RatingStarModule,
        FormsModule,
        FormMessageDisplayModule,
        ErrrorMessageModule
    ],
    exports: [RateServicePopupComponent],
    declarations: [RateServicePopupComponent]
})
export class RateServiceModule {}