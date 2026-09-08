import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrivacyModule } from '../../shared/privacy/privacy.module';
import { LegalComponent } from './legal.component';
import { TermsconditionModule } from '../../shared/termscondition/termscondition.module';

const routes: Routes = [
  { path: '', component: LegalComponent }
];

@NgModule({
  declarations: [LegalComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    TermsconditionModule,
    PrivacyModule
  ]
})
export class LegalModule {}

