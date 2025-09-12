import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AboutModule } from '../about/about.module';
import { BasicProfileNewModule } from '../../../shared/profile/basic-profile-new/basic-profile-new.module';
import { SafeHtmlModule } from 'jconsumer-shared';
import { QuickActionsModule } from '../quick-actions/quick-actions.module';
import { ConsDepartmentsModule } from '../departments/cons-departments.module';
import { OnlineUsersModule } from '../online-users/online-users.module';
import { AppointmentServicesModule } from '../services/appointment/appointment-services.module';
import { DonationServicesModule } from '../services/donation/donation-services.module';
import { CheckinServicesModule } from '../services/checkin/checkin-services.module';
import { BasicProfileModule } from '../basic-profile/basic-profile.module';

@NgModule({
  declarations: [
    TemplateComponent
  ],
  imports: [
    CommonModule,
    CarouselModule,
    BasicProfileNewModule,
    BasicProfileModule,
    QuickActionsModule,
    ConsDepartmentsModule,
    OnlineUsersModule,
    AppointmentServicesModule,
    DonationServicesModule,
    CheckinServicesModule,
    AboutModule,
    SafeHtmlModule
  ],
  exports: [TemplateComponent]
})
export class TemplateModule { }
