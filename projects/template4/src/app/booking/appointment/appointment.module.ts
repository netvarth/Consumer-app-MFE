import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AppointmentComponent } from './appointment.component';
import { CheckinAddMemberModule } from '../../shared/checkin-add-member/checkin-add-member.module';
import { CapitalizeFirstPipeModule, CurrencyService, DateFormatPipeModule, DateTimeProcessor, FileService, I8nModule, PaytmService, QuestionnaireModule, RazorpayService } from 'jconsumer-shared';
import { ConsumerEmailModule } from '../../shared/consumer-email/consumer-email.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { RefundpolicyModule } from '../../shared/refundpolicy/refundpolicy.module';
import { MembersModule } from '../home/members/members.module';
import { CommunicationsModule } from '../communications/communications.module';
import { SlotPickerModule } from '../../shared/slot-picker/slot-picker.module';
import { BookingNoteModule } from '../note/booking-note.module';
import { ServiceInfoDisplayModule } from '../../shared/service-info-display/service-info-display.module';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { BookingAccountinfoModule } from '../account/booking-accountinfo.module';
import { BookingForModule } from '../for/booking-for.module';
import { CouponStatusModule } from '../../shared/coupon-status/coupon-status.module';
import { ApplyCouponModule } from '../../shared/apply-coupon/apply-coupon.module';
import { PaymentSummaryModule } from '../../shared/payment-summary/payment-summary.module';
import { PrivacyModule } from '../../shared/privacy/privacy.module';
import { TranslateModule } from '@ngx-translate/core';
import { DatePaginationModule } from '../date-pagination/date-pagination.module';
import { PaymentModesModule } from '../../shared/payment-modes/payment-modes.module';

const routes: Routes = [
    { path: '', component: AppointmentComponent},
];
@NgModule({
    declarations: [
        AppointmentComponent,

    ],
    imports: [
        CommonModule,
        CheckinAddMemberModule,
        CapitalizeFirstPipeModule,
        ConsumerEmailModule,
        DateFormatPipeModule,
        MatChipsModule,
        MatDatepickerModule,
        MatTooltipModule,
        MatRadioModule,
        MatDialogModule,
        MatCheckboxModule,
        MatFormFieldModule,
        PrivacyModule,
        RefundpolicyModule,
        MembersModule,
        CommunicationsModule,
        FormsModule,
        QuestionnaireModule,
        ReactiveFormsModule,
        DatePaginationModule,
        TranslateModule,
        SlotPickerModule,
        BookingNoteModule,
        ServiceInfoDisplayModule,
        AuthenticationModule,
        BookingAccountinfoModule,
        BookingForModule,
        ServiceInfoDisplayModule,
        I8nModule,
        CouponStatusModule,
        PaymentModesModule,
        ApplyCouponModule,
        PaymentSummaryModule,
        RouterModule.forChild(routes)
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
    providers: [
        RazorpayService,
        PaytmService,
        FileService,
        CurrencyService,
        DateTimeProcessor
    ],
    exports: [AppointmentComponent]
})
export class AppointmentModule { }




























