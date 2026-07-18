# 綠界金流串接封存紀錄

日期：2026-04-19

## 摘要

- 已為測試環境加入綠界 AIO 信用卡付款整合，並使用 `ChoosePayment=Credit`。
- 保留既有訂單流程，另外擴充綠界付款參數產生與回呼處理能力。
- 維持原本 `orderRoutes.js` 的結構，透過增量端點與獨立付款路由模組加入新流程。

## 已實作變更

- 新增 `src/services/ecpay.js`
  - 產生 `MerchantTradeNo`
  - 建立 `CheckMacValue`
  - 建立綠界付款表單參數
  - 解析付款結果回呼 payload
- 擴充 `src/database.js`
  - 為 `orders` 加入付款相關欄位
  - 為既有本機資料庫加入可重複執行的 schema migration
- 更新 `src/routes/orderRoutes.js`
  - 儲存 `merchant_trade_no`、`payment_provider`、`payment_status`
  - 建立訂單時回傳綠界付款表單參數
  - 新增 `POST /api/orders/:id/ecpay-checkout`，供待付款訂單重新發起付款
- 新增 `src/routes/paymentRoutes.js`
  - `POST /api/payments/ecpay/return`
  - `POST /payments/ecpay/result`
- 更新前端付款流程
  - `public/js/pages/checkout.js`
  - `public/js/pages/order-detail.js`
  - `views/pages/checkout.ejs`
  - `views/pages/order-detail.ejs`
- 更新設定與文件
  - `.env.example`
  - `README.md`
  - `AGENTS.md`

## 環境變數

- `ECPAY_MERCHANT_ID`
- `ECPAY_HASH_KEY`
- `ECPAY_HASH_IV`
- `ECPAY_ENV`
- `ECPAY_CALLBACK_BASE_URL`
- `ECPAY_CLIENT_BACK_BASE_URL`

## Callback URL 規則

- `ReturnURL`：`{ECPAY_CALLBACK_BASE_URL}/api/payments/ecpay/return`
- `OrderResultURL`：`{ECPAY_CALLBACK_BASE_URL}/payments/ecpay/result`
- 本機頁面導回仍使用 `BASE_URL`，通常為 `http://localhost:3001`

## 已驗證項目

- 自動化測試已通過：`npm test`
- 新流程涵蓋內容包括：
  - 官方綠界 AioCheckOut `CheckMacValue` 範例可產生文件對應的 SHA256 結果
  - 建立訂單時會回傳綠界付款表單參數
  - 待付款訂單可重新產生綠界付款表單參數
  - 合法的綠界回呼會更新訂單付款狀態
  - 綠界結果路由會導回訂單詳情頁

## 已知限制

- 目前僅啟用綠界測試環境的信用卡付款流程。
- 本次作業未對真實公開 tunnel 進行手動 live callback 驗證。
- 付款失敗回呼會讓訂單維持 `pending`，並將 `payment_status=failed`，讓使用者可以重新付款。

## 後續修正紀錄

- 初版實作曾使用錯誤的 `CheckMacValue` 演算法，導致綠界回傳錯誤 `10200073 / CheckMacValue Error`。
- 後續已改為依照官方 AioCheckOut 規格修正 checksum 邏輯，包含：
  - 依欄位名稱排序 query string
  - 包上 `HashKey` / `HashIV`
  - URL encode 後轉小寫
  - 使用 `SHA256` 雜湊
  - 最後轉成大寫輸出
