import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutUserComponent } from './about.component';
import { RouterModule, Routes } from '@angular/router';
import { NgxNl2brModule } from "ngx-nl2br";
import { BasicProfileModule } from '../../basic-profile/basic-profile.module';
import { BasicProfileNewModule } from '../../../../shared/profile/basic-profile-new/basic-profile-new.module';
import { I8nModule } from 'jconsumer-shared';


const routes: Routes = [
  { path: '', component: AboutUserComponent}
]

@NgModule({
  declarations: [
    AboutUserComponent
  ],
  imports: [
    CommonModule,
    BasicProfileModule,
    BasicProfileNewModule,
    NgxNl2brModule,
    I8nModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    AboutUserComponent
  ]
})
export class AboutUserModule { }
