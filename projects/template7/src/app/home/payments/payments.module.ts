import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { PaymentsComponent } from './payments.component';
import { CapitalizeFirstPipeModule, DateFormatPipeModule, ErrrorMessageModule, I8nModule, LoadingSpinnerModule } from 'jconsumer-shared';

const routes: Routes = [
    { path: '', component: PaymentsComponent },
    { path: 'view', loadChildren: ()=> import('./order-bill/order-bill.module').then(m=>m.OrderBillModule) },
    { path: ':id', loadChildren: ()=> import('./payment-details/payment-details.module').then(m=>m.PaymentDetailsModule) },
    
];


@NgModule({
    declarations: [
        PaymentsComponent
    ],
    imports: [
        CommonModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule,
        MatTooltipModule,
        [RouterModule.forChild(routes)],
        MatIconModule,
        MatMenuModule,
        I8nModule,
        ErrrorMessageModule,
        DateFormatPipeModule,
    ],
    exports: [
        PaymentsComponent
    ]
})
export class PaymentsModule { }
