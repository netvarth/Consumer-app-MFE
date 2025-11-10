import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { I8nModule, LoadingSpinnerModule } from 'jconsumer-shared';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: '', component: DashboardComponent},
  { path: 'bookings', loadChildren:()=> import('./my-bookings/my-bookings.module').then(m=>m.MyBookingsModule)},
  { path: 'orders', loadChildren:()=> import('./my-orders/my-orders.module').then(m=>m.MyOrdersModule)}
]

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    I8nModule,
    AuthenticationModule,
    LoadingSpinnerModule,
    MatButtonModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    DashboardComponent
  ]
})
export class DashboardModule { }
