import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { MatDatepickerModule } from "@angular/material/datepicker";
import { DatePaginationComponent } from "./date-pagination.component";
import {MatCardModule} from '@angular/material/card';
import {CalendarModule} from 'primeng/calendar';


@NgModule({
    imports: [
        CommonModule,
        MatDatepickerModule,
        FormsModule,
        ReactiveFormsModule,
        MatCardModule,
        CalendarModule
    ],
    exports: [DatePaginationComponent],
    declarations: [
        DatePaginationComponent
    ]
})
export class DatePaginationModule {}