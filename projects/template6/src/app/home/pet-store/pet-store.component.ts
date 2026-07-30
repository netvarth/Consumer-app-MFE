import { DOCUMENT } from '@angular/common';
import { Component, HostListener, Inject, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { PetStoreAction, PetStoreImageItem, PetStorePageConfig, PetStoreSection } from './pet-store.models';

@Component({
  selector: 'app-pet-store',
  templateUrl: './pet-store.component.html',
  styleUrls: ['./pet-store.component.scss']
})
export class PetStoreComponent implements OnInit, OnDestroy {
  config: PetStorePageConfig = {};
  actions: PetStoreAction[] = [];
  categories: PetStoreImageItem[] = [];
  brands: PetStoreImageItem[] = [];
  shops: PetStoreImageItem[] = [];
  offers: PetStoreImageItem[] = [];
  searchQuery = '';
  activeOfferIndex = 0;
  failedImages = new Set<string>();

  private autoplayTimer?: ReturnType<typeof setInterval>;
  private pointerStartX?: number;
  private interactionPaused = false;
  private reducedMotionQuery?: MediaQueryList;

  constructor(
    private readonly sharedService: SharedService,
    private readonly router: Router,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  ngOnInit(): void {
    const template = this.sharedService.getTemplateJSON?.() || {};
    this.config = template.petStorePage || {};
    if (this.config.enabled === false) {
      void this.router.navigate([this.sharedService.getRouteID()]);
      return;
    }

    this.actions = this.enabledSorted(this.config.hero?.actions);
    this.categories = this.enabledSorted(this.config.categories?.items);
    this.brands = this.enabledSorted(this.config.brands?.items);
    this.shops = this.enabledSorted(this.config.shops?.items);
    this.offers = this.enabledSorted(this.config.offers?.items);
    this.reducedMotionQuery = typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : undefined;
    this.reducedMotionQuery?.addEventListener?.('change', this.onMotionPreferenceChange);
    this.document.addEventListener('visibilitychange', this.onVisibilityChange);
    this.syncAutoplay();
  }

  ngOnDestroy(): void {
    this.stopAutoplay();
    this.reducedMotionQuery?.removeEventListener?.('change', this.onMotionPreferenceChange);
    this.document.removeEventListener('visibilitychange', this.onVisibilityChange);
  }

  get pageStyles(): Record<string, string> {
    const layout = this.config.layout;
    return {
      '--pet-store-max-width': `${layout?.contentMaxWidth || 654}px`,
      '--pet-store-background': layout?.pageBackground || '#fff',
      '--pet-store-shops-background': layout?.shopsSectionBackground || '#f7f7f7'
    };
  }

  get heroStyles(): Record<string, string> {
    const hero = this.config.hero;
    return {
      'background-image': hero?.backgroundImage ? `url(${hero.backgroundImage})` : 'none',
      'background-size': hero?.backgroundFit || 'cover',
      'background-position': hero?.backgroundPosition || 'top center'
    };
  }

  submitSearch(): void {
    const search = this.config.hero?.search;
    const query = this.searchQuery.trim();
    if (!query || !search?.searchRoute) return;
    void this.navigate(search.searchRoute, { [search.queryParameter || 'q']: query });
  }

  onSearchKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && this.config.hero?.search?.submitOnEnter !== false) {
      event.preventDefault();
      this.submitSearch();
    }
  }

  open(link?: string): void {
    if (link) void this.navigate(link);
  }

  imageFailed(item: PetStoreImageItem | PetStoreAction | string): void {
    const key = typeof item === 'string' ? item : ('id' in item ? item.id : item.key);
    this.failedImages.add(key);
    console.warn(`[PetStore] Image failed to load: ${key}`);
  }

  isImageFailed(item: PetStoreImageItem | PetStoreAction | string): boolean {
    const key = typeof item === 'string' ? item : ('id' in item ? item.id : item.key);
    return this.failedImages.has(key);
  }

  selectOffer(index: number, interacted = true): void {
    if (!this.offers.length) return;
    const loop = this.config.offers?.loop !== false;
    if (loop) {
      this.activeOfferIndex = (index + this.offers.length) % this.offers.length;
    } else {
      this.activeOfferIndex = Math.max(0, Math.min(index, this.offers.length - 1));
    }
    if (interacted && this.config.offers?.pauseOnInteraction) {
      this.interactionPaused = true;
      this.stopAutoplay();
    }
  }

  onPointerDown(event: PointerEvent): void {
    this.pointerStartX = event.clientX;
  }

  onPointerUp(event: PointerEvent): void {
    if (this.pointerStartX === undefined) return;
    const delta = event.clientX - this.pointerStartX;
    this.pointerStartX = undefined;
    if (Math.abs(delta) > 35) this.selectOffer(this.activeOfferIndex + (delta < 0 ? 1 : -1));
  }

  trackById(index: number, item: PetStoreImageItem | PetStoreAction): string | number {
    return ('id' in item ? item.id : item.key) || index;
  }

  emptyState(section: string): { title?: string; description?: string } {
    return this.config.emptyStates?.[section] || {};
  }

  sectionEnabled(section?: PetStoreSection): boolean {
    return !!section && section.enabled !== false;
  }

  private enabledSorted<T extends { enabled?: boolean; sortOrder?: number }>(items?: T[]): T[] {
    return Array.isArray(items)
      ? items.filter(item => item?.enabled !== false).slice().sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
      : [];
  }

  private navigate(link: string, queryParams?: Record<string, string>): Promise<boolean> {
    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return Promise.resolve(true);
    }
    const routeId = this.sharedService.getRouteID();
    const normalized = link.replace(/^\/+/, '').replace(/^capp\//, '');
    const segments = normalized === routeId || normalized.startsWith(`${routeId}/`)
      ? normalized.split('/')
      : [routeId, ...normalized.split('/')];
    return this.router.navigate(segments, queryParams ? { queryParams } : undefined);
  }

  private syncAutoplay(): void {
    this.stopAutoplay();
    const offers = this.config.offers;
    if (!offers || offers.enabled === false || !offers.autoPlay || this.offers.length < 2 || this.interactionPaused ||
      this.document.hidden || this.reducedMotionQuery?.matches) return;
    const interval = Math.max(1000, offers.autoPlayIntervalMs || 5000);
    this.autoplayTimer = setInterval(() => this.selectOffer(this.activeOfferIndex + 1, false), interval);
  }

  private stopAutoplay(): void {
    if (this.autoplayTimer) clearInterval(this.autoplayTimer);
    this.autoplayTimer = undefined;
  }

  private readonly onVisibilityChange = (): void => this.syncAutoplay();
  private readonly onMotionPreferenceChange = (): void => this.syncAutoplay();

  @HostListener('window:focus')
  onWindowFocus(): void { this.syncAutoplay(); }
}
