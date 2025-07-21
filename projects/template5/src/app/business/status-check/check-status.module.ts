import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";
import { NgxNl2brModule } from "ngx-nl2br";
import { CheckYourStatusComponent } from "./check-status.component";
import { CheckStatusRoutingModule } from "./check-status.routing.module";
import { MatButtonModule } from "@angular/material/button";
import { TableModule } from "primeng/table";
import { CapitalizeFirstPipeModule, LoadingSpinnerModule } from "jconsumer-shared";

@NgModule({
    imports: [
        CommonModule,
        MatFormFieldModule,
        MatInputModule,
        CheckStatusRoutingModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        NgxNl2brModule,
        TableModule,
        FormsModule,
        ReactiveFormsModule,
        MatButtonModule
    ],
    declarations: [
        CheckYourStatusComponent
    ]
})
export class CheckStatusModule {}