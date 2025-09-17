import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule, Routes } from '@angular/router';
import { CapitalizeFirstPipeModule, ErrrorMessageModule, I8nModule, LoadingSpinnerModule, QuestionnaireModule, ToastService } from 'jconsumer-shared';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from "@angular/material/expansion";
import { MatTabsModule } from "@angular/material/tabs";
import { QRCodeModule } from 'angularx-qrcode';
import { AddInboxMessagesModule } from '../../shared/add-inbox-messages/add-inbox-messages.module';
import { MeetingDetailsModule } from '../../shared/meeting-details/meeting-details.module';
import { ActionPopupModule } from '../../shared/action-popup/action-popup.module';
import { GalleryModule } from '../../shared/gallery/gallery.module';
import { MatIconModule } from '@angular/material/icon';
import { AttachmentPopupModule } from '../../shared/attachment-popup/attachment-popup.module';
import { ServiceInfoComponent } from './service-info/service-info.component';
import { ServiceImageComponent } from './service-image/service-image.component';
import { MeetingInfoComponent } from './meeting-info/meeting-info.component';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';


const routes: Routes = [
  { path: '', component: DetailsComponent}
]

@NgModule({
  declarations: [    
    DetailsComponent,
    ServiceInfoComponent,
    ServiceImageComponent,
    MeetingInfoComponent
  ],
  imports: [
    [RouterModule.forChild(routes)],
    MatDialogModule,
    CommonModule,
    LoadingSpinnerModule,
    CapitalizeFirstPipeModule,
    QuestionnaireModule,
    MatExpansionModule,
    MatTabsModule,
    QRCodeModule,
    AddInboxMessagesModule,
    MeetingDetailsModule,
    ActionPopupModule,
    GalleryModule,
    MatIconModule,
    AttachmentPopupModule,
    I8nModule,
    ErrrorMessageModule,
    ToastModule
],
  exports: [
    DetailsComponent
  ],
  providers:[ToastService, MessageService]
})
export class DetailsModule { }
