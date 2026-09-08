import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ServiceCardComponent } from './service-card.component';
import { CapitalizeFirstPipeModule, I8nModule } from 'jconsumer-shared';



@NgModule({
  declarations: [
    ServiceCardComponent
  ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    I8nModule
  ],
  exports: [
    ServiceCardComponent
  ]
})
export class ServiceCardModule { }
