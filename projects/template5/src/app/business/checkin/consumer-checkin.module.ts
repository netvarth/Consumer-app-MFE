import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConsumerCheckinComponent } from './consumer-checkin.component';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatRadioModule } from '@angular/material/radio';
import { LoadingSpinnerModule } from "jaldee-framework/spinner";
import { PrivacyModule } from '../privacy/privacy.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { SharedModule } from 'jaldee-framework/shared';
import { JaldeeTimeService } from 'jaldee-framework/calendar/time';
import { FileService } from 'jaldee-framework/file';
import { JcCouponNoteModule } from 'jaldee-framework/jc-coupon-note';
import { CheckinAddMemberModule } from 'jaldee-framework/checkin-add-member';
import { RefundpolicyModule } from 'jaldee-framework/refundpolicy';
import { MembersModule } from 'jaldee-framework/members';
import { CommunicationsModule } from 'jaldee-framework/communications';
import { QuestionnaireModule } from 'jaldee-framework/questionaire/edit';
import { ServiceDisplayModule } from 'jaldee-framework/service-display';
import { ServiceInfoDisplayModule } from 'jaldee-framework/service-info-display';
import { CouponStatusModule } from '../coupon-status/coupon-status.module';
import { ApplyCouponModule } from '../apply-coupon/apply-coupon.module';
import { PaymentSummaryModule } from '../payment-summary/payment-summary.module';
import { BookingForModule } from '../for/booking-for.module';
import { DatePaginationModule } from '../date-pagination/date-pagination.module';
import { BookingNoteModule } from '../../modules/booking/note/booking-note.module';
import { BookingAccountinfoModule } from '../../modules/booking/account/booking-accountinfo.module';
import { SlotPickerModule } from '../../modules/slot-picker/slot-picker.module';
import { I8nModule } from '../../modules/i8n/i8n.module';
import { ConsumerEmailModule } from '../consumer-email/consumer-email.module';
import { PaymentModesModule } from '../payment-modes/payment-modes.module';
const routes: Routes = [
    { path: '', component: ConsumerCheckinComponent},
    { path: 'bill', loadChildren: ()=> import('../checkin-bill/checkin-bill.module').then(m=>m.ConsumerCheckinBillModule) },
    { path: 'confirm', loadChildren: ()=> import('../checkin-confirm-page/confirm-page.module').then(m=>m.ConsumerCheckinConfirmModule)}
];
@NgModule({
    declarations: [
        ConsumerCheckinComponent
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
        JcCouponNoteModule,
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
        ServiceDisplayModule,
        BookingForModule,
        ServiceInfoDisplayModule,
        AuthenticationModule,
        BookingAccountinfoModule,
        SharedModule,
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
    exports: [ConsumerCheckinComponent]
})
export class ConsumerCheckinModule { }
