import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { CapitalizeFirstPipeModule, FormMessageDisplayModule, JGalleryModule, LoadingSpinnerModule, PaymentModesModule, PaymentsModule, PhoneInputModule, QuestionnaireModule } from 'jconsumer-shared';
import { MatRadioModule } from '@angular/material/radio';
import { BookingAccountinfoModule } from '../booking/account/booking-accountinfo.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { AuthenticationModule } from '../shared/authentication/authentication.module';
import { MatSelectModule } from '@angular/material/select';
import { DonationComponent } from './donation.component';

const routes: Routes = [
    { path: '',  component: DonationComponent},
    { path: 'confirm', loadChildren: () => import('./confirm-page/confirm-page.module').then(m => m.ConfirmPageModule) },
    
];
@NgModule({
    declarations: [
        DonationComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        MatDialogModule,
        MatChipsModule,
        MatButtonModule,
        FormMessageDisplayModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        QuestionnaireModule,
        MatRadioModule,
        PaymentModesModule,
        BookingAccountinfoModule,
        MatTooltipModule,
        MatSlideToggleModule,
        MatFormFieldModule,
        MatInputModule,
        ReactiveFormsModule,
        AuthenticationModule,
        MatSelectModule,
        PaymentsModule,
        JGalleryModule,
        PhoneInputModule,
        [RouterModule.forChild(routes)]
    ],
    exports: [
        DonationComponent
    ]
})
export class DonationModule { }
