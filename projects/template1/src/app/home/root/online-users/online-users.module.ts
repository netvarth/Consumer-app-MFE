import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnlineUsersComponent } from './online-users.component';
import { CardModule } from '../card/card.module';



@NgModule({
  declarations: [
    OnlineUsersComponent
  ],
  imports: [
    CommonModule,
    CardModule
  ],
  exports:[
    OnlineUsersComponent
  ]
})
export class OnlineUsersModule { }
