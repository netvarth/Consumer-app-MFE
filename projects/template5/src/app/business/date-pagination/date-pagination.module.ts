import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { SharedModule } from "jaldee-framework/shared";
import { DatePaginationComponent } from "./date-pagination.component";
import { I8nModule } from "../../modules/i8n/i8n.module";

@NgModule({
    imports: [
        CommonModule,
        MatDatepickerModule,
        FormsModule,
        SharedModule,
        I8nModule
    ],
    exports: [DatePaginationComponent],
    declarations: [
        DatePaginationComponent
    ]
})
export class DatePaginationModule {}