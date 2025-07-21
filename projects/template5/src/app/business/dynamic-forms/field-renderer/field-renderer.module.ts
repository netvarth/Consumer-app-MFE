import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FieldRendererComponent } from './field-renderer.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';



@NgModule({
  declarations: [
    FieldRendererComponent
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    DropdownModule,
    RadioButtonModule,
    CheckboxModule,
    InputTextareaModule,
    InputNumberModule,
    ButtonModule,
    FormsModule,
    CalendarModule,
    RadioButtonModule,
    NgxIntlTelInputModule,
    MultiSelectModule
  ],
  exports: [
    FieldRendererComponent
  ]
})
export class FieldRendererModule { }
