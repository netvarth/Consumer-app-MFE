# ChotaBoss screen mapping

| Reference | Route/state | Primary component | Data source | Controls and links | Status |
|---|---|---|---|---|---|
| iPhone 16 - 149.png | `/locations?state=near-you` | LocationsPage | State adapter: cities/providers | Back, city chips, find other locations, provider cards | Implemented; build verified |
| iPhone 16 - 150.png | `/locations?city=Thrissur` | LocationsPage | Selected city + providers | City chips, provider cards -> provider | Implemented; build verified |
| iPhone 16 - 151.png | `/provider/pet-focuz` | ProviderPage | Selected provider/services | Back, map, phone, Book Now -> slots | Implemented; build verified |
| iPhone 16 - 152.png | `/book/spa-bath` | BookingPage | Service, dates, slots | Pet segment, dates, slots, submit | Implemented; build verified |
| iPhone 16 - 153.png | `/home` with no booking | HomePage | App content adapter | Header actions, service tiles, promos, blogs, nav | Implemented; build verified |
| iPhone 16 - 154.png | `/booking/success` | BookingSuccessPage | Returned/persisted booking | Back to Home | Implemented; build verified |
| iPhone 16 - 155.png | `/home` with upcoming booking | HomePage | Persisted booking | Upcoming card -> details | Implemented; build verified |
| iPhone 16 - 156.png | `/booking/details` | BookingDetailsPage | Persisted booking | Back, Invoice Details | Implemented; build verified |
| iPhone 16 - 160.png | `/shop` | ShopPage | Shop/category adapter | Location, search, categories, brands, stores | Implemented; build verified |
| iPhone 16 - 163.png | `/search?q=Pedigre` | SearchPage | Local filtered adapter | Back, search/clear, items/stores -> store | Implemented; build verified |
| iPhone 16 - 164.png | `/checkout` initial | CheckoutPage | Cart/calculation adapter | Quantity, note, coupon, payment, slider | Implemented; build verified |
| iPhone 16 - 166.png | `/checkout` dragging | CheckoutPage | Native range slider pointer state | Drag/reset/keyboard completion | Implemented; build verified |
| order-confirmed-success.png | `/order/success` | OrderSuccessPage | Returned/persisted order | Full order, track, continue shopping | Implemented; build verified |
| store-details-page-1.png | `/store/pedigree` empty cart | StorePage | Store/catalogue adapter | Search, chips, add buttons | Implemented; build verified |
| store-details-page.png | `/store/pedigree` non-empty cart | StorePage | Store/catalogue + cart | Quantity, sticky checkout | Implemented; build verified |

All routes compile in the production federation build. Automated pixel-diff status is documented separately in `VERIFICATION_REPORT.md`.
