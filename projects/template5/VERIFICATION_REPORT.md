# ChotaBoss Template 5 verification report

Verification date: 28 July 2026 (Asia/Calcutta)

## Commands and results

| Command | Result |
|---|---|
| `npm run ng -- run template5:esbuild:development` | Passed. Development application bundle generated in `dist/template5`. |
| `npm run ng -- build template5` | Passed. Native-federation production artefacts generated; initial bundle 97.83 kB raw and exposed `HomeModule` chunk 72.64 kB raw. |
| `npm run ng -- serve template5` | Passed. Federation dev server served at `http://localhost:4505/`. |
| Headless Chrome DOM smoke check on `/home` | Passed. Angular 18.2.13 bootstrapped, `cb-home-page` rendered, and expected `Healthy Pets. Happy Pets!`/`Book Doctor` content was present. |
| Playwright host integration check on `http://localhost:4300/capp/locations/home` | Passed. Template 5 loaded through the root/template/home federation chain with compiled ChotaBoss styles, mounted links, and zero browser console errors. |
| Host asset/network check | Passed. `Home.js` and all requested ChotaBoss home/shop images loaded from `http://localhost:4505/` with HTTP 200 responses. |
| `npm run ng -- test template5 --watch=false --browsers=ChromeHeadless` | Blocked before execution by pre-existing legacy Template 5 spec imports; details below. |

## Build and federation

- Project: `template5`
- Federation remote name: `template5`
- Exposure verified in build output: `./Home` -> `HomeModule`
- Exposure path restored: `projects/template5/src/app/home/home.module.ts`
- No dependency or root workspace configuration changes were introduced.
- Native-federation build emits existing warnings for `font-awesome` and `primeicons` having no shareable entry point; these packages are not used by the new ChotaBoss implementation.

## Runtime and route checks

The federation server and standalone shell were exercised through Chrome at:

- `/home`
- `/locations`
- `/store/pedigree`

The full root-host mount was also exercised at `/capp/locations/home` and `/capp/locations/shop`. Navigation remained below `/capp/locations`, the injected header style computed to the expected orange treatment, and image URLs resolved against the Template 5 remote rather than the root host origin.

The rendered DOM contained the expected Angular components and semantic controls. Development-only console entries were limited to Vite connection messages and Angular's development-mode notice; no application exception or unresolved module error remained after Native Federation initialization was restored.

Connected routes compiled in the same module:

- `/home`
- `/locations`
- `/provider/:id`
- `/book/:id`
- `/booking/success`
- `/booking/details`
- `/bookings`
- `/shop`
- `/search`
- `/store/:id`
- `/checkout`
- `/order/success`
- `/about`
- `/support`

## Visual verification

All 15 source references were inspected at their inferred 4x-to-CSS scale before implementation. Headless Chrome captures were reviewed for the home, near-you location, and empty-cart store states at nominal 393x852 and 390x844 browser windows. The captures confirmed the orange/white hierarchy, header and fixed navigation, mobile cards, location illustration/provider transition, store hero/profile, category chips, and two-column product catalogue.

The Windows host applies display scaling to command-line Chrome captures, so those captures are not accepted as automated one-to-one Playwright pixel diffs. Stable automated snapshots for all 15 screens were not generated because this workspace has no Playwright/Cypress dependency and adding one would change the root lockfile. Consequently, visual matching is implementation-reviewed rather than an automated regression pass.

Responsive rules are present for 320px-class phones, standard 390–430px phones, 600px layouts, and 768–1024px tablets. Global image bounds and document overflow guards prevent intrinsic screenshot-crop dimensions from creating page-level horizontal scroll.

## Unit-test status

New Jasmine specifications cover:

- integer subtotal, delivery, discount, and total calculations;
- quantity minimum/maximum behavior;
- booking mapping/persistence;
- empty-cart order prevention;
- duplicate payment/order submission prevention.

Karma did not execute these specs because the existing Template 5 test glob first compiles unrelated legacy `business/**` specs. Those files reference packages/paths absent from the root installation:

- `@angular/platform-browser-dynamic/testing`;
- `ngx-intl-tel-input`;
- legacy `jaldee-framework/*` entry points;
- missing legacy Template 5 services such as `services/account-service`, `services/booking-service`, and `services/order.service`.

Resolving this would require dependency/workspace or unrelated legacy-source changes outside `projects/template5`'s ChotaBoss implementation boundary. No pass is claimed for the Karma command.

## Known limitations

- Live ChotaBoss account/provider/store identifiers and sandbox payment configuration were not supplied. Booking/order/payment use the documented non-mutating project adapter.
- Track Order and Invoice Details retain visible semantic CTAs but require the contracts in `MISSING_API_AND_URL_REQUIREMENTS.md` for live destinations.
- Full automated E2E and all-screen pixel-diff gates remain pending an approved Playwright setup or existing project E2E harness.

## Repository cleanliness

- Source changes are scoped to `projects/template5/**`.
- Existing user changes in the host/root/template projects were not modified.
- Reference screenshots remain under `projects/template5/ChotaBoss` and are not used as full-page backgrounds.
- No source-tree debug captures, test-output folders, generated scripts, or dependency changes were added.
