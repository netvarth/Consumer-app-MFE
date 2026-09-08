# Template 7 sub-app homepage

The tenant root renders `homePage` when `context` is `subApp`. `homePage.type` selects store or service. `HomeEntryComponent` instantiates the existing RootComponent only for a legacy template with the required legacy sections; malformed and disabled sub-app configurations never enter that initialization path.

## Configuration and activation

- Complete workspace configuration: `projects/template7/template_CA.json`.
- Equivalent home/navigation fragment: `projects/template7/homepage.config.json`.
- The host still loads the tenant's existing `<configPath>/<uniqueID>/template_CA.json` through `TemplateService`. Upload the complete configuration to that existing tenant location to activate it remotely. No template URL, tenant ID or content is hardcoded into the renderer. Local edits do not publish this JSON.
- `template7` is registered in the root environment files and the existing federation configuration exposes `./Home` under that name. Existing user changes to federation and environment settings were retained.
- The updated store configuration uses the nine S3 URLs supplied on September 8, 2026. The service configuration retains the user's requested wide Training cards. Its `columnsMobile` and `columnsDesktop` are both `1`; `2`/`3` select the optional image-above-text grid.

## Asset and destination mapping

Store image base: `https://jaldeeuiscale.s3.ap-south-1.amazonaws.com/154855/home_assets/`.

| Placement | Supplied S3 object | Destination still needed |
| --- | --- | --- |
| Store hero | `homeCover.png` | Search already targets tenant-relative `items?query=...` |
| Food | `category-food.png` | `__CATEGORY_FOOD_ID__` |
| Accessories | `category-accessories.png` | `__CATEGORY_ACCESSORIES_ID__` |
| Supplements | `category-supplements.png` | `__CATEGORY_SUPPLEMENTS_ID__` |
| Toys | `category-toys.png` | `__CATEGORY_TOYS_ID__` |
| Trial placement 1 | `product1.png` | `__TRIAL_PACK_ENCID__` |
| Value placement 2 | `product2.png` | `__VALUE_PACK_ENCID__` |
| Trial placement 3 | `product3.png` | `__TRIAL_PACK_ENCID__` |
| Value placement 4 | `product4.png` | `__VALUE_PACK_ENCID__` |
| Service hero | `/assets/template-home/service-hero.png` (not supplied) | `__LOCATION_ID__`, `__SERVICE_ID__` |
| Service background | `/assets/template-home/service-list-cover.png` (not supplied) | — |
| Two Training placements | `/assets/template-home/service-training.png` (not supplied) | `__TRAINING_SERVICE_ID__` |
| Parent Home | Resolved from the existing validated cross-tenant journey for the current provider, when present | Otherwise supply `__PARENT_APP_HOME_URL__` |

The S3 URLs were validated locally and installed as supplied; their HTTP availability and contents have not been verified. No replacement CDN locations were invented. The original standalone store artwork remains available at `projects/template7/public/assets/template-home/store-hero.png`, copied byte-for-byte from `Frame 1171278126.png`; the active configuration uses S3 instead. Missing images show an accessible fallback. Root and remote asset configurations also support local `assets/` URLs under the host base href.

Shop resolves to the sub-app root. Bookings, About Us and Support use the existing `bookings`, `about` and `support` routes. Placeholder and malformed targets render without an href. Catalog detail and checkout continue to use existing server-backed logic and authoritative prices.

## Rendering behavior

- Explicit `enabled: true` is required for modes, sections and items. Empty lists remove the complete section. A disabled page or mode retains the shell with no homepage body.
- Keys identify placements; sort order is stable and does not modify shared JSON. Separate placements of the same SKU remain separate.
- Prices use INR with exactly two decimals. Zero is valid; malformed or negative prices are omitted. Tenant `hidePrice` takes precedence.
- Hero images preserve their complete proportions. Search and appointment hotspots use bounded percentage coordinates. Disabling a hotspot cannot remove a button painted into the artwork.
- Image fit defaults to `contain`; backgrounds default to white; maximum content width defaults to 654px. Only constrained colors, dimensions, ratios, URLs and route parameters are accepted. No configurable HTML/CSS is executed.
- Config changes clear component search/error state. Tenant transitions with a stale template wait for new data; links verify the current tenant. Footer items use their own config and never depend on legacy sections.
- The existing header and footer are reused. Footer clearance follows the measured footer height, including safe-area padding once.

## Validation

Passed during implementation:

```text
node node_modules/typescript/bin/tsc -p projects/template7/tsconfig.app.json --noEmit
node node_modules/@angular/compiler-cli/bundles/src/bin/ngc.js -p projects/template7/tsconfig.app.json --noEmit
node node_modules/@angular/cli/bin/ng.js build template7 --configuration development --dev=false
node node_modules/@angular/cli/bin/ng.js test template7 --watch=false --browsers=ChromeHeadless --ts-config=projects/template7/tsconfig.home-tests.json --include=projects/template7/src/app/home/template-home/template-home.spec.ts
```

The completed browser test run passed 15 tests. Two further visibility/parent-navigation tests and small lifecycle/link-validation refinements were added afterward; the rerun was blocked by automatic approval because the account usage limit was reached. The latest Angular compiler check passed. The S3 update was checked locally by parsing and normalizing all nine image URLs, without making network requests.

The dedicated test tsconfig points the federation facade at its actual ESM runtime export, avoiding the installed facade package's CommonJS/ESM mismatch in Karma. The development federation build requires `--dev=false` for a one-off build; the existing `dev: true` build configuration expects a dev-server target. Existing font-awesome/primeicons federation metadata warnings remain.

`node scripts/preview-template7-home.mjs` serves the built, integrated HomeModule at `http://127.0.0.1:9047/capp/preview` with mocked account/auth services. `?type=service` selects the service fixture for local review. This is a QA fixture, not a separate implementation or a live tenant. It does not validate backend availability or booking IDs.

An initial 653px content-layout inspection was performed before the S3 update. Final screenshots at all requested widths and a pixel-perfect comparison were not completed. Service artwork, real destination IDs and the parent destination for direct-entry sessions remain release prerequisites.
