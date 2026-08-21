import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipServicesComponent } from './membership-services.component';
import { MatButtonModule } from '@angular/material/button';



@NgModule({
  declarations: [
    MembershipServicesComponent
  ],
  imports: [
    CommonModule,
    MatButtonModule
  ],
  exports: [
    MembershipServicesComponent
  ]
})
export class MembershipServicesModule { }
