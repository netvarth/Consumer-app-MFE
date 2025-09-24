import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TemplateComponent } from './template.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { BasicProfileModule } from '../basic-profile/basic-profile.module';
import { AboutModule } from '../about/about.module';
import { CapitalizeFirstPipeModule, JGalleryModule, SafeHtmlModule } from 'jconsumer-shared';
import { QuickActionsModule } from '../quick-actions/quick-actions.module';
import { ConsDepartmentsModule } from '../departments/cons-departments.module';
import { OnlineUsersModule } from '../online-users/online-users.module';
import { DonationServicesModule } from '../services/donation/donation-services.module';
import { ServiceCardModule } from '../service-card/service-card.module';
import { UserCardModule } from '../user-card/user-card.module';


@NgModule({
  declarations: [
    TemplateComponent
  ],
  imports: [
    CommonModule,
    JGalleryModule,
    CarouselModule,
    BasicProfileModule,
    QuickActionsModule,
    ConsDepartmentsModule,
    OnlineUsersModule,
    ServiceCardModule,
    DonationServicesModule,
    CapitalizeFirstPipeModule,
    AboutModule,
    UserCardModule,
    SafeHtmlModule
  ],
  exports: [TemplateComponent]
})
export class TemplateModule { }
