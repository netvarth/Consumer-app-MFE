import { Component, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { CommonModule } from '@angular/common';
import { of, Subject } from 'rxjs';
import { AccountService, AuthService, ConsumerService, GroupStorageService, LocalStorageService, OrderService, SharedService, SubscriptionService, ThemeService } from 'jconsumer-shared';
import { CrossTenantJourneyService, DocumentNavigationService } from '@consumer/cross-tenant';
import { normalizeHomeLink, normalizeTemplateHome } from './template-home.config';
import { TemplateHomeComponent } from './template-home.component';
import { TemplateHomeModule } from './template-home.module';
import { TemplateHomeState } from './template-home-state.service';
import { HomeEntryComponent } from '../root/home-entry.component';
import { HomeComponent } from '../home.component';

function fixtureConfig(): any {
  return {
    homePage: {
      context: 'subApp', schemaVersion: 1, enabled: true, type: 'store',
      layout: { activeFooterKey: 'shop' },
      store: {
        enabled: true,
        hero: { enabled: true, image: { src: '/assets/template-home/store-hero.png' },
          search: { enabled: true, placeholder: 'Search products', link: { route: ['items'] } } },
        categories: { enabled: true, title: 'Categories', items: [
          { key: 'food', enabled: true, label: 'Food', sortOrder: 1, link: { route: ['items'], queryParams: { categoryId: 123 } } }
        ] },
        bestSellers: { enabled: true, title: 'Best sellers', showPrices: true, items: [
          { key: 'product-1', enabled: true, name: 'A long product name that should wrap', price: 0, sortOrder: 1,
            link: { route: ['item', 'abc=+123'], queryParams: { itemEncid: 'abc=+123' } } },
          { key: 'product-2', enabled: true, name: 'Same product, second placement', price: 114.5, sortOrder: 1,
            link: { route: ['item', 'abc=+123'] } }
        ] }
      },
      service: { enabled: true,
        hero: { enabled: true, image: {}, action: { enabled: true, link: { route: ['appointment'], queryParams: { loc_id: 12, service_id: 34 } } } },
        services: { enabled: true, title: 'Services', showTitle: true, layout: { columnsMobile: 1, columnsDesktop: 1 }, cards: [
          { key: 'training', enabled: true, title: 'Pet training', description: 'Training description', link: { route: ['service', '34'] } }
        ] }
      }
    },
    navigation: { footer: { enabled: true, items: [
      { key: 'home', label: 'Home', enabled: true, sortOrder: 1, link: { url: '__PARENT_APP_HOME_URL__' } },
      { key: 'shop', label: 'Shop', enabled: true, sortOrder: 3, link: { route: [] } },
      { key: 'bookings', label: 'Bookings', enabled: true, sortOrder: 2, link: { route: ['bookings'] } },
      { key: 'aboutus', label: 'About us', enabled: true, sortOrder: 4, link: { route: ['about'] } },
      { key: 'support', label: 'Support', enabled: true, sortOrder: 5, link: { route: ['support'] } }
    ] } }
  };
}

describe('Template 7 sub-app configuration', () => {
  it('accepts a minimal template without any legacy content and chooses exactly one mode', () => {
    const input = fixtureConfig();
    const store = normalizeTemplateHome(input);
    expect(store.status).toBe('ready');
    expect(store.bestSellers.items.length).toBe(2);
    expect(store.services).toBeNull();
    input.homePage.type = 'service';
    const service = normalizeTemplateHome(input);
    expect(service.services.items.length).toBe(1);
    expect(service.bestSellers).toBeNull();
    expect(service.categories).toBeNull();
    expect(service.hero.search).toBeNull();
  });

  it('never treats disabled or malformed sub-app config as legacy', () => {
    for (const patch of [{ enabled: false }, { schemaVersion: 2 }, { type: 'other' }, { context: 'unknown' }]) {
      const input = fixtureConfig();
      Object.assign(input.homePage, patch);
      input.section1 = input.section2 = input.section3 = {};
      expect(normalizeTemplateHome(input).status).toBe(patch['enabled'] === false ? 'disabled' : 'unavailable');
    }
    expect(normalizeTemplateHome({ homePage: null }).status).toBe('unavailable');
    expect(normalizeTemplateHome({ section1: {}, section2: {}, section3: {} }).status).toBe('legacy');
    expect(normalizeTemplateHome(null).status).toBe('loading');
  });

  it('removes disabled/empty sections, including their headings and parent actions', () => {
    const input = fixtureConfig();
    input.homePage.store.hero.enabled = false;
    input.homePage.store.categories.items = null;
    input.homePage.store.bestSellers.items.forEach(item => item.enabled = false);
    const config = normalizeTemplateHome(input);
    expect(config.hero).toBeNull();
    expect(config.categories).toBeNull();
    expect(config.bestSellers).toBeNull();
    input.homePage.store.enabled = false;
    expect(normalizeTemplateHome(input).status).toBe('disabled');
  });

  it('sorts stably without mutation and preserves separate placements of the same SKU', () => {
    const input = fixtureConfig();
    const items = input.homePage.store.bestSellers.items;
    items.push({ ...items[0], key: 'first', sortOrder: 0 }, { ...items[0], enabled: false });
    const before = JSON.stringify(input);
    expect(normalizeTemplateHome(input).bestSellers.items.map(item => item.key)).toEqual(['first', 'product-1', 'product-2']);
    expect(JSON.stringify(input)).toBe(before);
    items.push({ ...items[0] });
    expect(normalizeTemplateHome(input).bestSellers.items.length).toBe(3);
  });

  it('formats zero and INR to two decimals, rejects malformed prices and honors tenant hidePrice', () => {
    const input = fixtureConfig();
    expect(normalizeTemplateHome(input).bestSellers.items.map(item => item.price)).toEqual(['₹0.00', '₹114.50']);
    expect(normalizeTemplateHome(input, true).bestSellers.items.every(item => item.price === '')).toBeTrue();
    for (const price of [-1, NaN, Infinity, undefined, null, '123']) {
      input.homePage.store.bestSellers.items[0].price = price;
      expect(normalizeTemplateHome(input).bestSellers.items[0].price).toBe('');
    }
  });

  it('rejects placeholders, invalid categories, incomplete bookings, unsupported routes and unsafe URLs', () => {
    for (const link of [
      { route: ['item', '__ENCID__'] }, { route: ['items?categoryId=1'] }, { route: ['/items'] },
      { route: ['items'], queryParams: { categoryId: 'food' } }, { route: ['items'], queryParams: { categoryId: '1.5' } },
      { route: ['appointment'], queryParams: { service_id: '12' } }, { route: ['pet-store'] },
      { route: ['..'] }, { url: 'javascript:alert(1)' }, { route: [], url: 'https://example.com' }
    ]) expect(normalizeHomeLink(link, 'footer', [], 'home')).toBeNull();
    expect(normalizeHomeLink({ route: ['items'], queryParams: { categoryId: 123 } }, 'category', [], 'food').queryParams['categoryId']).toBe('123');
  });

  it('applies bounded defaults to layout and rejects executable image sources', () => {
    const input = fixtureConfig();
    input.homePage.layout = { contentMaxWidth: -10, pageBackground: 'url(javascript:bad)' };
    input.homePage.store.hero.image = { src: 'javascript:bad', width: 0, fit: 'random' };
    const config = normalizeTemplateHome(input);
    expect(config.layout.contentMaxWidth).toBe(654);
    expect(config.layout.pageBackground).toBe('#FFFFFF');
    expect(config.hero.image.src).toBe('');
    expect(config.hero.image.width).toBe(393);
    expect(config.hero.image.fit).toBe('contain');
  });

  it('respects search, prices, service heading and action visibility separately', () => {
    const input = fixtureConfig();
    input.homePage.store.hero.search.enabled = false;
    input.homePage.store.bestSellers.showPrices = false;
    let config = normalizeTemplateHome(input);
    expect(config.hero.search).toBeNull();
    expect(config.bestSellers.items.every(item => !item.price)).toBeTrue();
    input.homePage.type = 'service';
    input.homePage.service.hero.action.enabled = false;
    input.homePage.service.services.showTitle = false;
    config = normalizeTemplateHome(input);
    expect(config.hero.action).toBeNull();
    expect(config.services.showTitle).toBeFalse();
    input.homePage.service.services.cards = null;
    expect(normalizeTemplateHome(input).services).toBeNull();
  });

  it('uses the enabled root footer item after Shop is renamed to Services', () => {
    const input = fixtureConfig();
    const rootItem = input.navigation.footer.items.find(item => item.key === 'shop');
    rootItem.key = 'services';
    rootItem.label = 'Services';
    const normalized = normalizeTemplateHome(input);
    expect(normalized.layout.activeFooterKey).toBe('services');
    expect(input.homePage.layout.activeFooterKey).toBe('shop');
    rootItem.enabled = false;
    expect(normalizeTemplateHome(input).layout.activeFooterKey).not.toBe('services');
  });

  it('accepts the explicit Chotaboss Home URL while rejecting a hostname inside route', () => {
    const input = fixtureConfig();
    const home = input.navigation.footer.items.find(item => item.key === 'home');
    home.link = { route: ['scale.jaldee.com/capp/chotaboss'], queryParams: {} };
    expect(normalizeTemplateHome(input).footer[0].link).toBeNull();
    home.link = { url: 'https://scale.jaldee.com/capp/chotaboss' };
    expect(normalizeTemplateHome(input).footer[0].link).toEqual(home.link);
  });

  it('uses configured homepage keys and infers any enabled root key when omitted', () => {
    const input = fixtureConfig();
    const root = input.navigation.footer.items.find(item => item.key === 'shop');
    root.key = 'catalogue';
    delete input.homePage.layout.activeFooterKey;
    expect(normalizeTemplateHome(input).layout.activeFooterKey).toBe('catalogue');
    input.homePage.layout.activeFooterKey = 'bookings';
    expect(normalizeTemplateHome(input).layout.activeFooterKey).toBe('bookings');
    input.navigation.footer.items.find(item => item.key === 'bookings').link = { route: ['unknown'] };
    expect(normalizeTemplateHome(input).layout.activeFooterKey).toBe('catalogue');
    root.enabled = false;
    expect(normalizeTemplateHome(input).layout.activeFooterKey).toBe('');
  });
});

describe('Template 7 renderer and tenant navigation', () => {
  let raw: any;
  let routeId: string;
  let account: any;
  let shared: any;
  let state: TemplateHomeState;
  let router: Router;
  let component: ComponentFixture<TemplateHomeComponent>;

  beforeEach(async () => {
    raw = fixtureConfig(); routeId = 'test-tenant'; account = { id: 1 };
    shared = { getTemplateJSON: () => raw, getRouteID: () => routeId, getAccountInfo: () => account,
      getAccountID: () => account.id, getAccountConfig: () => ({}) };
    await TestBed.configureTestingModule({
      imports: [TemplateHomeModule, RouterTestingModule],
      providers: [TemplateHomeState, { provide: SharedService, useValue: shared },
        { provide: CrossTenantJourneyService, useValue: { get: () => null } },
        { provide: DocumentNavigationService, useValue: { assign: jasmine.createSpy('assign') } }]
    }).compileComponents();
    state = TestBed.inject(TemplateHomeState); router = TestBed.inject(Router);
    state.sync();
    component = TestBed.createComponent(TemplateHomeComponent);
    component.componentRef.setInput('config', state.config);
    component.componentRef.setInput('revision', state.revision);
    component.detectChanges();
  });

  it('renders real category/detail hrefs with one tenant prefix', () => {
    expect(component.nativeElement.querySelector('.category').getAttribute('href')).toContain('/test-tenant/items?categoryId=123');
    const tree = state.tree(state.config.bestSellers.items[0].link);
    const parsed = router.parseUrl(router.serializeUrl(tree));
    expect(parsed.queryParams['itemEncid']).toBe('abc=+123');
    expect(parsed.root.children['primary'].segments.map(item => item.path)).toEqual(['test-tenant', 'item', 'abc=+123']);
  });

  it('submits a trimmed search with an encoded ampersand and ignores whitespace', () => {
    const navigate = spyOn(router, 'navigateByUrl').and.resolveTo(true);
    component.componentInstance.searchText = '   ';
    component.componentInstance.submitSearch();
    expect(navigate).not.toHaveBeenCalled();
    const input: HTMLInputElement = component.nativeElement.querySelector('input');
    input.value = ' food & treats ';
    input.dispatchEvent(new Event('input'));
    component.nativeElement.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
    expect(router.parseUrl(router.serializeUrl(navigate.calls.mostRecent().args[0] as any)).queryParams).toEqual({ query: 'food & treats' });
  });

  it('resets search and image failures on config reload and hides all empty sections', () => {
    component.componentInstance.searchText = 'old';
    component.componentInstance.imageFailed('hero');
    raw.homePage.store.hero.enabled = false;
    raw.homePage.store.categories.items = [];
    raw.homePage.store.bestSellers = null;
    state.sync();
    component.componentRef.setInput('config', state.config);
    component.componentRef.setInput('revision', state.revision);
    component.detectChanges();
    expect(component.componentInstance.searchText).toBe('');
    expect(component.componentInstance.failedImages.size).toBe(0);
    expect(component.nativeElement.querySelector('section')).toBeNull();
  });

  it('holds stale tenant data until a new configuration arrives', () => {
    routeId = 'next-tenant'; account = { id: 2 };
    state.sync();
    expect(state.config.status).toBe('loading');
    expect(state.tree({ route: ['items'] })).toBeNull();
    raw = fixtureConfig(); raw.homePage.type = 'service';
    state.sync();
    expect(state.config.type).toBe('service');
    expect(router.serializeUrl(state.tree(state.config.hero.action.link))).toBe('/next-tenant/appointment?loc_id=12&service_id=34');
  });

  it('selects only Shop at root and Bookings on appointment routes', () => {
    spyOnProperty(router, 'url', 'get').and.returnValue('/test-tenant');
    expect(state.activeFooterKey()).toBe('shop');
    (Object.getOwnPropertyDescriptor(router, 'url')!.get as jasmine.Spy).and.returnValue('/test-tenant/appointment?loc_id=12&service_id=34');
    expect(state.activeFooterKey()).toBe('bookings');
    expect(state.config.footer[0].link).toBeNull();
    raw.navigation.footer.enabled = false; state.sync();
    expect(state.config.footer).toEqual([]);
  });

  it('highlights Services for the renamed root and its service details', () => {
    raw.navigation.footer.items.find(item => item.key === 'shop').key = 'services';
    state.sync();
    const url = spyOnProperty(router, 'url', 'get').and.returnValue('/test-tenant');
    expect(state.activeFooterKey()).toBe('services');
    url.and.returnValue('/test-tenant/service/34');
    expect(state.activeFooterKey()).toBe('services');
    url.and.returnValue('/test-tenant/appointment?loc_id=12&service_id=34');
    expect(state.activeFooterKey()).toBe('bookings');
    url.and.returnValue('/test-tenant/about');
    expect(state.activeFooterKey()).toBe('aboutus');
  });

  it('supports a JSON-configured Items tab replacing Bookings while Shop remains the homepage selection', () => {
    const tab = raw.navigation.footer.items.find(item => item.key === 'bookings');
    Object.assign(tab, { key: 'inventory', label: 'Items', link: { route: ['items'] } });
    state.sync();
    const url = spyOnProperty(router, 'url', 'get').and.returnValue('/test-tenant/?source=home#top');
    expect(state.activeFooterKey()).toBe('shop');
    expect(router.serializeUrl(state.tree(state.config.footer.find(item => item.key === 'inventory').link))).toBe('/test-tenant/items');
    for (const path of ['items', 'items?categoryId=123', 'item/abc=+123', 'categories']) {
      url.and.returnValue(`/test-tenant/${path}`);
      expect(state.activeFooterKey()).withContext(path).toBe('inventory');
    }
    url.and.returnValue('/test-tenant/appointment?loc_id=12&service_id=34');
    expect(state.activeFooterKey()).toBe('');
    url.and.returnValue('/other-tenant/items');
    expect(state.activeFooterKey()).toBe('');
    tab.enabled = false; state.sync();
    url.and.returnValue('/test-tenant/items');
    expect(state.activeFooterKey()).toBe('shop');
  });

  it('selects booking tabs by their configured destinations even after renaming their keys', () => {
    raw.navigation.footer.items.find(item => item.key === 'bookings').key = 'my-visits';
    state.sync();
    const url = spyOnProperty(router, 'url', 'get').and.returnValue('/test-tenant/bookings');
    for (const path of ['bookings', 'bookings/history', 'booking/details', 'appointment?loc_id=12&service_id=34', 'checkin', 'dashboard']) {
      url.and.returnValue(`/test-tenant/${path}`);
      expect(state.activeFooterKey()).withContext(path).toBe('my-visits');
    }
    url.and.returnValue('/test-tenant/bookings-other');
    expect(state.activeFooterKey()).toBe('');
  });

  it('opens the configured parent URL with document navigation in the same tab', () => {
    raw.navigation.footer.items.find(item => item.key === 'home').link = { url: 'https://scale.jaldee.com/capp/chotaboss' };
    state.sync();
    const event = new MouseEvent('click', { button: 0, cancelable: true });
    state.followExternal(event, state.config.footer[0].link);
    expect(event.defaultPrevented).toBeTrue();
    expect(TestBed.inject(DocumentNavigationService).assign).toHaveBeenCalledOnceWith('https://scale.jaldee.com/capp/chotaboss');
  });

  it('keeps placeholders noninteractive and recovers image failures after reload', () => {
    raw.homePage.store.categories.items[0].link.queryParams.categoryId = '__CATEGORY_ID__';
    state.sync(); component.componentRef.setInput('config', state.config); component.detectChanges();
    const category = component.nativeElement.querySelector('.category');
    expect(category.hasAttribute('href')).toBeFalse();
    expect(category.getAttribute('aria-disabled')).toBe('true');
    component.componentInstance.imageFailed('hero'); component.detectChanges();
    expect(component.nativeElement.querySelector('.hero-fallback')).not.toBeNull();
    expect(component.nativeElement.querySelector('.hero-artwork')).toBeNull();
  });

  it('resolves parent Home only from the current provider journey', () => {
    const journey = TestBed.inject(CrossTenantJourneyService);
    const marker = { lastProviderUrl: window.location.origin + '/capp/test-tenant', returnTo: '/capp/parent-hub' };
    spyOn(journey, 'get').and.returnValue(marker as any);
    state.sync();
    expect(state.config.footer[0].link.url).toBe(window.location.origin + '/capp/parent-hub');
    marker.lastProviderUrl = window.location.origin + '/capp/someone-else'; state.sync();
    expect(state.config.footer[0].link).toBeNull();
  });
});

let legacyInstances = 0;
@Component({ selector: 'app-root', template: 'legacy' })
class LegacyHomeProbe { constructor() { legacyInstances++; } }

describe('Template 7 root isolation', () => {
  it('does not instantiate legacy code for ready, disabled, malformed or delayed sub-app data', async () => {
    legacyInstances = 0;
    const home = { config: normalizeTemplateHome(null), revision: 0 };
    await TestBed.configureTestingModule({
      imports: [CommonModule, TemplateHomeModule, RouterTestingModule],
      declarations: [HomeEntryComponent, LegacyHomeProbe],
      providers: [{ provide: TemplateHomeState, useValue: { ...home, tree: () => null } }]
    }).compileComponents();
    const state = TestBed.inject(TemplateHomeState);
    const entry = TestBed.createComponent(HomeEntryComponent);
    for (const input of [null, fixtureConfig(), { homePage: null }, { ...fixtureConfig(), homePage: { ...fixtureConfig().homePage, enabled: false } }]) {
      state.config = normalizeTemplateHome(input); entry.detectChanges();
      expect(legacyInstances).toBe(0);
    }
    state.config = normalizeTemplateHome({ section1: {}, section2: {}, section3: {} }); entry.detectChanges();
    expect(legacyInstances).toBe(1);
  });
});

describe('Template 7 existing shell with minimal sub-app config', () => {
  it('builds its footer independently of legacy sections and releases space when disabled', async () => {
    const raw = fixtureConfig();
    const shared = { getTemplateJSON: () => raw, getRouteID: () => 'test-tenant', getAccountID: () => 1,
      getAccountInfo: () => ({ location: [] }), getAccountConfig: () => ({}), getJson: value => value, getCDNPath: () => '' };
    await TestBed.configureTestingModule({
      declarations: [HomeComponent], imports: [CommonModule, RouterTestingModule], schemas: [NO_ERRORS_SCHEMA],
      providers: [
        { provide: SharedService, useValue: shared },
        { provide: AccountService, useValue: { getActiveLocation: () => null, getStores: () => [{}] } },
        { provide: AuthService, useValue: { goThroughLogin: () => Promise.resolve(false) } },
        { provide: LocalStorageService, useValue: { getitemfromLocalStorage: () => null, setitemonLocalStorage: () => {} } },
        { provide: GroupStorageService, useValue: { getitemFromGroupStorage: () => null } },
        { provide: SubscriptionService, useValue: { getMessage: () => new Subject() } },
        { provide: OrderService, useValue: { getRequireOTPForAddingToCart: () => of({ requireOTPForAddingToCart: false }) } },
        { provide: ThemeService, useValue: {} }, { provide: ConsumerService, useValue: {} },
        { provide: CrossTenantJourneyService, useValue: { get: () => null } },
        { provide: DocumentNavigationService, useValue: {} }
      ]
    }).compileComponents();
    const url = spyOnProperty(TestBed.inject(Router), 'url', 'get').and.returnValue('/test-tenant');
    const shell = TestBed.createComponent(HomeComponent);
    shell.detectChanges(); await shell.whenStable(); shell.detectChanges();
    expect(shell.nativeElement.querySelectorAll('.parent-footer-nav a').length).toBe(5);
    expect(shell.nativeElement.querySelectorAll('.active-nav').length).toBe(1);
    expect(shell.nativeElement.querySelector('.active-nav').textContent).toContain('Shop');
    expect(shell.nativeElement.querySelector('.active-nav').getAttribute('href')).toBe('/test-tenant');
    const rootTab = raw.navigation.footer.items.find(item => item.key === 'shop');
    Object.assign(rootTab, { key: 'services', label: 'Services' });
    raw.homePage.type = 'service';
    raw.homePage.layout.activeFooterKey = 'services';
    shell.detectChanges();
    expect(shell.nativeElement.querySelectorAll('.active-nav').length).toBe(1);
    expect(shell.nativeElement.querySelector('.active-nav').textContent).toContain('Services');
    expect(shell.nativeElement.querySelector('.active-nav').getAttribute('aria-current')).toBe('page');
    Object.assign(rootTab, { key: 'shop', label: 'Shop' });
    raw.homePage.type = 'store';
    raw.homePage.layout.activeFooterKey = 'shop';
    Object.assign(raw.navigation.footer.items.find(item => item.key === 'bookings'),
      { key: 'items', label: 'Items', link: { route: ['items'] } });
    url.and.returnValue('/test-tenant/items?categoryId=123');
    shell.detectChanges();
    expect(shell.nativeElement.querySelectorAll('.active-nav').length).toBe(1);
    expect(shell.nativeElement.querySelector('.active-nav').textContent).toContain('Items');
    expect(shell.nativeElement.querySelector('.active-nav').getAttribute('href')).toBe('/test-tenant/items');
    raw.navigation.footer.enabled = false; shell.detectChanges();
    expect(shell.nativeElement.querySelector('nav')).toBeNull();
    expect(shell.nativeElement.querySelector('.sub-app-footer-visible')).toBeNull();
  });
});
