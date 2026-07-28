# ChotaBoss API and data mapping

The UI consumes `ChotaBossStateService`, an isolated adapter with the same screen-oriented boundaries required by the existing shared services. It makes no network mutation until account-specific identifiers and a sandbox payment configuration are supplied.

| Screen/action | Required data | Existing service/method candidate | Endpoint/config source | Request model | Response fields used | Status | Notes |
|---|---|---|---|---|---|---|---|
| App configuration | Account theme/template/features | `AccountService`, Template 2/4 bootstrap | shared environment/account config | account key | account, theme, features | Awaiting account ID | Federation identity is preserved |
| Location list/selection | Cities, active location | `AccountService`, `GroupStorageService`, `LocalStorageService` | shared account API/storage | account/location | id, name, address | Adapter implemented | Persists selection locally |
| Provider discovery | Groomers/vets by location | `ConsumerService`, Template 2 provider flows | shared consumer API | location filters | id, name, distance, rating, timings | Adapter implemented | Screenshot provider data |
| Provider details | Profile/address/timings | `ConsumerService` | shared consumer API | provider ID | profile, location, verification | Adapter implemented | Map/phone kept safe |
| Service list | Service catalogue/prices | `AccountService`, booking flows | account service catalogue | provider/location ID | id, name, price, description | Adapter implemented | Two reference services |
| Slot availability | Pet/date/time availability | booking orchestration services | account booking API | provider, service, date | dates, slots, availability | Adapter implemented | Validates required choices |
| Create booking | Appointment payload/response | `BookingService`, `ConsumerService` | shared booking API | service, pet, date, slot | booking ID/details/status | Non-mutating adapter | Persists deterministic details; no fake API call |
| Upcoming booking | Active booking | `ConsumerService`, subscription/storage services | consumer booking API | consumer/account | booking summary | Adapter implemented | Feeds home card |
| Booking details/invoice | Appointment/invoice | `ConsumerService`, payment services | consumer API | booking ID | provider/service/date/time | Adapter implemented | Invoice CTA retained |
| Shop categories/brands | Taxonomy/brand assets | `OrderService`, account catalogue | order/catalogue API | account/location | id, name, image | Adapter implemented | Reference data |
| Store list/search | Store/item suggestions | `OrderService`, `ConsumerService` | order search API | query/location | stores, products, metadata | Adapter implemented | Local filtered/debounced-ready boundary |
| Store/catalogue | Store/products/open status | `OrderService` | order/catalogue API | store ID | store, products, pricing | Adapter implemented | Responsive grid |
| Cart retrieval/update | Lines/quantities | `OrderService`, storage services | order/cart API | product/quantity | cart lines/totals | Adapter implemented | Bounds 0–9 and persists |
| Note | Order note | `OrderService` | cart/order API | note text | saved note | Adapter implemented | Editable/persisted |
| Coupon | Validation/discount | `OrderService` | checkout API | coupon/cart | validity/discount | Adapter implemented | CHOTABOSS fixture |
| Checkout totals | subtotal/fee/discount/total | `OrderService`, `CurrencyService` | checkout API | cart/location/coupon | integer totals | Implemented | Integer arithmetic |
| Payment method/initiation | sandbox payment token/status | `PaytmService`, `RazorpayService` and existing payment modules | environment/payment config | order/payment mode | status/reference | Blocked for live calls | Accessible slider drives safe adapter only |
| Order creation | order payload/response | `OrderService` | order API | cart/address/payment reference | order ID, ETA, totals | Non-mutating adapter | Duplicate submission prevented |
| Order confirmation/details | persisted order | `OrderService`, storage | order API/storage | order ID | totals/items/payment/ETA | Adapter implemented | Refresh survives via local storage |
| Order tracking | tracking state | `OrderService` | order API | order ID | status/timeline | Awaiting endpoint contract | CTA is present |
