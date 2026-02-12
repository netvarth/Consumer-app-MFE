import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsCardComponent } from './items-card.component';
import { CarouselModule } from 'ngx-owl-carousel-o';

import { ButtonModule } from 'primeng/button';

@NgModule({
  declarations: [
    ItemsCardComponent
  ],
  imports: [
    CommonModule,
    CarouselModule,
    ButtonModule
  ],
  exports:[ItemsCardComponent]
})
export class ItemsCardModule { }
