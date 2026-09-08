import { HomeCard, HomeImage, HomeLink, HomePosition, HomeSection, TemplateHomeConfig } from './template-home.models';

type JsonObject = Record<string, any>;
const object = (value: unknown): JsonObject => value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
const label = (value: unknown): string => typeof value === 'string' ? value.trim() : '';
const enabled = (value: unknown): boolean => object(value)['enabled'] === true;
const placeholder = (value: string): boolean => /__[^]*__/.test(value);
const numericId = (value: string): boolean => /^\d+$/.test(value) && Number.isSafeInteger(Number(value)) && Number(value) > 0;
const segment = (value: unknown): value is string => typeof value === 'string' && /^[a-z\d_+=.-]+$/i.test(value)
  && value !== '.' && value !== '..' && !placeholder(value);
const bounded = (value: unknown, fallback: number, min: number, max: number): number =>
  typeof value === 'number' && Number.isFinite(value) && value >= min && value <= max ? value : fallback;

export function safeHomeUrl(value: unknown): string {
  const src = label(value);
  if (!src || placeholder(src) || /[\s\\\u0000-\u001f]/.test(src)) return '';
  try {
    const url = new URL(src);
    return /^https?:$/.test(url.protocol) && !url.username && !url.password ? url.href : '';
  } catch { return ''; }
}

