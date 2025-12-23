import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookingService, CapitalizeFirstPipeModule, CurrencyService, ErrrorMessageModule, I8nModule, LoadingSpinnerModule, PaymentsModule, ShortFileNameModule } from 'jconsumer-shared';
import { QuestionnaireModule } from '../../shared/questionaire/edit/questionnaire.module';
import { RouterModule, Routes } from '@angular/router';
import { ConsumerEmailModule } from '../../shared/consumer-email/consumer-email.module';
import { CheckinAddMemberModule } from '../../shared/checkin-add-member/checkin-add-member.module';
import { CouponStatusModule } from '../../shared/coupon-status/coupon-status.module';
import { MatIconModule } from '@angular/material/icon';
import { AccordionModule } from 'primeng/accordion';
import { ApplyCouponModule } from '../../shared/apply-coupon/apply-coupon.module';
import { PaymentSummaryModule } from '../../shared/payment-summary/payment-summary.module';
import { FormsModule } from '@angular/forms';
import { CommunicationsModule } from '../communications/communications.module';
import { CouponsModule } from '../../shared/coupons/coupons.module';
import { RefundpolicyModule } from '../../shared/refundpolicy/refundpolicy.module';
import { DatePaginationModule } from '../../shared/date-pagination/date-pagination.module';
import { SlotPickerModule } from '../../shared/slot-picker/slot-picker.module';
import { ServiceInfoDisplayModule } from '../../shared/service-info-display/service-info-display.module';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatStepperModule } from '@angular/material/stepper';
import { BookingNoteModule } from '../note/booking-note.module';
import { BookingAccountinfoModule } from '../account/booking-accountinfo.module';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { CouponHandlerComponent } from '../coupon-/coupon-handler.component';
import { DepartmentCardComponent } from '../department-card/department-card.component';
import { UserCardComponent } from '../user-card/user-card.component';
import { HomeComponent } from './home.component';
import { PaymentModesModule } from '../../shared/payment-modes/payment-modes.module';
import { MembersModule } from './members/members.module';
import { ServiceSelectionComponent } from '../service-selection/service-selection.component';
import { DepartmentSelectionComponent } from '../department-selection/department-selection.component';
import { UserSelectionComponent } from '../user-selection/user-selection.component';
import { DateTimeSelectionComponent } from '../date-time-selection/date-time-selection.component';
import { AppointmentCardComponent } from '../appointment-card/appointment-card.component';
import { CheckinCardComponent } from '../checkin-card/checkin-card.component';
import { LocationSelectionComponent } from '../location-selection/location-selection.component';
import { LocationCardComponent } from '../location-card/location-card.component';

const routes: Routes = [
  {path : '', component: HomeComponent}
]

@NgModule({
  declarations: [
    HomeComponent,
    UserCardComponent,
    DepartmentCardComponent,
    CouponHandlerComponent,
    ServiceSelectionComponent,
    DepartmentSelectionComponent,
    UserSelectionComponent,
    DateTimeSelectionComponent,
    AppointmentCardComponent,
    CheckinCardComponent,
    LocationSelectionComponent,
    LocationCardComponent
  ],
  imports: [
    CommonModule,
    I8nModule,
    AuthenticationModule,
    BookingAccountinfoModule,
    BookingNoteModule,
    MatStepperModule,
    MatDatepickerModule,
    MatChipsModule,
    MatDialogModule,
    MatButtonModule,
    MatTooltipModule,
    CapitalizeFirstPipeModule,
    ServiceInfoDisplayModule,
    LoadingSpinnerModule,
    SlotPickerModule,
    DatePaginationModule,
    QuestionnaireModule,
    RefundpolicyModule,
    PaymentModesModule,
    CouponsModule,
    MembersModule,
    CommunicationsModule,
    FormsModule,
    ApplyCouponModule,
    PaymentSummaryModule,
    AccordionModule,
    MatIconModule,
    CouponStatusModule,
    CheckinAddMemberModule,
    ConsumerEmailModule,
    PaymentsModule,
    ErrrorMessageModule,
    ShortFileNameModule,
    MatIconModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    HomeComponent
  ],
  providers: [
    BookingService,
    CurrencyService
  ]
})
export class HomeModule { }
