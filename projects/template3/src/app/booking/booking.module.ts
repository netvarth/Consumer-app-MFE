import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BookingService } from './booking.service';
import { CurrencyService, ErrrorMessageModule, SafeHtmlModule } from 'jconsumer-shared';
import { MatTooltipModule } from '@angular/material/tooltip';

const routes: Routes = [
  { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
  { path: 'confirm', loadChildren: () => import('./confirm-page/confirm-page.module').then(m => m.ConfirmPageModule) },
  { path: 'bill/:id', loadChildren: () => import('./bill/bill.module').then(m => m.BillModule) },
  { path: ':id', loadChildren: () => import('./details/details.module').then(m => m.DetailsModule) }
]

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    ErrrorMessageModule,
    SafeHtmlModule,
    MatTooltipModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
  ],
  providers: [
    BookingService,
    CurrencyService
  ]
})
export class BookingModule { }
