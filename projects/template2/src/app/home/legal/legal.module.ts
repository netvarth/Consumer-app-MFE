import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TermsconditionModule } from '../../../../../template5/src/app/business/termscondition/termscondition.module';
import { PrivacyModule } from '../../shared/privacy/privacy.module';
import { LegalComponent } from './legal.component';

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

