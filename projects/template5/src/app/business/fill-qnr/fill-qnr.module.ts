import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionnaireModule } from 'projects/jaldee-framework/questionaire/edit/questionnaire.module';
import { FillQnrComponent } from './fill-qnr.component';
import { QuestionaireService } from 'jaldee-framework/questionaire';



@NgModule({
  declarations: [FillQnrComponent],
  exports: [FillQnrComponent],
  imports: [
    CommonModule,
    QuestionnaireModule
  ],
  providers: [
    QuestionaireService
]
})
export class FillQnrModule { }
