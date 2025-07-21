import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IvrConfirmComponent } from './ivr-confirm.component';
import { ButtonModule } from 'primeng/button';
import { MatDialogModule } from '@angular/material/dialog';



@NgModule({
  declarations: [
    IvrConfirmComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    MatDialogModule
  ],
  exports:[IvrConfirmComponent]
})
export class IvrConfirmModule { }
