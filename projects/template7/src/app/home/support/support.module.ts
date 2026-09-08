import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SupportComponent } from './support.component';
import { RouterModule, Routes } from '@angular/router';
import { BasicProfileNewModule } from '../../shared/profile/basic-profile-new/basic-profile-new.module';

const routes: Routes = [
  {path: '', component: SupportComponent}
]

@NgModule({
  declarations: [
    SupportComponent
  ],
  imports: [
    CommonModule,
    BasicProfileNewModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    SupportComponent
  ]
})
export class SupportModule { }
