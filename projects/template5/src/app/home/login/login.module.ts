import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { LoadingSpinnerModule, I8nModule, PhoneInputModule, ErrrorMessageModule } from 'jconsumer-shared';
import { FormsModule } from '@angular/forms';
import { NgOtpInputModule } from 'ng-otp-input';
import { LoginComponent } from './login.component';

const routes: Routes = [
  { path: '', component: LoginComponent}
]

@NgModule({
  declarations: [LoginComponent],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    MatButtonModule,
    MatSelectModule,
    MatOptionModule,
    FormsModule,
    NgOtpInputModule,
    PhoneInputModule,
    I8nModule,
    ErrrorMessageModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    LoginComponent
  ]
})
export class LoginModule { }
