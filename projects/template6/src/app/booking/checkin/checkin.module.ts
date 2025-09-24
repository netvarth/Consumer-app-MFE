import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { CheckinComponent } from './checkin.component';
import { CapitalizeFirstPipeModule, FileService, I8nModule, JaldeeTimeService, LoadingSpinnerModule, PaymentModesModule, PaytmService, QuestionnaireModule, RazorpayService } from 'jconsumer-shared';
import { CheckinAddMemberModule } from '../../shared/checkin-add-member/checkin-add-member.module';
import { RefundpolicyModule } from '../../shared/refundpolicy/refundpolicy.module';
import { PrivacyModule } from '../../shared/privacy/privacy.module';
import { MembersModule } from '../home/members/members.module';
import { CommunicationsModule } from '../communications/communications.module';
import { DatePaginationModule } from '../../shared/date-pagination/date-pagination.module';
import { SlotPickerModule } from '../../shared/slot-picker/slot-picker.module';
import { BookingNoteModule } from '../note/booking-note.module';
import { ServiceInfoDisplayModule } from '../../shared/service-info-display/service-info-display.module';
import { BookingForModule } from '../for/booking-for.module';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { BookingAccountinfoModule } from '../account/booking-accountinfo.module';
import { CouponStatusModule } from '../../shared/coupon-status/coupon-status.module';
import { ApplyCouponModule } from '../../shared/apply-coupon/apply-coupon.module';
import { PaymentSummaryModule } from '../../shared/payment-summary/payment-summary.module';
import { ConsumerEmailModule } from '../../shared/consumer-email/consumer-email.module';

const routes: Routes = [
    { path: '', component: CheckinComponent},
    // { path: 'bill', loadChildren: ()=> import('../checkin-bill/checkin-bill.module').then(m=>m.ConsumerCheckinBillModule) },
    // { path: 'confirm', loadChildren: ()=> import('../checkin-confirm-page/confirm-page.module').then(m=>m.ConsumerCheckinConfirmModule)}
];
@NgModule({
    declarations: [
        CheckinComponent
    ],
    imports: [
        CommonModule,
        CapitalizeFirstPipeModule,
        MatFormFieldModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatCheckboxModule,
        MatFormFieldModule,
        MatChipsModule,
        MatRadioModule,
        CheckinAddMemberModule,
        RefundpolicyModule,
        PrivacyModule,
        MembersModule,
        CommunicationsModule,
        FormsModule,
        QuestionnaireModule,
        ReactiveFormsModule,
        LoadingSpinnerModule,
        DatePaginationModule,
        SlotPickerModule,
        BookingNoteModule,
        ServiceInfoDisplayModule,
        BookingForModule,
        ServiceInfoDisplayModule,
        AuthenticationModule,
        BookingAccountinfoModule,
        I8nModule,
        CouponStatusModule,
        ApplyCouponModule,
        PaymentSummaryModule,
        PaymentModesModule,
        ConsumerEmailModule,
        [RouterModule.forChild(routes)]
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
    providers: [
        RazorpayService,
        JaldeeTimeService,
        PaytmService,
        FileService
    ],
    exports: [CheckinComponent]
})
export class CheckinModule { }
