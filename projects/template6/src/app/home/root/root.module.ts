import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './root.component';
import { DateFormatPipeModule, I8nModule, JGalleryModule, SafeHtmlModule, ToastService } from 'jconsumer-shared';
import { AddInboxMessagesModule } from '../../shared/add-inbox-messages/add-inbox-messages.module';
import { BasicProfileNewModule } from '../../shared/profile/basic-profile-new/basic-profile-new.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MessageService } from 'primeng/api';
import { CardModule } from './card/card.module';
import { ServiceInfoDisplayModule } from '../../shared/service-info-display/service-info-display.module';
import { ConsDepartmentsModule } from './departments/cons-departments.module';
import { OnlineUsersModule } from './online-users/online-users.module';
import { AppointmentServicesModule } from './services/appointment/appointment-services.module';
import { DonationServicesModule } from './services/donation/donation-services.module';
import { CheckinServicesModule } from './services/checkin/checkin-services.module';
import { BasicProfileModule } from './basic-profile/basic-profile.module';
import { QuickActionsModule } from './quick-actions/quick-actions.module';
import { AdvancedProfileModule } from '../../shared/profile/advanced-profile/advanced-profile.module';
import { TemplateModule } from './template/template.module';

const routes: Routes = [
  { path: '', component: RootComponent }
]

@NgModule({
  declarations: [RootComponent],
  imports: [
    CommonModule,
    I8nModule,
    DateFormatPipeModule,
    SafeHtmlModule,
    CardModule,
    ServiceInfoDisplayModule,
    ConsDepartmentsModule,
    OnlineUsersModule,
    AppointmentServicesModule,
    DonationServicesModule,
    CheckinServicesModule,
    MatDialogModule,
    MatButtonModule,
    AddInboxMessagesModule,
    BasicProfileModule,
    JGalleryModule,
    BasicProfileNewModule,
    QuickActionsModule,
    AdvancedProfileModule,
    TemplateModule,
    RouterModule.forChild(routes)
  ],
  exports: [RootComponent],
  providers: [
    ToastService, MessageService
  ]
})
export class RootModule { }
