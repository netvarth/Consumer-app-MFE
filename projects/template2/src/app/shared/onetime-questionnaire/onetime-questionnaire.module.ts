import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OnetimeQuestionnaireComponent } from './onetime-questionnaire.component';
import { ButtonModule } from 'primeng/button';
import { SkeletonLoadingModule } from 'jconsumer-shared';
import { QuestionnaireModule } from '../questionaire/edit/questionnaire.module';



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
