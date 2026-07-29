import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AccountService, LocalStorageService, SharedService } from 'jconsumer-shared';
import { StoreHeaderConfig } from './store-header.component';

interface PetStoreCard {
  title?: string;
  name?: string;
  image?: string;
  imageUrl?: string;
  link?: string;
  query?: string;
  encId?: string;
  type?: string;
  rating?: number;
  reviews?: number;
  location?: string;
  verified?: boolean;
  imageAlt?: string;
  ctaLabel?: string;
}

interface PetStoreNavItem {
  key: string;
  label: string;
  icon: string;
  link?: string;
}

@Component({
  selector: 'app-pet-store',
  templateUrl: './pet-store.component.html',
  styleUrls: ['./pet-store.component.scss']
})
export class PetStoreComponent implements OnInit {
  title = 'Pet Store';
  subtitle = 'Fast Delivery from Your Nearby Pet Store';
  searchPlaceholder = 'Search for “Skin Medicine”';
  searchQuery = '';
  headerConfig: StoreHeaderConfig = {};
  brandsTitle = 'Brands';
  shopsTitle = 'Shops';
  seeAllLabel = 'See all »';
  categoriesSeeAllLabel = '';
  categoriesSeeAllLink = '';
  brandsSeeAllLabel = '';
  brandsSeeAllLink = '';
  shopsSeeAllLabel = '';
  shopsSeeAllLink = '';
  viewStoreLabel = 'View Store';
  verifiedLabel = 'Verified store';
  defaultShopType = 'Pet Store';
  defaultLocation = 'Thrissur';
  assetBasePath = '';
  categories: PetStoreCard[] = [];
  brands: PetStoreCard[] = [];
  shops: PetStoreCard[] = [];
  promotion: any = {};
  navigation: PetStoreNavItem[] = [];

  private readonly categoryFallbacks: PetStoreCard[] = [
    { name: 'Pharmacy', image: 'shop-pharmacy.jpg', query: 'medicine' },
    { name: 'Accessories', image: 'shop-accessories.jpg', query: 'accessories' },
    { name: 'Foods', image: 'shop-foods.jpg', query: 'pet food' }
  ];
  private readonly brandFallbacks: PetStoreCard[] = [
    { name: 'Pedigree', image: 'brand-pedigree.png', query: 'Pedigree' },
    { name: 'Royal Canin', image: 'brand-royal-canin.png', query: 'Royal Canin' },
    { name: 'Farmina', image: 'brand-farmina.png', query: 'Farmina' },
    { name: 'Drools', image: 'brand-drools.png', query: 'Drools' }
  ];
  private readonly shopFallbacks: PetStoreCard[] = [
    { name: 'Cadas Pet Hub', image: 'shop-cadas.png', type: 'Pet Store', rating: 4.8, reviews: 175, location: 'Thrissur', verified: true },
    { name: 'SN PET WORLD', image: 'shop-sn.png', type: 'Pet Store', rating: 4.8, reviews: 175, location: 'Thrissur', verified: true }
  ];

  constructor(
    private readonly sharedService: SharedService,
    private readonly accountService: AccountService,
    private readonly localStorageService: LocalStorageService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    const template = this.sharedService.getTemplateJSON() || {};
    const config = template.petStore || template.petStorePage || template.shopPage || {};
    this.assetBasePath = this.ensureTrailingSlash(
      config.assetBasePath || template.assetBasePath || new URL('./pet-store/', import.meta.url).href
    );
    this.title = config.title || this.title;
    this.subtitle = config.subtitle || this.subtitle;
    this.searchPlaceholder = config.searchPlaceholder || this.searchPlaceholder;
    const header = config.header || {};
    this.headerConfig = {
      ...header,
      logo: header.logo || template.logo || '',
      logoAlt: header.logoAlt || `${this.title} logo`,
      searchPlaceholder: header.searchPlaceholder || this.searchPlaceholder,
      backgroundImage: this.resolveAsset(header.backgroundImage || header.backgroundImageUrl || '')
    };
    this.brandsTitle = config.brandsTitle || this.brandsTitle;
    this.shopsTitle = config.shopsTitle || this.shopsTitle;
    this.seeAllLabel = config.seeAllLabel || this.seeAllLabel;
    this.categoriesSeeAllLabel = config.categoriesSeeAllLabel || this.seeAllLabel;
    this.categoriesSeeAllLink = config.categoriesSeeAllLink || '';
    this.brandsSeeAllLabel = config.brandsSeeAllLabel || this.seeAllLabel;
    this.brandsSeeAllLink = config.brandsSeeAllLink || '';
    this.shopsSeeAllLabel = config.shopsSeeAllLabel || this.seeAllLabel;
    this.shopsSeeAllLink = config.shopsSeeAllLink || '';
    this.viewStoreLabel = config.viewStoreLabel || this.viewStoreLabel;
    this.verifiedLabel = config.verifiedLabel || this.verifiedLabel;
    this.defaultShopType = config.defaultShopType || this.defaultShopType;
    this.defaultLocation = config.defaultLocation || this.defaultLocation;
    this.categories = this.normalizeCards(config.categories, this.categoryFallbacks);
    this.brands = this.normalizeCards(config.brands, this.brandFallbacks);
    this.shops = this.buildShops(config.shops);
    this.promotion = {
      title: 'Christmas offer 25% OFF',
      description: 'On all pet food recipes today',
      buttonLabel: 'Buy Now',
      image: this.resolveAsset('promo-dog.jpg'),
      query: 'pet food',
      ...(config.promotion || {})
    };
    this.promotion.image = this.resolveAsset(this.promotion.image || this.promotion.imageUrl);
    this.navigation = this.buildNavigation(config.navigation || config.bottomNavigation, template, config.navigationItem);
  }

