import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AboutComponent } from './about.component';
import { NgxNl2brModule } from "ngx-nl2br";
import { CapitalizeFirstPipeModule, I8nModule } from 'jconsumer-shared';

@NgModule({
  declarations: [
    AboutComponent
  ],
  imports: [
    CommonModule,
    NgxNl2brModule,
    I8nModule,
    CapitalizeFirstPipeModule
  ],
  exports: [AboutComponent]
})
export class AboutModule { }
