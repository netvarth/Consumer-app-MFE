import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QuestionaireViewComponent } from './questionaire-view.component';
import { CapitalizeFirstPipeModule, FileService, LoadingSpinnerModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    QuestionaireViewComponent
  ],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    CapitalizeFirstPipeModule
  ],
  exports: [
    QuestionaireViewComponent
  ],
  providers: [
    FileService
  ]
})
export class QuestionaireViewModule { }
