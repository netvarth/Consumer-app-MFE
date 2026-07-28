import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DialogService } from 'primeng/dynamicdialog';
import { SkeletonLoadingModule, ErrrorMessageModule, ToastService,ConfirmBoxModule } from 'jconsumer-shared';
import { AuthenticationModule } from '../../shared/authentication/authentication.module';
import { DeliverySelectionModule } from '../../home/items/delivery-selection/delivery-selection.module';
import { WishlistComponent } from './wishlist.component';

const routes: Routes = [
  { path: '', component: WishlistComponent }
];

@NgModule({
  declarations: [WishlistComponent],
  imports: [
    CommonModule,
    FormsModule,
    SkeletonLoadingModule,
    AuthenticationModule,
    ConfirmBoxModule,
    ErrrorMessageModule,
    DeliverySelectionModule,
    RouterModule.forChild(routes)
  ],
  providers: [
    DialogService,
    ToastService
  ]
})
export class WishlistModule { }
