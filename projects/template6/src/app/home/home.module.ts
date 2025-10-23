import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home.component';
import { HeaderModule } from './header/header.module';
import { DialogService } from 'primeng/dynamicdialog';
import { AuthenticationModule } from '../shared/authentication/authentication.module';
import { OnetimeQuestionnaireModule } from '../shared/onetime-questionnaire/onetime-questionnaire.module';
import { DateFormatPipeModule } from 'jconsumer-shared';

const routes: Routes = [
  {
    path: '', component: HomeComponent,
    children: [
      { path: '', pathMatch:'full', loadChildren: () => import('./root/root.module').then(m => m.RootModule) },
      { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
      { path: 'inbox', loadChildren: () => import('./inbox/inbox-outer/inbox.module').then(m => m.InboxModule) },
      { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
      { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
      { path: 'members', loadChildren: () => import('./members/members.module').then(m => m.MembersModule) },
      { path: 'payments', loadChildren: () => import('./payments/payments.module').then(m => m.PaymentsModule) },
      { path: 'items', loadChildren: () => import('./items/items.module').then(m => m.ItemsModule) },
      { path: 'categories', loadChildren: () => import('./catagories/catagories.module').then(m => m.CatagoriesModule) },
      { path: 'pay/:id', loadChildren: () => import('./payment-link/payment-link.module').then(m => m.PaymentLinkModule) },
      { path: 'status/:id', loadChildren: () => import('./status/status.module').then(m => m.StatusModule) },
      { path: 'item/:id', loadChildren: () => import('./item/item.module').then(m => m.ItemModule) },
      { path: 'department/:deptId', loadChildren: () => import('./department-service-page/department-service-page.module').then(m => m.DepartmentServicePageModule) },
      { path: 'order', loadChildren: () => import('../orders/orders.module').then(m => m.OrdersModule) },
      { path: 'appointment', loadChildren: () => import('../booking/appointment/appointment.module').then(m => m.AppointmentModule) },
      { path: 'checkin', loadChildren: () => import('../booking/checkin/checkin.module').then(m => m.CheckinModule) },  
      { path: 'booking', loadChildren: () => import('../booking/booking.module').then(m => m.BookingModule) },
      { path: 'donation', loadChildren: () => import('../donation/donation.module').then(m=>m.DonationModule)},
      { path: 'about', loadChildren: () => import('./aboutus/aboutus.module').then(m => m.AboutusModule) },
      { path: 'faq', loadChildren: () => import('./faq/faq.module').then(m => m.FaqModule) },
      { path: 'support', loadChildren: () => import('./support/support.module').then(m => m.SupportModule) },
      { path: 'service/:serid', loadChildren: () => import('./service-page/service-page.module').then(m => m.ServicePageModule) },
      { path: ':userEncId', loadChildren: () => import('./root/user-page/user-page.module').then(m => m.UserPageModule) }
    ]
  }
]

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HeaderModule,
    AuthenticationModule,
    DateFormatPipeModule,
    OnetimeQuestionnaireModule,
    [RouterModule.forChild(routes)]
  ],
  providers: [
    DialogService
  ],
  exports: [HomeComponent]
})
export class HomeModule { }
