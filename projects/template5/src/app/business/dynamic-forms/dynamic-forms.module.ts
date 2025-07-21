import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DynamicFormsComponent } from './dynamic-forms.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { RadioButtonModule } from 'primeng/radiobutton';
import { CalendarModule } from 'primeng/calendar';
import { MultiSelectModule } from 'primeng/multiselect';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FieldRendererModule } from './field-renderer/field-renderer.module';

@NgModule({
  declarations: [
    DynamicFormsComponent
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
    MultiSelectModule,
    FieldRendererModule,
    ButtonModule
  ],
  exports: [
    DynamicFormsComponent
  ]
})
export class DynamicFormsModule { }
