import { Injectable, isDevMode } from '@angular/core';
import { Router, UrlTree } from '@angular/router';
import { SharedService } from 'jconsumer-shared';
import { CrossTenantJourneyService, DocumentNavigationService } from '@consumer/cross-tenant';
import { normalizeTemplateHome } from './template-home.config';
import { HomeFooterItem, HomeLink, TemplateHomeConfig } from './template-home.models';

/** A shell-scoped adapter for SharedService's synchronous template-loading lifecycle. */
@Injectable()
export class TemplateHomeState {
  config: TemplateHomeConfig = normalizeTemplateHome(null);
  routeId = '';
  revision = 0;
  private signature = '';
  private templateRef: unknown;
  private tenant = '';
  private staleTemplate: unknown;

  constructor(private shared: SharedService, private router: Router,
    private journey: CrossTenantJourneyService, private documentNavigation: DocumentNavigationService) {}

  /** Called by the shell before its children are checked; no second template request/cache. */
  sync(): boolean {
    const routeId = String(this.shared.getRouteID() || '').replace(/^\/+|\/+$/g, '');
    const template = this.shared.getTemplateJSON();
    const account = this.shared.getAccountInfo();
    const accountConfig = this.shared.getAccountConfig();
    const tenant = account ? `${routeId}:${this.shared.getAccountID()}` : '';
    // A route can change before the host finishes loading its new template.
    if (this.tenant && tenant !== this.tenant && template === this.templateRef) this.staleTemplate = template;
    if (template !== this.templateRef) this.staleTemplate = undefined;
    this.tenant = tenant;
    this.templateRef = template;
    const ready = !!tenant && !!routeId && template !== this.staleTemplate;
    const parentUrl = this.parentUrl(routeId);
    const signature = JSON.stringify([tenant, ready, template, accountConfig?.hidePrice, parentUrl]);
    if (signature === this.signature) return false;
    this.signature = signature;
    this.routeId = ready ? routeId : '';
    this.config = normalizeTemplateHome(ready ? template : null, !!accountConfig?.hidePrice, parentUrl);
    this.revision++;
    if (isDevMode() && this.config.diagnostics.length) {
      console.warn('[Template 7 home]', this.config.diagnostics.join('; '));
    }
    return true;
  }

  get isSubApp(): boolean { return !['legacy', 'loading'].includes(this.config.status); }

  get isRoot(): boolean {
    return !!this.routeId && this.path(this.router.url) === `/${this.routeId}`;
  }

  tree(link: HomeLink | null): UrlTree | null {
    if (!link?.route || !this.currentTenant()) return null;
    return this.router.createUrlTree(['/', ...this.routeId.split('/'), ...link.route], { queryParams: link.queryParams || {} });
  }

  followExternal(event: MouseEvent, link: HomeLink | null): void {
    if (!link?.url || !this.currentTenant()) { event.preventDefault(); return; }
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    this.documentNavigation.assign(link.url);
  }

  activeFooterKey(): string {
    const items = this.config.footer;
    if (this.isRoot) return items.find(item => item.key === this.config.layout.activeFooterKey)?.key || '';
    const path = this.path(this.router.url);
    const exact = items.find(item => {
      const tree = this.tree(item.link);
      return tree && this.path(this.router.serializeUrl(tree)) === path;
    });
    if (exact) return exact.key;
    const relative = path.startsWith(`/${this.routeId}/`) ? path.slice(this.routeId.length + 2) : '';
    const first = relative.split('/')[0];
    const key = ['booking', 'appointment', 'checkin', 'dashboard'].includes(first) ? 'bookings'
      : ['items', 'item', 'categories', 'service', 'order', 'orders'].includes(first) ? this.config.layout.activeFooterKey : '';
    return items.find(item => item.key === key)?.key || '';
  }

  trackFooter(_index: number, item: HomeFooterItem): string { return item.key; }

  private currentTenant(): boolean {
    return !!this.routeId && this.routeId === String(this.shared.getRouteID() || '').replace(/^\/+|\/+$/g, '')
      && !!this.shared.getAccountInfo() && this.tenant === `${this.routeId}:${this.shared.getAccountID()}`
      && this.templateRef === this.shared.getTemplateJSON();
  }

  private path(url: string): string { return url.split(/[?#]/)[0].replace(/\/$/, ''); }

  private parentUrl(routeId: string): string {
    const marker = this.journey.get();
    if (!marker || !routeId || typeof window === 'undefined') return '';
    const provider = new URL(marker.lastProviderUrl, window.location.origin);
    // Only use a journey belonging to the currently loaded provider.
    if (provider.pathname.replace(/\/$/, '') !== `/capp/${routeId}`) return '';
    return new URL(marker.returnTo, window.location.origin).href;
  }
}
