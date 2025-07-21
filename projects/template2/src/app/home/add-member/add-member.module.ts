import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AddMemberComponent } from './add-member.component';
import { InputTextModule } from 'primeng/inputtext';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { 
    CapitalizeFirstPipeModule, 
    FormMessageDisplayModule, 
    I8nModule, 
    LoadingSpinnerModule, 
    PhoneInputModule 
} from 'jconsumer-shared';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormMessageDisplayModule,
        FormsModule,
        InputTextareaModule,
        ReactiveFormsModule,
        I8nModule,
        LoadingSpinnerModule,
        InputTextModule,
        CalendarModule,
        DropdownModule,
        MatSelectModule,
        MatOptionModule,
        CapitalizeFirstPipeModule,
        PhoneInputModule
    ],
    declarations: [
        AddMemberComponent
    ],
    exports: [AddMemberComponent]
})
export class AddMemberModule {
}
