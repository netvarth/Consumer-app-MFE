import { CUSTOM_ELEMENTS_SCHEMA, NgModule, NO_ERRORS_SCHEMA } from '@angular/core';
import { ConsumerAppointmentComponent } from './consumer-appointment.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { ConsumerEmailModule } from '../consumer-email/consumer-email.module';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { AuthenticationModule } from '../authentication/authentication.module';
import { MatDialogModule } from '@angular/material/dialog';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
import { RazorpayService } from 'jaldee-framework/payment/razorpay';
import { PaytmService } from 'jaldee-framework/payment/paytm';
import { SharedModule } from 'jaldee-framework/shared';
import { FileService } from 'jaldee-framework/file';
import { DateTimeProcessor } from 'jaldee-framework/calendar/date-time';
import { CheckinAddMemberModule } from 'jaldee-framework/checkin-add-member';
import { JcCouponNoteModule } from 'jaldee-framework/jc-coupon-note';
import { RefundpolicyModule } from 'jaldee-framework/refundpolicy';
import { MembersModule } from 'jaldee-framework/members';
import { CommunicationsModule } from 'jaldee-framework/communications';
import { QuestionnaireModule } from 'jaldee-framework/questionaire/edit';
import { ServiceDisplayModule } from 'jaldee-framework/service-display';
import { ServiceInfoDisplayModule } from 'jaldee-framework/service-info-display';
import { CouponStatusModule } from '../coupon-status/coupon-status.module';
import { ApplyCouponModule } from '../apply-coupon/apply-coupon.module';
import { PaymentSummaryModule } from '../payment-summary/payment-summary.module';
import { PrivacyModule } from '../privacy/privacy.module';
import { BookingForModule } from '../for/booking-for.module';
import { DatePaginationModule } from '../date-pagination/date-pagination.module';
import { PaymentModesModule } from '../payment-modes/payment-modes.module';
import { BookingNoteModule } from '../../modules/booking/note/booking-note.module';
import { BookingAccountinfoModule } from '../../modules/booking/account/booking-accountinfo.module';
import { SlotPickerModule } from '../../modules/slot-picker/slot-picker.module';
import { I8nModule } from '../../modules/i8n/i8n.module';
const routes: Routes = [
    { path: '', component: ConsumerAppointmentComponent},
    { path: 'bill', loadChildren:()=>import('../appointment-bill/appointment-bill.module').then(m=>m.ConsumerApptBillModule) },
    { path: 'confirm', loadChildren: ()=> import('../appointment-confirm-page/confirm-page.module').then(m=>m.ConsumerApptConfirmModule)}
];
@NgModule({
    declarations: [
        ConsumerAppointmentComponent
    ],
    imports: [
        CommonModule,  
        CheckinAddMemberModule,
        CapitalizeFirstPipeModule,
        NgxIntlTelInputModule, 
        ConsumerEmailModule,
        JcCouponNoteModule,
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
        PaymentModesModule,
        DatePaginationModule,
        SlotPickerModule,
        BookingNoteModule,
        ServiceDisplayModule,
        AuthenticationModule,
        BookingAccountinfoModule,
        BookingForModule,
        ServiceInfoDisplayModule,
        SharedModule,
        I8nModule,
        CouponStatusModule,
        ApplyCouponModule,
        PaymentSummaryModule,
        [RouterModule.forChild(routes)]
    ],
    schemas: [
        CUSTOM_ELEMENTS_SCHEMA,
        NO_ERRORS_SCHEMA
    ],
    providers: [
        RazorpayService,
        PaytmService,
        FileService,
        DateTimeProcessor
    ],
    exports: [ConsumerAppointmentComponent]
})
export class ConsumerAppointmentModule { }
