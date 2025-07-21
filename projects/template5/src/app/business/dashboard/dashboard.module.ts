import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from "@angular/material/button";
import { MatDialogModule } from "@angular/material/dialog";
import { MatGridListModule } from "@angular/material/grid-list";
import { MatIconModule } from "@angular/material/icon";
import { MatMenuModule } from "@angular/material/menu";
import { MatTooltipModule } from "@angular/material/tooltip";
import { DashboardComponent } from './dashboard.component';
import { RouterModule, Routes } from '@angular/router';
import { MeetingDetailsModule } from '../meeting-details/meeting-details.module';
import { RateServiceModule } from '../consumer-rate-service-popup/rate-service-popup.module';
import { AddInboxMessagesModule } from '../add-inbox-messages/add-inbox-messages.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { SharedModule } from 'jaldee-framework/shared';
import { ViewRxModule } from 'jaldee-framework/view-rx';
import { CouponsModule } from 'jaldee-framework/coupons';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TabViewModule } from 'primeng/tabview';
import { CallbacklistCardModule } from '../ivr/callbacklist-card/callbacklist-card.module';
import { AttachmentPopupModule } from '../attachment-popup/attachment-popup.module';
import { GalleryModule } from '../gallery/gallery.module';
import { ApptCardModule } from '../appointment/card/appt-card.module';
import { WLCardModule } from '../checkin/card/wl-card.module';
import { I8nModule } from '../../modules/i8n/i8n.module';
import { InvoiceListModule } from '../invoice-list/invoice-list.module';
import { CapitalizeFirstPipeModule } from 'jaldee-framework/pipes/capitalize';
const routes: Routes = [
  { path: '', component: DashboardComponent }
];


@NgModule({
  declarations: [
    DashboardComponent
  ],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    CapitalizeFirstPipeModule,
    MatDialogModule,
    MatGridListModule,
    MatTooltipModule,
    SharedModule,
    I8nModule,
    TabViewModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    WLCardModule,
    ApptCardModule,
    GalleryModule,
    AddInboxMessagesModule,
    RateServiceModule,
    MeetingDetailsModule,
    ViewRxModule,
    AttachmentPopupModule,
    CouponsModule,
    CallbacklistCardModule,
    AuthenticationModule,
    FormsModule,
    ReactiveFormsModule,
    InvoiceListModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [DashboardComponent]
})
export class DashboardModule { }
