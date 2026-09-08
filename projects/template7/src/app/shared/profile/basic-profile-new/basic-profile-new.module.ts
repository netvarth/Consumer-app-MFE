import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicProfileNewComponent } from './basic-profile-new.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { CapitalizeFirstPipeModule } from 'jconsumer-shared';



@NgModule({
  declarations: [BasicProfileNewComponent],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule,
    MatTooltipModule,
    MatButtonModule
  ],
  exports: [BasicProfileNewComponent]
})
export class BasicProfileNewModule { }
