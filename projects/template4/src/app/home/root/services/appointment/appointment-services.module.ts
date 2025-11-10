import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AppointmentServicesComponent } from './appointment-services.component';
import { CardModule } from '../../card/card.module';

@NgModule({
  declarations: [
    AppointmentServicesComponent
  ],
  imports: [
    CommonModule,
    CardModule
  ],
  exports: [
    AppointmentServicesComponent
  ]
})
export class AppointmentServicesModule { }
