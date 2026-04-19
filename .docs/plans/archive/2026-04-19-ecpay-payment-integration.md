# ECPay Payment Integration Archive

Date: 2026-04-19

## Summary
- Added ECPay AIO checkout integration for the test environment with `ChoosePayment=Credit`.
- Kept the existing order flow intact and extended it with ECPay payment payload generation and callback handling.
- Preserved the original `orderRoutes.js` structure and added the new payment flow as incremental endpoints plus a dedicated payment route module.

## Implemented Changes
- Added `src/services/ecpay.js`
  - Generates `MerchantTradeNo`
  - Builds `CheckMacValue`
  - Builds ECPay checkout form payload
  - Parses order result callback payload
- Extended `src/database.js`
  - Added payment-related columns to `orders`
  - Added idempotent schema migration for existing local databases
- Updated `src/routes/orderRoutes.js`
  - Stores `merchant_trade_no`, `payment_provider`, `payment_status`
  - Returns ECPay payment form payload on order creation
  - Adds `POST /api/orders/:id/ecpay-checkout` for retrying payment on pending orders
- Added `src/routes/paymentRoutes.js`
  - `POST /api/payments/ecpay/return`
  - `POST /payments/ecpay/result`
- Updated frontend payment flow
  - `public/js/pages/checkout.js`
  - `public/js/pages/order-detail.js`
  - `views/pages/checkout.ejs`
  - `views/pages/order-detail.ejs`
- Updated configuration/docs
  - `.env.example`
  - `README.md`
  - `AGENTS.md`

## Environment Variables
- `ECPAY_MERCHANT_ID`
- `ECPAY_HASH_KEY`
- `ECPAY_HASH_IV`
- `ECPAY_ENV`
- `ECPAY_CALLBACK_BASE_URL`
- `ECPAY_CLIENT_BACK_BASE_URL`

## Callback URL Rules
- `ReturnURL`: `{ECPAY_CALLBACK_BASE_URL}/api/payments/ecpay/return`
- `OrderResultURL`: `{ECPAY_CALLBACK_BASE_URL}/payments/ecpay/result`
- Local page redirects still use `BASE_URL`, typically `http://localhost:3001`

## Verified
- Automated test suite passed: `npm test`
- Coverage of the new flow includes:
  - Official ECPay AioCheckOut `CheckMacValue` example matches the documented SHA256 output
  - Order creation returns ECPay checkout payload
  - Pending orders can regenerate an ECPay checkout payload
  - Valid ECPay callback updates order payment state
  - ECPay result route redirects back to the order detail page

## Known Limits
- This implementation only enables ECPay credit card checkout in staging/test usage.
- No manual live callback verification against a real public tunnel was run in this session.
- Failed payment callbacks keep the order in `pending` and mark `payment_status=failed` so the user can retry payment.

## Post-Implementation Correction
- Initial implementation used an incorrect `CheckMacValue` algorithm and caused ECPay error `10200073 / CheckMacValue Error`.
- The checksum logic was corrected to follow the official AioCheckOut spec:
  - sorted query string
  - `HashKey` / `HashIV` wrapping
  - URL encode + lowercase
  - `SHA256` hash
  - uppercase output
