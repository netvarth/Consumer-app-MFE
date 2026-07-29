import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarketplaceStore, StoreSelectionPageConfig } from '../../models/service-marketplace.models';

@Component({
  selector: 'app-marketplace-store-card',
  templateUrl: './store-card.component.html',
  styleUrls: ['./store-card.component.scss']
})
export class StoreCardComponent {
  @Input({ required: true }) store!: MarketplaceStore;
  @Input() page: StoreSelectionPageConfig = {};
  @Input() imageUrl = '';
  @Input() distance = '';
  @Input() timingLabel = '';
  @Output() openStore = new EventEmitter<MarketplaceStore>();
  imageFailed = false;
}
