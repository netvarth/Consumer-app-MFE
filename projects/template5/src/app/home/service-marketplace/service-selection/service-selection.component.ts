import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import {
  MarketplaceService,
  MarketplaceStore,
  MarketplaceTemplateConfig,
  ServiceMarketplaceConfig
} from '../models/service-marketplace.models';
import {
  buildPhoneLink,
  formatDistance,
  formatPrice,
  getEnabledServices,
  getStoreById,
  normalizeMarketplaceText,
  resolveMarketplaceImageUrl
} from '../utilities/service-marketplace.utils';

@Component({
  selector: 'app-service-selection',
  templateUrl: './service-selection.component.html',
  styleUrls: ['./service-selection.component.scss']
})
export class ServiceSelectionComponent implements OnInit {
  config?: ServiceMarketplaceConfig;
  store?: MarketplaceStore;
  services: MarketplaceService[] = [];
  phoneLink = '';
  notFound = false;
  logoFailed = false;

  constructor(
    private readonly sharedService: SharedService,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    const template = (this.sharedService.getTemplateJSON() || {}) as MarketplaceTemplateConfig;
    this.config = template.serviceMarketplace;
    if (!this.config?.enabled) { this.notFound = true; return; }
    this.store = getStoreById(this.config, this.route.snapshot.paramMap.get('storeId') || '');
    if (!this.store) { this.notFound = true; return; }
    this.services = getEnabledServices(this.store);
    this.phoneLink = buildPhoneLink(this.store.phoneNumber, this.store.phoneLink);
  }

  goBack(): void {
    if (window.history.length > 1) this.location.back();
    else this.openStoreSelection();
  }

  openStoreSelection(): void {
    if (!this.config) return;
    void this.router.navigateByUrl(this.routeUrl(this.config.routes.storeSelection));
  }

  openLocation(): void {
    if (this.store?.locationLink) window.open(this.store.locationLink, '_blank', 'noopener');
  }

  book(service: MarketplaceService): void {
    if (!service.serviceLink) return;
    if (/^https?:\/\//i.test(service.serviceLink)) {
      window.location.assign(service.serviceLink);
      return;
    }
    void this.router.navigateByUrl(this.routeUrl(service.serviceLink));
  }

  imageUrl(image?: string): string { return resolveMarketplaceImageUrl(this.config?.assetBasePath, image); }
  distance(): string { return formatDistance(this.store?.distanceKm, this.config?.storeSelectionPage?.distanceSuffix); }
  price(service: MarketplaceService): string { return formatPrice(service, this.config?.currency); }
  discountLabel(service: MarketplaceService): string { return normalizeMarketplaceText(service.discount?.label); }
  trackById(_: number, item: MarketplaceService): string { return item.id; }

  private routeUrl(link: string): string {
    const normalized = link.replace(/^\/+/, '').replace(/^capp\//, '');
    const routeId = this.sharedService.getRouteID();
    return normalized === routeId || normalized.startsWith(`${routeId}/`) ? normalized : `${routeId}/${normalized}`;
  }
}
