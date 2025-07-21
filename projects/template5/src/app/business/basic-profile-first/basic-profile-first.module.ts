import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BasicProfileFirstComponent } from './basic-profile-first.component';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';



@NgModule({
  declarations: [BasicProfileFirstComponent],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    MatTooltipModule,
    SharedModule,
    I8nModule
  ],
  exports: [BasicProfileFirstComponent]
})
export class BasicProfileFirstModule { }
