import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MyBookingsComponent } from './my-bookings.component';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { CapitalizeFirstPipeModule, ErrrorMessageModule, FormMessageDisplayModule, I8nModule } from 'jconsumer-shared';
import { AuthenticationModule } from '../../../shared/authentication/authentication.module';
import { InvoiceListModule } from '../../../shared/invoice-list/invoice-list.module';
import { ApptCardModule } from '../../../shared/appt-card/appt-card.module';
import { AttachmentPopupModule } from '../../../shared/attachment-popup/attachment-popup.module';
import { GalleryModule } from '../../../shared/gallery/gallery.module';
import { AddInboxMessagesModule } from '../../../shared/add-inbox-messages/add-inbox-messages.module';
import { WLCardModule } from '../../../shared/wl-card/wl-card.module';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
const routes: Routes = [
  { path:'', component: MyBookingsComponent}
]

@NgModule({
  declarations: [MyBookingsComponent],
  imports: [
    CommonModule,
    ApptCardModule,
    WLCardModule,
    MatSelectModule,
    MatDialogModule,
    MatTooltipModule,
    FormsModule,
    CapitalizeFirstPipeModule,
    FormMessageDisplayModule,
    AuthenticationModule,
    AttachmentPopupModule,
    GalleryModule,
    InvoiceListModule,
    I8nModule,
    AddInboxMessagesModule,
    ErrrorMessageModule,
    MatButtonModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [MyBookingsComponent]
})
export class MyBookingsModule { }
