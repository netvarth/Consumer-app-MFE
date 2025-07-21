import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login.component';
import { NgOtpInputModule } from 'ng-otp-input';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { LoadingSpinnerModule } from 'jaldee-framework/spinner';
import { SharedModule } from 'jaldee-framework/shared';
import { I8nModule } from '../../modules/i8n/i8n.module';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

const routes: Routes = [
  { path: '', component: LoginComponent}
]

@NgModule({
  declarations: [
    LoginComponent
  ],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    NgOtpInputModule,
    FormsModule,
    NgxIntlTelInputModule,
    MatButtonModule,
    SharedModule,
    I8nModule,
    MatSelectModule,
    MatOptionModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    LoginComponent
  ]
})
export class LoginModule { }
