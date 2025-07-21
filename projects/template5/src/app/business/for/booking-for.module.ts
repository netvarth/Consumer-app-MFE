import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingForComponent } from './booking-for.component';
import { TranslateModule } from '@ngx-translate/core';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';



@NgModule({
  declarations: [ BookingForComponent ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    TranslateModule,
    SharedModule,
    I8nModule
  ],
  exports: [ BookingForComponent ]
})
export class BookingForModule { }
