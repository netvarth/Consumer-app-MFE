import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MarketplaceService, ServiceSelectionPageConfig } from '../../models/service-marketplace.models';

@Component({
  selector: 'app-marketplace-service-card',
  templateUrl: './service-card.component.html',
  styleUrls: ['./service-card.component.scss']
})
export class ServiceCardComponent {
  @Input({ required: true }) service!: MarketplaceService;
  @Input() page: ServiceSelectionPageConfig = {};
  @Input() imageUrl = '';
  @Input() price = '';
  @Input() discountLabel = '';
  @Output() book = new EventEmitter<MarketplaceService>();
  imageFailed = false;
}
