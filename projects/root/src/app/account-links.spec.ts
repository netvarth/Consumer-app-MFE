import '../../../cross-tenant/src/lib/provider-link.spec';
import { CrossTenantJourneyService, validatedProviderLink } from '@consumer/cross-tenant';
import { normalizeHomeLink } from '../../../template7/src/app/home/template-home/template-home.config';

describe('Account links under the application base', () => {
  let base: HTMLBaseElement;
  let originalHref: string | null;
  let created: boolean;

  beforeEach(() => {
    base = document.querySelector('base')!;
    created = !base;
    if (!base) { base = document.createElement('base'); document.head.prepend(base); }
    originalHref = base.getAttribute('href');
    sessionStorage.clear();
  });

  afterEach(() => {
    if (created) base.remove();
    else if (originalHref === null) base.removeAttribute('href');
    else base.setAttribute('href', originalHref);
    sessionStorage.clear();
  });

  for (const basePath of ['/', '/capp/', '/apps/consumer/']) {
    it(`keeps provider, Home and journey links under ${basePath}`, () => {
      base.setAttribute('href', basePath);
      const provider = validatedProviderLink('/sugarandspice')!;
      const home = normalizeHomeLink({ url: '/chotaboss' }, 'footer', [], 'home')!;
      expect(provider).toBe(`${window.location.origin}${basePath}sugarandspice`);
      expect(home.url).toBe(`${window.location.origin}${basePath}chotaboss`);
      const journey = new CrossTenantJourneyService();
      journey.start('chotaboss', home.url!, provider);
      expect(journey.get()?.returnTo).toBe(home.url);
    });
  }
});
