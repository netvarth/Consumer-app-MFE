import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from './authentication.component';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgOtpInputModule } from 'ng-otp-input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { DropdownModule } from 'primeng/dropdown';
import { ErrrorMessageModule, LoadingSpinnerModule, PhoneInputModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    AuthenticationComponent
  ],
  imports: [
    CommonModule,
    PhoneInputModule,
    LoadingSpinnerModule,
    FormsModule,
    MatButtonModule,
    NgOtpInputModule, 
    MatSelectModule,
    MatOptionModule,
    DropdownModule,
    ErrrorMessageModule],
  exports: [
    AuthenticationComponent
  ]
})
export class AuthenticationModule { }
