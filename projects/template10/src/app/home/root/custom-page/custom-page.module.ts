import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomPageComponent } from './custom-page.component';
import { ServiceCardModule } from '../service-card/service-card.module';
import { DepartmentCardModule } from '../department-card/department-card.module';

@NgModule({
  declarations: [
    CustomPageComponent
  ],
  imports: [
    CommonModule,
    ServiceCardModule,
    DepartmentCardModule
  ],
  exports: [
    CustomPageComponent
  ]
})
export class CustomPageModule { }
