import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { RootComponent } from './root.component';
import { DateFormatPipeModule, ErrrorMessageModule, I8nModule, JGalleryModule, ToastService } from 'jconsumer-shared';
import { MatTooltipModule } from '@angular/material/tooltip';
import { AddInboxMessagesModule } from '../../shared/add-inbox-messages/add-inbox-messages.module';
import { BasicProfileNewModule } from '../../shared/profile/basic-profile-new/basic-profile-new.module';
import { QRCodeGeneratordetailModule } from '../../shared/qrcode/qrcodegeneratordetail.module';
import { CouponsModule } from '../../shared/coupons/coupons.module';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MembershipServicesModule } from '../../shared/membership-services/membership-services.module';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TemplateModule } from './template/template.module';

const routes: Routes = [
  { path: '', component: RootComponent}
]

@NgModule({
  declarations: [RootComponent],
  imports: [
    CommonModule,
    I8nModule,
    MatTooltipModule,
    MatButtonModule,
    MatDialogModule,
    AddInboxMessagesModule,
    BasicProfileNewModule,
    QRCodeGeneratordetailModule,
    CouponsModule,
    MembershipServicesModule,
    ErrrorMessageModule,
    JGalleryModule,
    ButtonModule,
    TemplateModule,
    DateFormatPipeModule,
    RouterModule.forChild(routes)
  ],
  exports: [RootComponent],
  providers:[
    ToastService, MessageService
  ]
})
export class RootModule { }
