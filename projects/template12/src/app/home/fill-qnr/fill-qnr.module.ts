import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FillQnrComponent } from './fill-qnr.component';
import { QuestionnaireModule } from 'jconsumer-shared';



@NgModule({
  declarations: [FillQnrComponent],
  exports: [FillQnrComponent],
  imports: [
    CommonModule,
    QuestionnaireModule
  ]
})
export class FillQnrModule { }
