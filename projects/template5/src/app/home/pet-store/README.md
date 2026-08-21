# Pet Store page

The page is available at the configured petStorePage.route (pet-store in
projects/template6/template_CA.json). All visible page content, assets, links,
sort order, enabled states, empty states, and carousel behavior are read from
the top-level petStorePage object.

## Layout integration

- layout.hideParentHeader is evaluated by HomeComponent on every completed
  navigation, so the normal header is hidden on Pet Store routes and restored
  automatically after leaving them.
- The fixed footer is owned by HomeComponent, not duplicated by the Pet Store
  component. layout.useParentFooterNavigation controls its Pet Store visibility
  and footerNavigationItem supplies the Shop label, icon, and route.
- The page reserves footer and safe-area space at the bottom.

## UI mapping

- hero supplies the custom header, location, actions, search, intro, and
  decorative background.
- categories, brands, and shops are filtered by enabled, sorted by sortOrder,
  and rendered as scoped horizontal rows when needed.
- Category/shop cards and offers are full-image creatives; no visible metadata
  is redrawn over them.
- offers drives autoplay, interval, interaction pausing, looping, indicators,
  arrows, reduced-motion behavior, and page-visibility pausing.
- emptyStates supplies stable fallbacks for enabled empty sections.

## Verification

- Compile: npm run ng -- run template6:esbuild:development
- Focused tests: npm run ng -- test template6 --watch=false --browsers=ChromeHeadless

The development compile passes. The current Karma harness cannot start because
@angular/platform-browser-dynamic/testing is absent and the native-federation
package is parsed with the wrong module mode; this is a project test-runner
configuration issue rather than a Pet Store compile failure.
