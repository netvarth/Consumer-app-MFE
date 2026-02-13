import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { ItemsComponent } from './items.component';
import { AccordionModule } from 'primeng/accordion';
import { SidebarModule } from 'primeng/sidebar';
import { PaginatorModule } from 'primeng/paginator';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { DialogService } from 'primeng/dynamicdialog';
import { ErrrorMessageModule, SkeletonLoadingModule, ToastService } from 'jconsumer-shared';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { DeliverySelectionModule } from './delivery-selection/delivery-selection.module';
import { MessageService } from 'primeng/api';
import { SliderModule } from 'primeng/slider';
import { CarouselModule } from 'primeng/carousel';
import { TooltipModule } from 'primeng/tooltip';
import { LazyLoadTriggerDirective } from '../../lazy-load-trigger.directive';
const routes: Routes = [
  { path: '', component: ItemsComponent}
]


@NgModule({
  declarations: [ItemsComponent],
  imports: [
    CommonModule,
    FormsModule,
    AccordionModule,
    SidebarModule,
    PaginatorModule,
    SliderModule,
    CarouselModule,
    TooltipModule,
    LazyLoadTriggerDirective,
    SkeletonLoadingModule,
    MatCheckboxModule,
    AuthenticationModule,
    ErrrorMessageModule,
    DeliverySelectionModule,
    RouterModule.forChild(routes)
  ],
  exports: [
    ItemsComponent
  ],
  providers: [
    DialogService,
    ToastService,
    MessageService
  ],
})
export class ItemsModule { }
