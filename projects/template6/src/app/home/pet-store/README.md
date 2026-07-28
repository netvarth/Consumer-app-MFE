# Pet Store configuration

The page reads the optional top-level `petStore` object from the active template JSON. When the object or an item array is absent, the component uses safe local fallbacks.

- `assetBasePath`: base URL for relative content assets.
- `header`: `logo`, `logoAlt`, `locationLabel`, `locationValue`, `locationLink`, `cartLink`, `profileLink`, `searchPlaceholder`, and `backgroundImage`.
- Page copy: `title`, `subtitle`, `searchPlaceholder`, `brandsTitle`, `shopsTitle`, `seeAllLabel`, `viewStoreLabel`, `verifiedLabel`, `defaultShopType`, and `defaultLocation`.
- `categories[]` and `brands[]`: `name`, `image`/`imageUrl`, and optional `link` or `query`.
- `shops[]`: card fields plus `type`, `rating`, `reviews`, `location`, `verified`, and optional `encId`, `link`, or `query`.
- `promotion`: `title`, `description`, `buttonLabel`, `image`, `imageAlt`, and optional `link` or `query`.
- `navigation[]`: `key`, `label`, `icon`, and optional `link`. The item with key `shop` is active on this route.

Relative image paths are resolved against `assetBasePath`; absolute HTTP(S), data, and blob URLs are left unchanged.