import { Location } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import {
  MarketplaceAction,
  MarketplaceLocation,
  MarketplaceStore,
  MarketplaceTemplateConfig,
  ServiceMarketplaceConfig
} from '../models/service-marketplace.models';
import {
  formatDistance,
  getEnabledActions,
  getEnabledLocations,
  getFilteredStores,
  resolveMarketplaceImageUrl
} from '../utilities/service-marketplace.utils';

@Component({
  selector: 'app-store-selection',
  templateUrl: './store-selection.component.html',
  styleUrls: ['./store-selection.component.scss']
})
export class StoreSelectionComponent implements OnInit {
  config?: ServiceMarketplaceConfig;
  locations: MarketplaceLocation[] = [];
  actions: MarketplaceAction[] = [];
  stores: MarketplaceStore[] = [];
  selectedLocationId = '';
  selectedActionKey = '';
  locationMessage = '';
  brokenLocationImages = new Set<string>();

  private readonly locationStorageKey = 'serviceMarketplace.location';
  private readonly actionStorageKey = 'serviceMarketplace.action';

  constructor(
    private readonly sharedService: SharedService,
    private readonly router: Router,
    private readonly location: Location
  ) {}

  ngOnInit(): void {
    const template = (this.sharedService.getTemplateJSON() || {}) as MarketplaceTemplateConfig;
    if (!template.serviceMarketplace?.enabled) return;
    this.config = template.serviceMarketplace;
    this.locations = getEnabledLocations(this.config);
    this.actions = getEnabledActions(this.config);
    this.selectedLocationId = this.resolveInitialSelection(
      this.locations.map((item) => item.id),
      this.config.selection?.defaultLocationId,
      this.config.selection?.persistSelectedLocation ? localStorage.getItem(this.locationStorageKey) : null
    );
    this.selectedActionKey = this.resolveInitialSelection(
      this.actions.map((item) => item.key),
      this.config.selection?.defaultActionKey,
      this.config.selection?.persistSelectedAction ? localStorage.getItem(this.actionStorageKey) : null
    );
    this.refreshStores();
  }

  selectLocation(item: MarketplaceLocation): void {
    this.locationMessage = '';
    if (item.useCurrentLocation && this.config?.selection?.useBrowserLocationForNearYou) {
      if (!navigator.geolocation) {
        this.locationMessage = 'Location is unavailable. Your previous selection is still active.';
        return;
      }
      navigator.geolocation.getCurrentPosition(
        () => this.applyLocation(item.id),
        () => this.locationMessage = 'We could not access your location. Your previous selection is still active.',
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
      );
      return;
    }
    this.applyLocation(item.id);
  }

  selectAction(item: MarketplaceAction): void {
    this.selectedActionKey = item.key;
    if (this.config?.selection?.persistSelectedAction) localStorage.setItem(this.actionStorageKey, item.key);
    this.refreshStores();
  }

  openStore(store: MarketplaceStore): void {
    if (!this.config) return;
    const configuredLink = store.storeLink?.trim();
    if (configuredLink && /^https?:\/\//i.test(configuredLink)) {
      window.location.assign(configuredLink);
      return;
    }
    const link = configuredLink || this.config.routes.serviceSelection.replace(':storeId', encodeURIComponent(store.id));
    void this.router.navigateByUrl(this.routeUrl(link));
  }

  goBack(): void {
    if (window.history.length > 1) this.location.back();
    else void this.router.navigate([this.sharedService.getRouteID()]);
  }

  imageUrl(image?: string): string { return resolveMarketplaceImageUrl(this.config?.assetBasePath, image); }
  markLocationImageBroken(id: string): void { this.brokenLocationImages.add(id); }
  distance(store: MarketplaceStore): string { return formatDistance(store.distanceKm, this.config?.storeSelectionPage?.distanceSuffix); }
  trackById(_: number, item: { id?: string; key?: string }): string { return item.id || item.key || ''; }

  private applyLocation(locationId: string): void {
    this.selectedLocationId = locationId;
    if (this.config?.selection?.persistSelectedLocation) localStorage.setItem(this.locationStorageKey, locationId);
    this.refreshStores();
  }

  private refreshStores(): void {
    this.stores = this.config ? getFilteredStores(this.config, this.selectedLocationId, this.selectedActionKey) : [];
  }

  private resolveInitialSelection(validValues: string[], configured?: string, persisted?: string | null): string {
    if (persisted && validValues.includes(persisted)) return persisted;
    if (configured && validValues.includes(configured)) return configured;
    return validValues[0] || '';
  }

  private routeUrl(link: string): string {
    const normalized = link.replace(/^\/+/, '').replace(/^capp\//, '');
    const routeId = this.sharedService.getRouteID();
    return normalized === routeId || normalized.startsWith(`${routeId}/`) ? normalized : `${routeId}/${normalized}`;
  }
}
