import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemSearchComponent } from './item-search.component';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';



@NgModule({
  declarations: [
    ItemSearchComponent
  ],
  imports: [
    CommonModule,
    AutoCompleteModule,
    FormsModule
  ],
  exports: [
    ItemSearchComponent
  ]
})
export class ItemSearchModule { }
