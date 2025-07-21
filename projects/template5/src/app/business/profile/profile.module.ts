import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { SharedModule } from 'jaldee-framework/shared';
import { NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { AddMemberModule } from '../add-member/add-member.module';
import { DropdownModule } from 'primeng/dropdown';
import { MatSelectModule } from '@angular/material/select';
import { CalendarModule } from 'primeng/calendar';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { InputTextModule } from 'primeng/inputtext';
import { CapitalizeFirstPipeModule, FormMessageDisplayModule, I8nModule, LoadingSpinnerModule } from 'jconsumer-shared';
const routes: Routes = [
    { path: '', component: ProfileComponent }
];
@NgModule({
    imports: [
        CommonModule,
        [RouterModule.forChild(routes)],
        ReactiveFormsModule,
        FormMessageDisplayModule,
        LoadingSpinnerModule,
        FormsModule,
        MatDatepickerModule,
        MatButtonModule,
        MatDialogModule,
        SharedModule,
        I8nModule,
        AddMemberModule,
        CapitalizeFirstPipeModule,
        MatSelectModule,
        MatOptionModule,
        NgxIntlTelInputModule,
        InputTextModule,
        CalendarModule,
        DropdownModule
    ],
    declarations: [
        ProfileComponent
    ],
    exports: [ProfileComponent]
})
export class ProfileModule {
}
