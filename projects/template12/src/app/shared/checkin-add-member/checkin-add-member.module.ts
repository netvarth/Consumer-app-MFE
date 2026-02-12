import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckinAddMemberComponent } from './checkin-add-member.component';
import { DropdownModule } from 'primeng/dropdown';
import { CapitalizeFirstPipeModule } from 'jconsumer-shared';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        CapitalizeFirstPipeModule,
        DropdownModule,
        ReactiveFormsModule
    ],
    declarations: [
        CheckinAddMemberComponent
    ],
    exports: [CheckinAddMemberComponent]
})
export class CheckinAddMemberModule {
}
