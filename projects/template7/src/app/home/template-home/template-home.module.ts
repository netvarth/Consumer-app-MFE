import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TemplateHomeComponent } from './template-home.component';
import { ItemSearchModule } from '../item-search/item-search.module';

@NgModule({
  declarations: [TemplateHomeComponent],
  imports: [CommonModule, RouterModule, ItemSearchModule],
  exports: [TemplateHomeComponent]
})
export class TemplateHomeModule {}