  asset(path: string): string { return this.resolveAsset(path); }

  submitSearch(): void {
    this.openItems(this.searchQuery.trim());
  }

  openHeaderAction(link: string): void {
    if (link) {
      this.openLink(link);
    }
  }

  openSection(link: string): void {
    if (link) {
      this.openLink(link);
      return;
    }
    this.openItems('');
  }
  openCard(card: PetStoreCard): void {
    if (card.link) {
      this.openLink(card.link);
      return;
    }
    this.openItems(card.query || card.name || card.title || '');
  }

  openShop(shop: PetStoreCard): void {
    if (shop.encId) {
      this.accountService.setActiveStore(shop.encId);
      this.localStorageService.setitemonLocalStorage('storeEncId', shop.encId);
    }
    if (shop.link) {
      this.openLink(shop.link);
      return;
    }
    this.openItems(shop.query || '');
  }

  openPromotion(): void {
    if (this.promotion.link) {
      this.openLink(this.promotion.link);
      return;
    }
    this.openItems(this.promotion.query || 'pet food');
  }

  navigate(item: PetStoreNavItem): void {
    if (item.link) {
      this.openLink(item.link);
      return;
    }
    const routeId = this.sharedService.getRouteID();
    const routeMap: Record<string, string[]> = {
      home: [routeId],
      bookings: [routeId, 'bookings'],
      shop: [routeId, 'pet-store'],
      about: [routeId, 'about'],
      support: [routeId, 'support']
    };
    void this.router.navigate(routeMap[item.key] || [routeId]);
  }

  trackByIndex(index: number): number { return index; }

  private buildShops(configuredShops: PetStoreCard[] | undefined): PetStoreCard[] {
    if (Array.isArray(configuredShops) && configuredShops.length) {
      return this.normalizeCards(configuredShops, []);
    }
    const stores = this.accountService.getStores?.() || [];
    if (!stores.length) {
      return this.normalizeCards(this.shopFallbacks, []);
    }
    return stores.slice(0, 6).map((store: any, index: number) => ({
      name: store.name || store.storeName || this.shopFallbacks[index % 2].name,
      image: this.resolveAsset(store.logo?.url || store.logo || this.shopFallbacks[index % 2].image),
      type: store.type || 'Pet Store',
      rating: Number(store.rating || 4.8),
      reviews: Number(store.reviewCount || 175),
      location: store.location?.place || store.place || 'Thrissur',
      verified: store.verified !== false,
      encId: store.encId
    }));
  }

  private buildNavigation(configured: any, template: any, shopItem: any): PetStoreNavItem[] {
    const sections = [template.section1, template.section3, shopItem, template.section2, template.section4].filter(Boolean);
    const source = Array.isArray(configured) && configured.length ? configured : sections;
    return source.map((item: any, index: number) => ({
      key: item.key || (index === 2 ? 'shop' : `nav-${index}`),
      label: item.label || item.title || 'Page',
      icon: this.resolveAsset(item.icon || item.iconImage || item['icon-image'] || ''),
      link: item.link
    }));
  }

  private normalizeCards(cards: PetStoreCard[] | undefined, fallback: PetStoreCard[]): PetStoreCard[] {
    const list = Array.isArray(cards) && cards.length ? cards : fallback;
    return list.map((card) => ({ ...card, image: this.resolveAsset(card.image || card.imageUrl || '') }));
  }

  private openItems(query: string): void {
    const extras = query ? { queryParams: { query } } : undefined;
    void this.router.navigate([this.sharedService.getRouteID(), 'items'], extras);
  }

  private openLink(link: string): void {
    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener');
      return;
    }
    const routeId = this.sharedService.getRouteID();
    const normalized = link.replace(/^\/+/, '').replace(/^capp\//, '');
    const target = normalized.startsWith(`${routeId}/`) || normalized === routeId ? normalized : `${routeId}/${normalized}`;
    void this.router.navigateByUrl(target);
  }

  private resolveAsset(path: string): string {
    if (!path || /^(https?:)?\/\//i.test(path) || path.startsWith('data:') || path.startsWith('blob:')) return path || '';
    return `${this.assetBasePath}${path.replace(/^\.\//, '').replace(/^\//, '')}`;
  }

  private ensureTrailingSlash(path: string): string { return path && !path.endsWith('/') ? `${path}/` : path; }
}
