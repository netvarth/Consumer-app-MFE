import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RatingStarComponent } from './ratingstar.component';
@NgModule({
    imports: [
      FormsModule,
      CommonModule,
      
    ],
    declarations: [RatingStarComponent],
    exports: [RatingStarComponent]
})
export class RatingStarModule {
}
