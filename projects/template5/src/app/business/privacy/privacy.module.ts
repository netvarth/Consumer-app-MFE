import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PrivacyComponent } from './privacy.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    PrivacyComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
  ],
  exports: [
    PrivacyComponent
  ]
})
export class PrivacyModule { }
