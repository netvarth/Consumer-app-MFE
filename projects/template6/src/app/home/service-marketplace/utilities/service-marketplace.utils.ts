import {
  MarketplaceAction,
  MarketplaceLocation,
  MarketplaceService,
  MarketplaceStore,
  ServiceMarketplaceConfig
} from '../models/service-marketplace.models';

function enabledAndSorted<T extends { enabled: boolean; sortOrder?: number }>(items: T[] | undefined): T[] {
  return (items || [])
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item?.enabled === true)
    .sort((a, b) => (a.item.sortOrder ?? Number.MAX_SAFE_INTEGER) - (b.item.sortOrder ?? Number.MAX_SAFE_INTEGER) || a.index - b.index)
    .map(({ item }) => item);
}

export function getEnabledLocations(config: ServiceMarketplaceConfig): MarketplaceLocation[] {
  return enabledAndSorted(config.locations);
}

export function getEnabledActions(config: ServiceMarketplaceConfig): MarketplaceAction[] {
  return enabledAndSorted(config.actionCategories);
}

export function getFilteredStores(
  config: ServiceMarketplaceConfig,
  locationId: string,
  actionKey: string
): MarketplaceStore[] {
  const stores = enabledAndSorted(config.stores).filter((store) => {
    const matchesLocation = locationId === 'near-you' || store.locationId === locationId;
    const matchesAction = !actionKey || (store.actionKeys || []).includes(actionKey);
    return matchesLocation && matchesAction;
  });
  return locationId === 'near-you'
    ? stores.sort((a, b) => (a.distanceKm ?? Number.MAX_SAFE_INTEGER) - (b.distanceKm ?? Number.MAX_SAFE_INTEGER))
    : stores;
}

export function getStoreById(config: ServiceMarketplaceConfig, storeId: string): MarketplaceStore | undefined {
  return (config.stores || []).find((store) => store.enabled === true && store.id === storeId);
}

export function getEnabledServices(store: MarketplaceStore): MarketplaceService[] {
  return enabledAndSorted(store.services);
}

export function resolveMarketplaceImageUrl(assetBasePath: string | undefined, image: string | undefined): string {
  if (!image) return '';
  if (/^(https?:)?\/\//i.test(image) || /^(data|blob):/i.test(image)) return image;
  const base = assetBasePath ? `${assetBasePath.replace(/\/$/, '')}/` : '';
  return `${base}${image.replace(/^\.\//, '').replace(/^\//, '')}`;
}

export function formatDistance(distanceKm: number | undefined, suffix: string | undefined): string {
  if (!Number.isFinite(distanceKm)) return '';
  return `${distanceKm} ${suffix || ''}`.trim();
}

export function formatPrice(service: MarketplaceService, currency: ServiceMarketplaceConfig['currency']): string {
  if (service.priceDisplay && !service.priceDisplay.includes('â')) return service.priceDisplay;
  if (!Number.isFinite(service.price)) return '';
  try {
    return new Intl.NumberFormat(currency?.locale || 'en-IN', {
      style: 'currency', currency: currency?.code || 'INR', maximumFractionDigits: 0
    }).format(service.price as number);
  } catch {
    return `${currency?.symbol || ''}${service.price}`;
  }
}

export function normalizeMarketplaceText(value?: string): string {
  return (value || '')
    .replace(/â‚¹/g, '₹')
    .replace(/â€œ|â€/g, '“')
    .replace(/â€™/g, '’');
}

export function buildPhoneLink(phoneNumber?: string, phoneLink?: string): string {
  if (phoneLink && /^tel:\+?[\d\s()-]{7,}$/i.test(phoneLink.trim())) return phoneLink.trim();
  const normalized = (phoneNumber || '').replace(/[^\d+]/g, '');
  if (!/^\+?\d{7,15}$/.test(normalized)) return '';
  return `tel:${normalized}`;
}
