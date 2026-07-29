# Pet Store configuration

The page reads the optional top-level `petStore` object from the active template JSON. Edit `projects/template6/template_CA.json` to change visible text, images, searches, and destinations.

## Where to add links

Every empty `link` or `*Link` value is an intentional placeholder:

- `header.locationLink`, `header.cartLink`, and `header.profileLink`
- `categoriesSeeAllLink`, `brandsSeeAllLink`, and `shopsSeeAllLink`
- `categories[].link`, `brands[].link`, and `shops[].link`
- `promotion.link`
- `navigation[].link`

Use an app-relative route such as `items`, `about`, or `order/cart`, or a complete `https://...` URL. When an item `link` is empty, its `query` value opens the existing item search instead.

## Where to change text and images

- Header: `logo`, `logoAlt`, `locationLabel`, `locationValue`, `searchPlaceholder`, and `backgroundImage`.
- Page copy: `title`, `subtitle`, `brandsTitle`, `shopsTitle`, `verifiedLabel`, and default shop fields.
- Section actions: each `*SeeAllLabel` controls its displayed text.
- Category/brand cards: `name`, `image`, and `imageAlt`.
- Shop cards: `name`, `image`, `imageAlt`, `type`, `rating`, `reviews`, `location`, `verified`, and `ctaLabel`.
- Promotion: `title`, `description`, `buttonLabel`, `image`, and `imageAlt`.
- Bottom navigation: `label` and `icon`.

Relative image paths are resolved against `assetBasePath`; HTTP(S), data, and blob URLs are left unchanged.