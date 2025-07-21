import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemsComponent } from './items.component';
import { RouterModule, Routes } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AccordionModule } from 'primeng/accordion';
import { CheckboxModule } from 'primeng/checkbox';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { SidebarModule } from 'primeng/sidebar';
import { SkeletonLoadingModule } from 'jaldee-framework/skeleton';
import { DropdownModule } from 'primeng/dropdown';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { PaginatorModule } from 'primeng/paginator';
import { DialogService } from 'primeng/dynamicdialog';
import { FillQnrModule } from '../fill-qnr/fill-qnr.module';
import { AuthenticationModule } from '../authentication/authentication.module';
import { ShoppingCartFooterModule } from '../shopping-cart-footer/shopping-cart-footer.module';
import { ItemSearchModule } from '../item-search/item-search.module';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import { MessageService } from 'primeng/api';
import { OrderTemplatesModule } from '../order-templates/order-templates.module';
import { DeliverySelectionModule } from './delivery-selection/delivery-selection.module';

const routes: Routes = [{
  path: '', component: ItemsComponent
}]


@NgModule({
  declarations: [
    ItemsComponent
  ],
  imports: [
    CommonModule,
    ButtonModule,
    AccordionModule,
    MatCheckboxModule,
    SidebarModule,
    FormsModule,
    InputTextModule,
    AuthenticationModule,
    PaginatorModule ,
    SliderModule,
    DropdownModule,
    FillQnrModule,
    SkeletonLoadingModule,
    ShoppingCartFooterModule,
    ItemSearchModule,
    ToastModule,
    DeliverySelectionModule,
    OrderTemplatesModule,
    [RouterModule.forChild(routes)]
  ],
  providers: [
    DialogService,
    ToastService,
    MessageService
  ],
 exports:[ItemsComponent]
})
export class ItemsModule { }
