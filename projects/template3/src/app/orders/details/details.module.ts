import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DetailsComponent } from './details.component';
import { RouterModule, Routes } from '@angular/router';
import { ErrrorMessageModule, LoadingSpinnerModule } from 'jconsumer-shared';
import { ButtonModule } from 'primeng/button';
import { TimelineModule } from 'primeng/timeline';
import { MatButtonModule } from '@angular/material/button';

const routes: Routes = [
  { path: '', component: DetailsComponent}
]

@NgModule({
  declarations: [    
    DetailsComponent,
  ],
  imports: [
    CommonModule,
    LoadingSpinnerModule,
    ButtonModule,
    TimelineModule,
    MatButtonModule,
    ErrrorMessageModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    DetailsComponent
  ]
})
export class DetailsModule { }
