import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemOptionsComponent } from './item-options.component';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CardModule } from 'primeng/card';
import { FormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { FileUploadModule } from 'primeng/fileupload';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { MatDatepickerModule } from "@angular/material/datepicker";
import { MatInputModule } from "@angular/material/input";
import { MatNativeDateModule } from "@angular/material/core";

@NgModule({
  declarations: [
    ItemOptionsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    RadioButtonModule,
    CardModule,
    CheckboxModule,
    InputTextModule,
    InputTextareaModule,
    FileUploadModule,
    CalendarModule,
    DropdownModule,
    InputNumberModule,
    MatDatepickerModule,
    MatInputModule,
    MatNativeDateModule
  ]
})
export class ItemOptionsModule { }
