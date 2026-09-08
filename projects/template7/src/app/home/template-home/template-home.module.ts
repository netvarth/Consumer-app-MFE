import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TemplateHomeComponent } from './template-home.component';

@NgModule({
  declarations: [TemplateHomeComponent],
  imports: [CommonModule, FormsModule, RouterModule],
  exports: [TemplateHomeComponent]
})
export class TemplateHomeModule {}
