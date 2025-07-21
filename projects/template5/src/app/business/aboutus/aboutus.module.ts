import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutusComponent } from './aboutus.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxNl2brModule } from "ngx-nl2br";
import { SharedModule } from 'jaldee-framework/shared';
import { BasicProfileNewModule } from '../../modules/profile/basic-profile-new/basic-profile-new.module';
import { BasicProfileModule } from '../../modules/profile/basic-profile/basic-profile.module';
import { I8nModule } from '../../modules/i8n/i8n.module';

const routes: Routes = [
  { path: '', component: AboutusComponent}
]

@NgModule({
  declarations: [
    AboutusComponent
  ],
  imports: [
    CommonModule,
    BasicProfileModule,
    BasicProfileNewModule,
    NgxNl2brModule,
    SharedModule,
    I8nModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    AboutusComponent
  ]
})
export class AboutusModule { }
