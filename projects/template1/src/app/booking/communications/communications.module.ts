import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CommunicationsComponent } from './communications.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FormMessageDisplayModule, PhoneInputModule } from 'jconsumer-shared';




@NgModule({
  declarations: [
    CommunicationsComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    FormsModule,
    ReactiveFormsModule,
    FormMessageDisplayModule,
    PhoneInputModule
  ],
  exports: [
    CommunicationsComponent
  ]
})
export class CommunicationsModule { }
