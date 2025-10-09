import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { UserLocationComponent } from './user-location.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormMessageDisplayModule } from 'jconsumer-shared';



@NgModule({
  declarations: [UserLocationComponent],
  exports: [UserLocationComponent],
  imports: [
    CommonModule,
    FormsModule,
    MatTooltipModule,
    MatDialogModule,
    MatButtonModule,
    MatInputModule,
    MatIconModule,
    FormMessageDisplayModule
  ]
})
export class UserLocationModule { }
