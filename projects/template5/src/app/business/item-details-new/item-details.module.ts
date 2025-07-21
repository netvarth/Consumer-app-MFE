import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ItemDetailsComponent } from './item-details.component';
import { RouterModule, Routes } from '@angular/router';
import { ImageModule } from 'primeng/image';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { InputNumberModule } from 'primeng/inputnumber';
import { ItemsCardModule } from '../items-card/items-card.module';
import { SkeletonLoadingModule } from 'jaldee-framework/skeleton';
import { DialogService } from 'primeng/dynamicdialog';
import { SafeHtmlModule } from 'jaldee-framework/pipes/safe-html';
import { AccordionModule } from 'primeng/accordion';
import { AuthenticationModule } from '../authentication/authentication.module';
import { FillQnrModule } from '../fill-qnr/fill-qnr.module';
import { ShoppingCartFooterModule } from '../shopping-cart-footer/shopping-cart-footer.module';
import { OrderTemplatesModule } from '../order-templates/order-templates.module';
import { ToastModule } from 'primeng/toast';
import { ToastService } from '../../services/toast.service';
import { MessageService } from 'primeng/api';
import { DropdownModule } from 'primeng/dropdown';

const routes: Routes = [{
  path:'', component: ItemDetailsComponent
}]

@NgModule({
  declarations: [
    ItemDetailsComponent
  ],
  imports: [
    CommonModule,
    ImageModule,
    ButtonModule,
    SkeletonLoadingModule,
    ShoppingCartFooterModule,
    FormsModule,
    InputNumberModule,
    AccordionModule,
    ItemsCardModule,
    AuthenticationModule,
    FillQnrModule,
    OrderTemplatesModule,
    SafeHtmlModule,
    ToastModule,
    DropdownModule,
    [RouterModule.forChild(routes)]
  ],
  exports: [
    ItemDetailsComponent
  ],
  providers: [
    DialogService,
    ToastService,
    MessageService
  ]
})
export class ItemDetailsModule { }
