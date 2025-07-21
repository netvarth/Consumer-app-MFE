import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ItemsComponent } from './items.component';
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { PaginatorModule } from 'primeng/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
// import { DialogService } from 'primeng/dynamicdialog';
import { ErrrorMessageModule, SkeletonLoadingModule } from 'jconsumer-shared';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { DeliverySelectionModule } from './delivery-selection/delivery-selection.module';

const routes: Routes = [
  { path: '', component: ItemsComponent}
]


@NgModule({
  declarations: [ItemsComponent],
  imports: [
    CommonModule,
    AccordionModule,
    SidebarModule,
    PaginatorModule,
    SkeletonLoadingModule,
    MatCheckboxModule,
    AuthenticationModule,
    ErrrorMessageModule,
    DeliverySelectionModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ItemsComponent
  ]
})
export class ItemsModule { }
