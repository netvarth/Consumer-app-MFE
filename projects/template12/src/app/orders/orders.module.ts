import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrdersComponent } from './orders.component';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  { path: '', component: OrdersComponent},
  { path: 'cart', loadChildren: () => import('./cart/cart.module').then(m => m.CartModule) },
  { path: 'checkout', loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule) },
  { path: 'status/:id', loadChildren: () => import('./status/status.module').then(m => m.StatusModule) },  
  { path: 'bill/:id', loadChildren: () => import('./bill/bill.module').then(m => m.BillModule) },
  { path: 'wishlist', loadChildren: () => import('./wishlist/wishlist.module').then(m => m.WishlistModule) },
  { path: ':id', loadChildren: () => import('./details/details.module').then(m => m.DetailsModule) },
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    OrdersComponent,
    [RouterModule.forChild(routes)]
  ],
  exports: [OrdersComponent]
})
export class OrdersModule { }
