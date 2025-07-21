import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ChangeMobileComponent } from './change-mobile.component';
import { MatButtonModule } from '@angular/material/button';
import { FormMessageDisplayModule } from "jaldee-framework/form-message";
import { SharedModule } from 'jaldee-framework/shared';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { I8nModule } from '../../modules/i8n/i8n.module';
import { OtpFormModule } from '../../modules/otp-form/otp-form.module';
const routes: Routes = [
    { path: '', component: ChangeMobileComponent }
];

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ReactiveFormsModule,
        FormMessageDisplayModule,
        OtpFormModule,
        MatButtonModule,
        SharedModule,
        I8nModule,
        NgxIntlTelInputModule,
        FormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,  
        [RouterModule.forChild(routes)]
    ],
    declarations: [
        ChangeMobileComponent
    ],
    exports: [ChangeMobileComponent]
})
export class ChangeMobileModule {
}
