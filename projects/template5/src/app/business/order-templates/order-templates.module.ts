import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderTemplatesComponent } from './order-templates.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DynamicFormsModule } from '../dynamic-forms/dynamic-forms.module';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ToastService } from '../../services/toast.service';



@NgModule({
  declarations: [
    OrderTemplatesComponent
  ],
  imports: [
    DynamicFormsModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule
  ],
  providers: [
      ToastService,
      MessageService
    ]
})
export class OrderTemplatesModule { }
