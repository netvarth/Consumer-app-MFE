import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BasicProfileComponent } from './basic-profile.component';
import { CapitalizeFirstPipeModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    BasicProfileComponent
  ],
  imports: [
    CommonModule,
    CapitalizeFirstPipeModule
  ],
  exports: [BasicProfileComponent]
})
export class BasicProfileModule { }
