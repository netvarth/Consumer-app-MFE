# Missing API and URL requirements

The repository contains generic consumer, booking, order, storage, and payment integrations, but the supplied ChotaBoss package contains screenshots only. The following account-specific information is required before enabling live mutations.

| ID | Screen/action | Missing requirement | Searched locations/files/services | Expected owner | Why needed | Temporary behavior | Exact information required | Blocking |
|---|---|---|---|---|---|---|---|---|
| CB-API-01 | App bootstrap | ChotaBoss account/provider identifier | Template 2/4 home/bootstrap, Template 5 legacy business, shared service usages | Product/backend | Resolves live account config and catalogue | Project-scoped visual adapter | Account key, public configuration lookup contract | Live integration only |
| CB-API-02 | Discovery/booking | Grooming provider, service and location IDs | Template 2/4 booking and consumer flows | Backend/account admin | Maps screenshot entities to live resources | Deterministic reference providers/services | Location IDs, provider IDs, service IDs and enabled booking modes | Live integration only |
| CB-API-03 | Booking | Test consumer/authentication setup | Template 2/4 authentication/session flows | QA/product | Safe automated booking validation | No network submission | Test account/OTP bypass or intercepted fixture contract | Live/E2E mutation |
| CB-API-04 | Shop/order | Store/catalogue/account IDs | Template 2 order/cart/checkout, Template 5 legacy order flows | Commerce backend | Loads live products, stock, fees and addresses | Deterministic reference catalogue/cart | Store ID, catalogue ID, inventory/price endpoints | Live integration only |
| CB-API-05 | Payment | Sandbox gateway configuration | Existing Paytm/Razorpay/payment modules and environment pattern | Payments/backend | Safely validates payment flow | Slider completes against local non-mutating adapter | Sandbox gateway, mode ID, token-init endpoint, callback contract | Live payment |
| CB-API-06 | Tracking | Order tracking endpoint/state contract | Template 2 order status/details | Commerce backend | Powers Track Order destination | CTA remains on confirmation screen | Endpoint, statuses, polling/push rules and deep-link route | Tracking page |

## Inferred payloads

Booking requires provider/location/service IDs, consumer or pet ID/type, local date, slot/time, booking mode, advance amount, and idempotency token; response must include booking ID/status, provider/service summary, date/time/location, invoice/payment state.

Order requires store/catalogue ID, product lines with quantities, delivery address, note, coupon, delivery fee, payment mode/reference, and idempotency token; response must include order ID/status, item/totals snapshot, ETA, address, payment status, and tracking reference.

No production URL, secret, booking, order, or payment mutation is hardcoded or executed by this implementation.
