import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserCardComponent } from './user-card.component';
import { I8nModule } from 'jconsumer-shared';
@NgModule({
  declarations: [
    UserCardComponent
  ],
  imports: [
    CommonModule,
    I8nModule
  ],
  exports:[
    UserCardComponent
  ]
})
export class UserCardModule { }
