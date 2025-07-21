import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IvrComponent } from './ivr.component';
import { RouterModule, Routes } from '@angular/router';
import { BookingService } from '../../services/booking-service';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { IvrConfirmModule } from './ivr-confirm/ivr-confirm.module';
const routes: Routes = [
  { path:'', component: IvrComponent}
]


@NgModule({
  declarations: [
    IvrComponent
  ],
  imports: [
    CommonModule,
    MatDialogModule,
    IvrConfirmModule,
    ButtonModule,
    FormsModule,
    DropdownModule,
    [RouterModule.forChild(routes)]
  ],
  providers:[BookingService],

})
export class IvrModule { }
