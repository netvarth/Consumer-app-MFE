import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DepartmentCardComponent } from './department-card.component';



@NgModule({
  declarations: [
    DepartmentCardComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    DepartmentCardComponent
  ]
})
export class DepartmentCardModule { }
