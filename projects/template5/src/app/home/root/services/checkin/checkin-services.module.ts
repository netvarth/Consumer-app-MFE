import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckinServicesComponent } from './checkin-services.component';
import { CardModule } from '../../card/card.module';

@NgModule({
  declarations: [
      CheckinServicesComponent
  ],
  imports: [
    CommonModule,
    CardModule
  ],
  exports: [
      CheckinServicesComponent
  ]
})
export class CheckinServicesModule { }
