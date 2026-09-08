import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CatagoriesComponent } from './catagories.component';
import { PaginatorModule } from 'primeng/paginator';
import { CommonModule } from '@angular/common';
import { ErrrorMessageModule, SkeletonLoadingModule } from 'jconsumer-shared';

const routes: Routes = [
  { path: '', component: CatagoriesComponent}
]

@NgModule({
  declarations: [CatagoriesComponent],
  imports: [
    CommonModule,
    PaginatorModule,
    SkeletonLoadingModule,
    ErrrorMessageModule,
    RouterModule.forChild(routes)
  ],
exports:[CatagoriesComponent]
})
export class CatagoriesModule { }
