import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DonationServicesComponent } from './donation-services.component';
import { CardModule } from '../../card/card.module';

@NgModule({
  declarations: [
      DonationServicesComponent
  ],
  imports: [
    CommonModule,
    CardModule
  ],
  exports: [
      DonationServicesComponent
  ]
})
export class DonationServicesModule { }
