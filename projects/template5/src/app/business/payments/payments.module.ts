import { NgModule } from '@angular/core';
import { ConsumerPaymentsComponent } from './payments.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatTooltipModule } from '@angular/material/tooltip';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { SharedModule } from 'jaldee-framework/shared';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { I8nModule } from '../../modules/i8n/i8n.module';

const routes: Routes = [
    { path: '', component: ConsumerPaymentsComponent },
    { path: 'view', loadChildren: ()=> import('./invoice-details/invoice-details.module').then(m=>m.InvoiceDetailsModule) },
    { path: ':id', loadChildren: ()=> import('./payment-details/payment-details.module').then(m=>m.PaymentDetailsModule) }
];


@NgModule({
    declarations: [
        ConsumerPaymentsComponent
    ],
    imports: [
        CommonModule,
        CapitalizeFirstPipeModule,
        LoadingSpinnerModule,
        MatTooltipModule,
        SharedModule,
        I8nModule,
        MatIconModule,
        MatMenuModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        ConsumerPaymentsComponent
    ]
})
export class ConsumerPaymentsModule { }
