import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingForComponent } from './booking-for.component';
import { CapitalizeFirstPipeModule, I8nModule } from 'jconsumer-shared';

@NgModule({
  declarations: [ BookingForComponent ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    I8nModule
  ],
  exports: [ BookingForComponent ]
})
export class BookingForModule { }
