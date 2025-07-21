import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MembershipServiceComponent } from './membership-service.component';
import { RouterModule, Routes } from '@angular/router';
import { AuthenticationModule } from '../../authentication/authentication.module';
import { QuestionnaireModule } from 'jconsumer-shared';

const routes: Routes = [
  {path: '', component :MembershipServiceComponent}
]

@NgModule({
  declarations: [
    MembershipServiceComponent
  ],
  imports: [
    CommonModule,
    QuestionnaireModule,
    AuthenticationModule,
    [RouterModule.forChild(routes)]
  ],
  exports:[MembershipServiceComponent]
})
export class MembershipServiceModule { }
