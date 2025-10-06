import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DatePaginationComponent } from "./date-pagination.component";
import { CapitalizeFirstPipeModule, I8nModule } from "jconsumer-shared";
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
    imports: [
        CommonModule,
        MatDatepickerModule,
        FormsModule,
        I8nModule,
        TranslateModule,
        CapitalizeFirstPipeModule   
    ],
    exports: [DatePaginationComponent],
    declarations: [
        DatePaginationComponent
    ]
})
export class DatePaginationModule {}