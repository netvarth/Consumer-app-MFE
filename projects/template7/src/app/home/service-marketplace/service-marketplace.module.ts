import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ServiceCardComponent } from './components/service-card/service-card.component';
import { StoreCardComponent } from './components/store-card/store-card.component';
import { ServiceSelectionComponent } from './service-selection/service-selection.component';
import { StoreSelectionComponent } from './store-selection/store-selection.component';

@NgModule({
  declarations: [StoreSelectionComponent, ServiceSelectionComponent, StoreCardComponent, ServiceCardComponent],
  imports: [CommonModule, RouterModule]
})
export class ServiceMarketplaceModule {}
