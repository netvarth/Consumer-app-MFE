import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsCardComponent } from './items-card.component';

import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

@NgModule({
  declarations: [
    ItemsCardComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule
  ],
  exports:[ItemsCardComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ItemsCardModule { }
