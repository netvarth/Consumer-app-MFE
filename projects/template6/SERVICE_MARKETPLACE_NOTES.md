# Service marketplace configuration notes

- The supplied store, location, logo, and service image URLs use placeholder `service-marketplace/...` S3 paths. The UI preserves card dimensions and shows a paw fallback if an image cannot load.
- Both supplied phone numbers contain `X` placeholders, so the call action is intentionally hidden until a valid `phoneNumber` or `phoneLink` is configured.
- The configuration does not provide copy for geolocation failure or an unknown store. Geolocation uses concise accessibility-safe fallback copy; an unknown or disabled store uses the configured empty-state copy and a link back to store selection.
- Store coordinates are not supplied. `near-you` therefore uses configured `distanceKm` values and does not replace the previously selected location when permission is denied.
