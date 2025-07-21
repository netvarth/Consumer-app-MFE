import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthenticationComponent } from './authentication.component';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { NgOtpInputModule } from 'ng-otp-input';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

@NgModule({
  declarations: [
    AuthenticationComponent
  ],
  imports: [
    CommonModule,
    NgxIntlTelInputModule,
    LoadingSpinnerModule,
    FormsModule,
    MatButtonModule,
    NgOtpInputModule,
    SharedModule,
    I8nModule,
    MatSelectModule,
    MatOptionModule,
  ],
  exports: [
    AuthenticationComponent
  ]
})
export class AuthenticationModule { }
