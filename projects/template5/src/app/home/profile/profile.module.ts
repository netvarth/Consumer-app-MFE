import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ProfileComponent } from './profile.component';
import { MatRadioModule } from '@angular/material/radio';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from "@angular/material/icon";
import { MatSelectModule } from "@angular/material/select";
import { MatOptionModule } from "@angular/material/core";
const routes: Routes = [
    { path: '', component: ProfileComponent }
];
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { 
    CapitalizeFirstPipeModule, 
    ErrrorMessageModule, 
    FormMessageDisplayModule, 
    I8nModule, 
    LoadingSpinnerModule, 
    PhoneInputModule 
} from 'jconsumer-shared';
import { AddMemberModule } from '../add-member/add-member.module';

@NgModule({
    imports: [
        CommonModule,
        [RouterModule.forChild(routes)],
        ReactiveFormsModule,
        FormMessageDisplayModule,
        LoadingSpinnerModule,
        FormsModule,
        MatRadioModule,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
        MatButtonModule,
        MatSlideToggleModule,
        MatDialogModule,
        AddMemberModule,
        CapitalizeFirstPipeModule,
        MatIconModule,
        MatSelectModule,
        MatOptionModule,
        InputTextModule,
        CalendarModule,
        DropdownModule,
        I8nModule,
        PhoneInputModule,
        ErrrorMessageModule
    ],
    declarations: [
        ProfileComponent
    ],
    exports: [ProfileComponent]
})
export class ProfileModule {
}