import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { AddAddressComponent } from "./add-address.component";
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        MatDialogModule,
        MatButtonModule,
        FormMessageDisplayModule,
        NgxIntlTelInputModule
    ],
    exports: [AddAddressComponent],
    declarations : [ AddAddressComponent ]
})
export class AddAddressModule {}