function image(value: unknown, width = 1, height = 1): HomeImage {
  const data = object(value);
  const source = label(data['src']);
  // Relative assets resolve against the host's base href (/capp/ in production).
  const local = /^(?:\/)?assets\/[a-z\d_./-]+$/i.test(source) && !source.split('/').includes('..');
  return {
    src: local ? source.replace(/^\//, '') : safeHomeUrl(source),
    alt: label(data['alt']), fit: data['fit'] === 'cover' ? 'cover' : 'contain',
    width: bounded(data['width'], width, 1, 10000), height: bounded(data['height'], height, 1, 10000)
  };
}

function position(value: unknown, defaults: number[]): HomePosition {
  const data = object(value);
  const left = bounded(data['leftPercent'], defaults[0], 0, 100);
  const top = bounded(data['topPercent'], defaults[1], 0, 100);
  return {
    leftPercent: left, topPercent: top,
    widthPercent: Math.min(100 - left, bounded(data['widthPercent'], defaults[2], 1, 100)),
    heightPercent: Math.min(100 - top, bounded(data['heightPercent'], defaults[3], 1, 100))
  };
}

/** Only routes verified in Template 7's HomeModule are accepted. */
export function normalizeHomeLink(value: unknown, purpose: 'category' | 'product' | 'service' | 'search' | 'footer',
  diagnostics: string[], key: string, parentUrl = ''): HomeLink | null {
  const data = object(value);
  const invalid = (): null => { diagnostics.push(`${key}: unresolved or unsupported navigation target`); return null; };
  if ('url' in data) {
    if (purpose !== 'footer' || key !== 'home' || 'route' in data) return invalid();
    const url = safeHomeUrl(data['url'] === '__PARENT_APP_HOME_URL__' ? parentUrl : data['url']);
    return url ? { url } : invalid();
  }
  if (!Array.isArray(data['route']) || !data['route'].every(segment)) return invalid();
  const route: string[] = [...data['route']];
  if (data['queryParams'] != null && (typeof data['queryParams'] !== 'object' || Array.isArray(data['queryParams']))) return invalid();
  const rawQuery = object(data['queryParams']);
  const queryParams: Record<string, string> = {};
  for (const [name, val] of Object.entries(rawQuery)) {
    if (!/^[a-z][a-z\d_]*$/i.test(name) || !['string', 'number', 'boolean'].includes(typeof val)
      || placeholder(String(val)) || (typeof val === 'number' && !Number.isFinite(val))) return invalid();
    queryParams[name] = String(val);
  }
  const head = route[0] || '';
  if (purpose === 'category' && (head !== 'items' || !numericId(queryParams['categoryId'] || ''))) return invalid();
  if (purpose === 'search' && (head !== 'items' || Object.keys(queryParams).some(name => name !== 'query'))) return invalid();
  if (purpose === 'product' && head !== 'item') return invalid();
  if (purpose === 'service' && !['service', 'appointment'].includes(head)) return invalid();
  if (head === 'item') {
    if (route.length !== 2 || (queryParams['itemEncid'] && queryParams['itemEncid'] !== route[1])) return invalid();
  } else if (head === 'service') {
    if (route.length !== 2 || !numericId(route[1])) return invalid();
  } else {
    const singleRoutes = ['items', 'categories', 'appointment', 'bookings', 'orders', 'about', 'support', 'profile', 'faq'];
    if (route.length > 1 || (route.length === 1 && !singleRoutes.includes(head))) return invalid();
    if (head === 'appointment' && (!numericId(queryParams['loc_id'] || '') || !numericId(queryParams['service_id'] || ''))) return invalid();
    if (head === 'items' && queryParams['categoryId'] && !numericId(queryParams['categoryId'])) return invalid();
  }
  const allowedQuery = head === 'items' ? ['query', 'categoryId'] : head === 'item' ? ['itemEncid']
    : head === 'appointment' ? ['loc_id', 'service_id'] : [];
  if (Object.keys(queryParams).some(name => !allowedQuery.includes(name))) return invalid();
  return { route, queryParams };
}

function sorted(value: unknown, diagnostics: string[]): JsonObject[] {
  const keys = new Set<string>();
  return (Array.isArray(value) ? value : []).filter(enabled).map((entry, index) => ({ entry: object(entry), index }))
    .filter(({ entry }) => {
      const key = label(entry['key']);
      if (!key || keys.has(key)) { diagnostics.push('Skipped item with missing or duplicate key'); return false; }
      keys.add(key); return true;
    })
    .sort((a, b) => bounded(a.entry['sortOrder'], 0, -1e6, 1e6) - bounded(b.entry['sortOrder'], 0, -1e6, 1e6) || a.index - b.index)
    .map(({ entry }) => entry);
}

export function normalizeTemplateHome(template: unknown, hidePrice = false, parentUrl = ''): TemplateHomeConfig {
  const data = object(template);
  const home = object(data['homePage']);
  const diagnostics: string[] = [];
  const config: TemplateHomeConfig = {
    status: 'loading', type: home['type'] === 'service' ? 'service' : 'store',
    layout: { contentMaxWidth: 654, pageBackground: '#FFFFFF', activeFooterKey: '' },
    hero: null, categories: null, bestSellers: null, services: null, footer: [], diagnostics
  };
  if (!Object.keys(data).length) return config;
  if (!('homePage' in data)) {
    config.status = data['section1'] && data['section2'] && data['section3'] ? 'legacy' : 'unavailable';
    if (config.status === 'unavailable') diagnostics.push('Missing homePage configuration');
    return config;
  }
  const layout = object(home['layout']);
  config.layout = {
    contentMaxWidth: bounded(layout['contentMaxWidth'], 654, 320, 1200),
    pageBackground: /^#[a-f\d]{6}$/i.test(label(layout['pageBackground'])) ? layout['pageBackground'] : '#FFFFFF',
    activeFooterKey: label(layout['activeFooterKey'])
  };
  const footer = object(object(data['navigation'])['footer']);
  if (enabled(footer)) config.footer = sorted(footer['items'], diagnostics).map(item => ({
    key: label(item['key']), label: label(item['label']),
    icon: /^fa-[a-z-]+$/.test(label(item['icon'])) ? item['icon'] : 'fa-circle-o',
    link: normalizeHomeLink(item['link'], 'footer', diagnostics, label(item['key']), parentUrl)
  }));
  if (!config.footer.some(item => item.key === config.layout.activeFooterKey && item.link?.route)) {
    // Infer the home selection from JSON when the explicit key is absent or invalid.
    const rootItem = config.footer.find(item => item.link?.route?.length === 0);
    if (config.layout.activeFooterKey) {
      diagnostics.push(`activeFooterKey "${config.layout.activeFooterKey}" has no enabled internal link${rootItem ? `; using root item "${rootItem.key}"` : ''}`);
    }
    config.layout.activeFooterKey = rootItem?.key || '';
  }
  if (home['context'] !== 'subApp' || home['schemaVersion'] !== 1 || !['store', 'service'].includes(home['type'])
    || typeof home['enabled'] !== 'boolean') {
    config.status = 'unavailable'; diagnostics.push('Expected homePage context subApp, schemaVersion 1, type store/service and boolean enabled');
    return config;
  }
  const mode = object(home[config.type]);
  if (home['enabled'] === false || mode['enabled'] === false) { config.status = 'disabled'; return config; }
  if (!enabled(mode)) { config.status = 'unavailable'; diagnostics.push('Selected homePage mode is missing or malformed'); return config; }
  config.status = 'ready';
  const hero = object(mode['hero']);
  if (enabled(hero)) {
    config.hero = { image: image(hero['image'], config.type === 'store' ? 393 : 644, config.type === 'store' ? 305 : 1188), search: null, action: null };
    const search = object(hero['search']);
    if (config.type === 'store' && enabled(search)) config.hero.search = {
      placeholder: label(search['placeholder']), ariaLabel: label(search['ariaLabel']) || 'Search products',
      position: position(search['position'], [4.84, 4.59, 90.32, 18.07]),
      link: normalizeHomeLink(search['link'], 'search', diagnostics, 'search')
    };
    const action = object(hero['action']);
    if (config.type === 'service' && enabled(action)) config.hero.action = {
      ariaLabel: label(action['ariaLabel']) || 'Book appointment', position: position(action['hotspot'], [18.3, 24.8, 63, 6.4]),
      link: normalizeHomeLink(action['link'], 'service', diagnostics, 'hero action')
    };
  }
  const section = (raw: unknown, purpose: 'category' | 'product' | 'service'): HomeSection | null => {
    const value = object(raw);
    if (!enabled(value)) return null;
    const items: HomeCard[] = sorted(value[purpose === 'service' ? 'cards' : 'items'], diagnostics).map(item => {
      const amount = item['price'];
      const price = purpose === 'product' && value['showPrices'] === true && !hidePrice
        && typeof amount === 'number' && Number.isFinite(amount) && amount >= 0
        ? new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount) : '';
      return {
        key: label(item['key']), label: label(item[purpose === 'category' ? 'label' : purpose === 'product' ? 'name' : 'title']),
        description: label(item['description']), price,
        // Complete service-card artwork uses its natural ratio once loaded. These
        // dimensions reserve a wide placeholder when the export omits dimensions.
        image: image(item['image'], purpose === 'service' ? 528 : 1, purpose === 'service' ? 250 : 1),
        link: normalizeHomeLink(item['link'], purpose, diagnostics, label(item['key']))
      };
    });
    return items.length ? { title: label(value['title']), items } : null;
  };
  if (config.type === 'store') {
    config.categories = section(mode['categories'], 'category');
    config.bestSellers = section(mode['bestSellers'], 'product');
  } else {
    const services = object(mode['services']);
    const normalized = section(services, 'service');
    if (normalized) config.services = {
      ...normalized, showTitle: services['showTitle'] !== false && services['coverContainsTitle'] !== true,
      coverImage: services['coverImage'] ? image(services['coverImage'], 644, 610) : null
    };
  }
  return config;
}
