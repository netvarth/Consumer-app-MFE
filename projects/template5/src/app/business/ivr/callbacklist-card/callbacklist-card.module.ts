import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CallbacklistCardComponent } from './callbacklist-card.component';



@NgModule({
  declarations: [
    CallbacklistCardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [CallbacklistCardComponent]
})
export class CallbacklistCardModule { }
