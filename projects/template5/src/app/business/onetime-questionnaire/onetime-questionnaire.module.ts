import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnetimeQuestionnaireComponent } from './onetime-questionnaire.component';
import { ButtonModule } from 'primeng/button';
import { QuestionnaireModule } from 'jaldee-framework/questionaire/edit';
import { SkeletonLoadingModule } from 'jaldee-framework/skeleton';



@NgModule({
  declarations: [OnetimeQuestionnaireComponent],
  imports: [
    CommonModule,
    ButtonModule,
    QuestionnaireModule,
    SkeletonLoadingModule
  ],
  exports: [OnetimeQuestionnaireComponent]
})
export class OnetimeQuestionnaireModule { }
