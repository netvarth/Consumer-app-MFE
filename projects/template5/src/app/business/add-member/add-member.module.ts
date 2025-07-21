import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddMemberComponent } from './add-member.component';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { CapitalizeFirstPipeModule, FormMessageDisplayModule, LoadingSpinnerModule } from 'jconsumer-shared';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        InputTextareaModule,
        FormMessageDisplayModule,
        FormsModule,
        ReactiveFormsModule,
        SharedModule,
        I8nModule,
        LoadingSpinnerModule,
        InputTextModule,
        NgxIntlTelInputModule,
        CalendarModule,
        DropdownModule,
        CapitalizeFirstPipeModule
    ],
    declarations: [
        AddMemberComponent
    ],
    exports: [AddMemberComponent]
})
export class AddMemberModule {
}
