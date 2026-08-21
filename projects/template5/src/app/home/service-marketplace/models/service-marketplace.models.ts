export interface MarketplaceCurrency {
  code?: string;
  symbol?: string;
  locale?: string;
}

export interface MarketplaceRoutes {
  storeSelection: string;
  serviceSelection: string;
}

export interface MarketplaceSelection {
  defaultLocationId?: string;
  defaultActionKey?: string;
  persistSelectedLocation?: boolean;
  persistSelectedAction?: boolean;
  useBrowserLocationForNearYou?: boolean;
}

export interface MarketplaceAction {
  key: string;
  label: string;
  icon?: string;
  image?: string;
  sortOrder?: number;
  enabled: boolean;
}

export interface MarketplaceLocation {
  id: string;
  name: string;
  image?: string;
  imageAlt?: string;
  icon?: string;
  useCurrentLocation?: boolean;
  enabled: boolean;
  sortOrder?: number;
  latitude?: number;
  longitude?: number;
}

export interface MarketplaceTiming {
  display?: string;
  openTime?: string;
  closeTime?: string;
  timezone?: string;
}

export interface MarketplaceDiscount {
  enabled: boolean;
  type?: string;
  value?: number;
  label?: string;
}

export interface MarketplaceService {
  id: string;
  name: string;
  description?: string;
  price?: number;
  priceDisplay?: string;
  discount?: MarketplaceDiscount;
  serviceImage?: string;
  serviceImageAlt?: string;
  serviceLink?: string;
  enabled: boolean;
  sortOrder?: number;
}

export interface MarketplaceStore {
  id: string;
  name: string;
  shortName?: string;
  locationId: string;
  actionKeys: string[];
  cardImage?: string;
  cardImageAlt?: string;
  storeLogo?: string;
  storeLogoAlt?: string;
  address?: string;
  verified?: boolean;
  experienceYears?: number;
  rating?: number;
  reviews?: number;
  distanceKm?: number;
  latitude?: number;
  longitude?: number;
  timing?: MarketplaceTiming;
  locationLink?: string;
  phoneNumber?: string;
  phoneLink?: string;
  storeLink?: string;
  enabled: boolean;
  sortOrder?: number;
  services?: MarketplaceService[];
}

export interface StoreSelectionPageConfig {
  title?: string;
  backLabel?: string;
  nearYouLabel?: string;
  storesEmptyTitle?: string;
  storesEmptyDescription?: string;
  distanceSuffix?: string;
  ratingIcon?: string;
  locationIcon?: string;
  storeCtaLabel?: string;
  storeCtaIcon?: string;
  showActionFilters?: boolean;
  showLocationSelector?: boolean;
  showTimingOnCard?: boolean;
  cardImageFit?: 'cover' | 'contain';
  cardImagePosition?: string;
}

export interface ServiceSelectionPageConfig {
  backLabel?: string;
  verifiedTitle?: string;
  verifiedSubtitle?: string;
  notVerifiedTitle?: string;
  experienceSuffix?: string;
  experienceSubtitle?: string;
  ratingSubtitle?: string;
  timingsLabel?: string;
  locationActionLabel?: string;
  phoneActionLabel?: string;
  bookNowLabel?: string;
  startsAtLabel?: string;
  discountIcon?: string;
  servicesEmptyTitle?: string;
  servicesEmptyDescription?: string;
  serviceImageFit?: 'cover' | 'contain';
  serviceImagePosition?: string;
}

export interface ServiceMarketplaceConfig {
  enabled: boolean;
  assetBasePath?: string;
  currency?: MarketplaceCurrency;
  routes: MarketplaceRoutes;
  selection?: MarketplaceSelection;
  storeSelectionPage?: StoreSelectionPageConfig;
  serviceSelectionPage?: ServiceSelectionPageConfig;
  actionCategories?: MarketplaceAction[];
  locations?: MarketplaceLocation[];
  stores?: MarketplaceStore[];
}

export interface MarketplaceTemplateConfig {
  serviceMarketplace?: ServiceMarketplaceConfig;
}
