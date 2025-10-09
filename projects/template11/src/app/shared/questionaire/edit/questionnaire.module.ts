import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatOptionModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { QuestionnaireComponent } from './questionnaire.component';
import { MatIconModule } from '@angular/material/icon';
import { CapitalizeFirstPipeModule, FileService, JGalleryModule, LoadingSpinnerModule, SafeHtmlModule } from 'jconsumer-shared';
import { SharedModule } from 'primeng/api';
@NgModule({
    declarations: [
        QuestionnaireComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        LoadingSpinnerModule,
        CapitalizeFirstPipeModule,
        JGalleryModule,
        MatDatepickerModule,
        MatCheckboxModule,
        MatSlideToggleModule,
        MatOptionModule,
        MatSelectModule,
        SafeHtmlModule,
        SharedModule,
        MatIconModule
    ],
    providers:[FileService],
    exports: [QuestionnaireComponent]
})
export class QuestionnaireModule { }
