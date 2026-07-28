import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import {
  AppHeaderComponent, BookingDetailsPageComponent, BookingPageComponent, BookingSuccessPageComponent,
  BottomNavComponent, HomePageComponent, LocationsPageComponent, ProviderPageComponent, StaticPageComponent
} from '../chotaboss/booking-pages';
import {
  CheckoutPageComponent, OrderSuccessPageComponent, QuantityComponent, SearchPageComponent, ShopPageComponent, StorePageComponent
} from '../chotaboss/shop-pages';
import { ChotaBossShellComponent } from '../chotaboss/chotaboss-shell.component';

const childRoutes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'home' },
  { path: 'home', component: HomePageComponent },
  { path: 'locations', component: LocationsPageComponent },
  { path: 'provider/:id', component: ProviderPageComponent },
  { path: 'book/:id', component: BookingPageComponent },
  { path: 'booking/success', component: BookingSuccessPageComponent },
  { path: 'booking/details', component: BookingDetailsPageComponent },
  { path: 'bookings', component: BookingDetailsPageComponent },
  { path: 'shop', component: ShopPageComponent },
  { path: 'search', component: SearchPageComponent },
  { path: 'store/:id', component: StorePageComponent },
  { path: 'checkout', component: CheckoutPageComponent },
  { path: 'order/success', component: OrderSuccessPageComponent },
  { path: 'about', component: StaticPageComponent, data: { title: 'About Us', message: 'One trusted place for veterinary care, grooming, and everything your pet needs.' } },
  { path: 'support', component: StaticPageComponent, data: { title: 'Support', message: 'We are here to help you and your pet.' } },
  { path: '**', redirectTo: 'home' }
];

const routes: Routes = [{ path: '', component: ChotaBossShellComponent, children: childRoutes }];

@NgModule({
  declarations: [
    AppHeaderComponent, BottomNavComponent, QuantityComponent, HomePageComponent, LocationsPageComponent,
    ProviderPageComponent, BookingPageComponent, BookingSuccessPageComponent, BookingDetailsPageComponent,
    ShopPageComponent, SearchPageComponent, StorePageComponent, CheckoutPageComponent, OrderSuccessPageComponent,
    StaticPageComponent, ChotaBossShellComponent
  ],
  imports: [CommonModule, FormsModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeModule {}
