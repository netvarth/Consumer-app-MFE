# ChotaBoss Template 5 pre-implementation review

## Workspace and versions

- Workspace: `D:\UI Workspace\Consumer-app-MFE`
- Angular CLI/build packages: 18.2.x
- Angular runtime: 18.2.x
- TypeScript: 5.5.x
- RxJS: 7.8.x
- Angular Material/CDK: 18.2.x
- Native Federation: 18.2.2
- `jconsumer-shared`: 1.2.13
- PrimeNG: 17.18.11
- Lockfile: root `package-lock.json`; no dependency changes are planned.

## Build and serve

- Production build: `npm run ng -- build template5`
- Development build: `npm run ng -- build template5 --configuration development`
- Standalone serve: `npm run ng -- serve template5 --configuration development` (port 4505 through `serve-original`; the federation wrapper may choose an available port).
- Unit tests: `npm run ng -- test template5 --watch=false --browsers=ChromeHeadless`

## Federation and host contract

- Angular project name: `template5`
- Federation name: `template5`
- Public exposure: `./Home`
- Expected exposure path: `projects/template5/src/app/home/home.module.ts`
- Exposed symbol: `HomeModule`
- Existing contract defect: the configured exposure path was missing before implementation. It will be created without changing the federation name or exposure key.
- Standalone bootstrap remains `AppComponent`; local routes lazy-load the same `HomeModule` used by the host.

## Reuse audit

- Template 2: order routes (`cart`, `checkout`, `status/:id`, `bill/:id`), `OrderService`, `ConsumerService`, shared authentication/session/error/toast patterns, and environment-driven service URLs.
- Template 4: exposed `HomeModule`, child-route organization, `BookingService` orchestration, account/config bootstrap, `AccountService`, `AuthService`, `GroupStorageService`, `LocalStorageService`, and fixed custom-app shell conventions.
- Template 5 legacy `business/**`: appointment, confirmation, cart, checkout, order details, profile, authentication, and shared account flows remain available as reference; they are not used as the visual source of truth.

## Screenshot-to-screen summary

All 15 supplied PNGs in `projects/template5/ChotaBoss` were inspected at their 4x export scale and at their inferred CSS scale. Detailed route/state mappings live in `SCREEN_MAPPING.md`.

## Route and flow map

```text
home
  -> locations -> provider -> book -> booking/success -> booking/details
  -> shop -> search
          -> store -> checkout -> order/success
bookings -> booking/details
about | support
```

Deep-link routes preserve state through a project-scoped storage adapter, with deterministic fixture fallbacks for visual/test states.

## Planned component/module structure

- `HomeModule`: federation entry and child routes.
- `ChotaBossStateService`: selected location/provider/service, booking, catalogue, cart, payment, and order state.
- Reusable `AppHeader`, `BottomNav`, `ProductCard`, and `QuantityStepper` components.
- Focused page components for home, discovery, provider, slot selection, booking success/details, shop, search, store, checkout, and order success.
- Project-scoped design tokens and responsive styles under `src/app/chotaboss`.

## API/data mapping

The repository contains reusable account, booking, consumer, order, storage, currency, payment, and error services. However, the supplied material does not include a ChotaBoss account ID, provider/store IDs, test consumer, or a sandbox payment configuration. Therefore the initial ChotaBoss screen data is isolated behind `ChotaBossStateService`; it performs no production mutation. The exact replacement points and existing service candidates are recorded in `API_DATA_MAPPING.md` and `MISSING_API_AND_URL_REQUIREMENTS.md`.

## Asset strategy

- Crop only image content permitted by the prompt (logos, providers, products, illustrations, category/brand/promotional artwork).
- Never use a complete screenshot or a screenshot-sized composite as a page background.
- Store semantic, optimized assets under `projects/template5/public/chotaboss`.
- Use real HTML controls/text/icons for all interactive UI.

## Testing strategy

- Karma/Jasmine unit coverage for cart totals, quantity bounds, slot validation, slider threshold, and duplicate-submission prevention.
- Route-level interaction verification in a local browser.
- Mobile visual checks at 393x852/390x844/414x896 and responsive checks at 320x568, 768x1024, and 1024x768.
- Browser console and missing-asset checks on key routes.
- There is no existing Playwright/Cypress dependency in this workspace; no dependency will be added without changing the approved lockfile. Browser-driven QA will be documented separately from automated Karma coverage.

## Assumptions

- Screenshot dates, prices, names, and order/booking IDs are deterministic visual fixtures until the owning account configuration is provided.
- `₹` values use integer rupees because the existing visible product values are whole rupees; calculation helpers avoid floating-point accumulation.
- About Us and Support use lightweight ChotaBoss pages because no dedicated reference screens were supplied.
- Phone/map/share actions use safe browser capabilities only when supported and otherwise expose accessible feedback.
- Slide-to-pay is a true pointer/touch slider with a keyboard activation equivalent; it completes only against the non-mutating adapter.

## Blocking questions

No blocking questions remain for a complete, safe frontend implementation and visual verification. Live API submission remains intentionally disabled until the account/provider/store identifiers, authentication test setup, and sandbox payment contract listed in `MISSING_API_AND_URL_REQUIREMENTS.md` are supplied.
