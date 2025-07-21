import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConsumerDonationsComponent } from './donations.component';
import { RouterModule, Routes } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { ProviderWaitlistCheckInConsumerNoteModule } from '../../modules/provider-waitlist-checkin-consumer-note/provider-waitlist-checkin-consumer-note.module';

const routes: Routes = [
    { path: '', component: ConsumerDonationsComponent},
    { path: 'confirm', loadChildren: ()=> import('../donation-confirm-page/confirm-page.module').then(m=>m.ConfirmPageModule)},
    { path: ':id', loadChildren: ()=>import('../donation-details/consumer-donation.module').then(m=>m.ConsumerDonationModule)},
];
@NgModule({
    declarations: [
        ConsumerDonationsComponent    ],
    imports: [
        CommonModule,
        CapitalizeFirstPipeModule,
        MatDialogModule,
        MatTooltipModule,
        ProviderWaitlistCheckInConsumerNoteModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [ConsumerDonationsComponent]
})
export class ConsumerDonationsModule { }
