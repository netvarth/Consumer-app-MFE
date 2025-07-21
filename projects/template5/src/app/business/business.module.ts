import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { BusinessComponent } from './business.component';
import { HeaderModule } from './header/header.module';
import { AuthenticationModule } from './authentication/authentication.module';
import { SharedModule } from 'jaldee-framework/shared';
import { ButtonModule } from 'primeng/button';
import { OnetimeQuestionnaireModule } from './onetime-questionnaire/onetime-questionnaire.module';

const routes: Routes = [
  {
    path: '', component: BusinessComponent,
    children: [
      {
        path: '',
        children: [
          { path: 'cart', loadChildren: () => import('./cart/cart.module').then(m => m.CartModule) },
          { path: 'checkout', loadChildren: () => import('./order-checkout/order-checkout.module').then(m => m.OrderCheckoutModule) },
          { path: 'details', loadChildren: () => import('./item-details-new/item-details.module').then(m => m.ItemDetailsModule) },
          { path: 'status/:id', loadChildren: () => import('./status-check/check-status.module').then(m => m.CheckStatusModule) },
          { path: 'orderdetails', loadChildren: () => import('./order-details/order-details.module').then(m => m.OrderDetailsModule) },
          { path: 'items', loadChildren: () => import('./items/items.module').then(m => m.ItemsModule) },
          { path: 'order/order-bill', loadChildren: () => import('./order-bill/order-bill.module').then(m => m.OrderBillModule) },
          { path: 'membership', loadChildren: () => import('././membership/membership.module').then(m => m.MembershipModule) },
          { path: 'about', loadChildren: () => import('./aboutus/aboutus.module').then(m => m.AboutusModule) },
          { path: 'faq', loadChildren: () => import('./faq/faq.module').then(m => m.FaqModule) },
          { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule) },
          { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
          { path: 'inbox', loadChildren: () => import('./inbox/inbox-outer/inbox.module').then(m => m.InboxModule) },
          { path: 'home', loadChildren: () => import('./home/business-page-home.module').then(m => m.BusinessPageHomeModule) },
          { path: 'appointment', loadChildren: () => import('./appointment/consumer-appointment.module').then(m => m.ConsumerAppointmentModule) },
          { path: 'checkin', loadChildren: () => import('./checkin/consumer-checkin.module').then(m => m.ConsumerCheckinModule) },
          { path: 'donations', loadChildren: () => import('./donations/donations.module').then(m => m.ConsumerDonationsModule) },
          { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
          { path: 'change-mobile', loadChildren: () => import('./change-mobile/change-mobile.module').then(m => m.ChangeMobileModule) },
          { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
          { path: 'prescriptions', loadChildren: () => import('./prescriptions/prescriptions.module').then(m => m.PrescriptionsModule) },
          { path: 'payments', loadChildren: () => import('./payments/payments.module').then(m => m.ConsumerPaymentsModule) },
          { path: 'members', loadChildren: () => import('./members new/members.module').then(m => m.MembersModule) },
          { path: 'history', loadChildren: () => import('./history/history.module').then(m => m.ConsumerHistoryModule) },
          { path: 'checkindetails', loadChildren: () => import('./checkin-details-new/checkin-detail.module').then(m => m.CheckinDetailsModule) },
          { path: 'apptdetails', loadChildren: () => import('./appt-details-new/appt-detail.module').then(m => m.ApptDetailsModule) },
          { path: 'item-details', loadChildren: () => import('./item-details/item-details.module').then(m => m.ItemDetailsModule) },
          { path: 'service/:serid', loadChildren: () => import('./service-landing-page/service-landing-page.module').then(m => m.ServiceLandingPageModule) },
          { path: 'department/:deptId', loadChildren: () => import('./department-service-page/department-service-page.module').then(m => m.DepartmentServicePageModule) },
          { path: 'catalog/:catalogId', loadChildren: () => import('./catalog-landing-page/catalog-landing-page.module').then(m => m.CatalogLandingModule) },
          { path: 'catalog/:catalogId/item/:itemId', loadChildren: () => import('./catalog-landing-page/catalog-landing-page.module').then(m => m.CatalogLandingModule) },
          { path: 'meeting/:phonenumber', loadChildren: () => import('./tele-home/tele-home.module').then(m => m.TeleHomeModule) },
          { path: 'ivr', loadChildren: () => import('./ivr/ivr.module').then(m => m.IvrModule) },
          { path: '', loadChildren: () => import('./business-landing-page/business-landing-page.module').then(m => m.BusinessLandingPageModule) },
          { path: ':userEncId', loadChildren: () => import('./business-user-landing-page/business-user-landing-page.module').then(m => m.BusinessUserLandingPageModule) },
          
        ]
      }
    ]
  }
]
@NgModule({
  declarations: [
    BusinessComponent
  ],
  imports: [
    CommonModule,
    HeaderModule,
    SharedModule,
    ButtonModule,
    OnetimeQuestionnaireModule,
    AuthenticationModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    BusinessComponent
  ]
})
export class BusinessModule { }
