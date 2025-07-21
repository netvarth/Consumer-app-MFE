import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipComponent } from './membership.component';
import { RouterModule, Routes } from '@angular/router';
import { MembershipService } from './membership.service';

const routes: Routes = [
  { path: '', component: MembershipComponent },
  { path: ':serviceId', loadChildren:() => import('./membership-service/membership-service.module').then(m=>m.MembershipServiceModule) }
  
];

@NgModule({
  declarations: [
    MembershipComponent
  ],
  imports: [
    CommonModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [MembershipComponent],
  providers: [
    MembershipService
  ]
})
export class MembershipModule { }
