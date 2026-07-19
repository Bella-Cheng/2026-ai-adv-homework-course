---
name: e2e
description: 使用 Playwright MCP 測試本專案的綠界金流正常成功流程，從商品詳情、加入購物車、登入或註冊、結帳、綠界測試站付款，到成功導回與訂單付款狀態驗證。
---

# 綠界金流 E2E 測試

## 目標

使用 Playwright MCP 執行一條完整且成功的綠界付款流程，從商品頁加入購物車、登入或註冊、填寫結帳資料、建立訂單、前往綠界付款、成功導回，到驗證訂單狀態。本技能只執行這一條正常成功流程。

## 專案路徑與狀態規則

常用頁面：

- 商品詳情：`/products/:id`
- 購物車：`/cart`
- 結帳頁：`/checkout`
- 登入／註冊：`/login`
- 訂單列表：`/orders`
- 訂單詳情：`/orders/:id`

常用 API：

- `GET /api/products`
- `POST /api/cart`
- `GET /api/cart`
- `POST /api/orders`
- `GET /api/orders/:id`
- `POST /api/payments/ecpay/return`
- `POST /payments/ecpay/result`

付款狀態預期：

- 建立訂單後：`status=pending`、`payment_status=pending`
- 付款成功後：`status=paid`、`payment_status=paid`

## 測試前準備

1. 先讀 `docs/DEVELOPMENT.md`、`docs/FEATURES.md`、`docs/ROUTES.md`。若需要理解訂單、庫存或資料表，再讀 `docs/DATA_MODEL.md`。
2. 確認 `.env` 存在，且至少設定 `JWT_SECRET`。如要測真實綠界測試站導轉，也確認 `ECPAY_*`、`BASE_URL`、`ECPAY_CALLBACK_BASE_URL`、`ECPAY_CLIENT_BACK_BASE_URL`。
3. 啟動服務：

```powershell
npm run start
```

若 CSS 已建置，只測後端流程可用：

```powershell
npm run dev:server
```

4. 預設 base URL 為 `http://localhost:3001`，若 `PORT` 不同，以實際啟動資訊為準。
5. 測試帳號優先用 UI 註冊唯一 Email，例如 `e2e-<timestamp>@example.com`。
6. 商品 ID 不要硬編。先用 `GET /api/products` 取得第一筆 `stock > 0` 商品，再進入 `/products/:id`。

## Playwright MCP 指令對照

使用以下工具完成操作與驗證：

- 開頁：`mcp__playwright.browser_navigate`
- 取得可互動元素：`mcp__playwright.browser_snapshot`
- 找文字：`mcp__playwright.browser_find`
- 點擊：`mcp__playwright.browser_click`
- 填表：`mcp__playwright.browser_fill_form`
- 等待：`mcp__playwright.browser_wait_for`
- 執行頁面內 JavaScript 或 fetch：`mcp__playwright.browser_evaluate`
- 查網路請求列表：`mcp__playwright.browser_network_requests`
- 查單一請求細節：`mcp__playwright.browser_network_request`
- 查 console error：`mcp__playwright.browser_console_messages`

範例：

```js
mcp__playwright.browser_navigate({ url: 'http://localhost:3001/products/<productId>' });
mcp__playwright.browser_find({ text: '前往綠界付款' });
mcp__playwright.browser_click({ target: '<snapshot ref 或 CSS selector>', element: '前往綠界付款按鈕' });
mcp__playwright.browser_network_requests({ filter: '/api/orders', static: false });
```

主要斷言應以畫面文字、URL、API 回應與資料狀態為準。

## 正常流程

1. 清除瀏覽器狀態。
   - 進入 base URL。
   - 用 `browser_evaluate` 清除 `localStorage` 與 `sessionStorage`。

2. 取得可購買商品。
   - 用 `browser_evaluate` 呼叫 `GET /api/products`。
   - 選第一筆 `stock > 0` 商品。
   - 導航到 `/products/:id`。

3. 加入購物車。
   - 等待商品名稱、`加入購物車` 或 `立即購買` 出現。
   - 點 `立即購買`；若沒有此按鈕，先點 `加入購物車`，再到 `/cart` 點 `前往結帳`。

4. 登入或註冊。
   - 若未登入，預期導向 `/login?redirect=/checkout` 或 `/login`。
   - 註冊唯一測試帳號，或登入既有測試帳號。
   - 預期登入後回到 `/checkout`，或可手動導到 `/checkout`。

5. 填寫結帳資料並建立訂單。
   - 收件人姓名：`E2E 測試收件人`
   - Email：測試帳號 Email
   - 收件地址：`台北市測試路 1 號`
   - 點 `前往綠界付款`。
   - 驗證 `POST /api/orders` 回應含 `data.payment.action`、`method`、`fields.MerchantTradeNo`、`fields.CheckMacValue`、`fields.ChoosePayment=Credit`。

6. 完成付款。
   - 若可操作外部綠界測試頁，等待網址包含 `payment-stage.ecpay.com.tw`，依「使用綠界信用卡付款的支付畫面」流程完成付款。
   - 若 MCP 環境無法操作外部綠界頁，改用合法的 `POST /api/payments/ecpay/return` 模擬成功回呼。回報時必須註明這是本機模擬，不是真實外部刷卡頁。

7. 驗證成功導回與訂單狀態。
   - 預期導回 `/orders/:id?payment=success`。
   - 頁面應出現 `訂單成立`、`感謝你的訂購` 或已付款狀態。
   - 用 `GET /api/orders/:id` 驗證 `status=paid`、`payment_status=paid`。

## 使用綠界信用卡付款的支付畫面

只有在 `.env` 使用綠界測試環境且導轉網址為 `payment-stage.ecpay.com.tw` 時，才操作綠界信用卡測試付款頁。不要使用正式金流環境或真實信用卡。

1. 等待綠界付款頁完成載入。
   - 預期 URL 包含 `payment-stage.ecpay.com.tw/Cashier/AioCheckOut` 或同站台支付頁。
   - 頁面應顯示信用卡付款、訂單金額或商店訂單編號等付款資訊。
   - 若出現「信用卡」、「Credit」或付款方式選項，選擇信用卡付款。

2. 填寫測試信用卡資料。
   - 卡號：`4311-9522-2222-2222`
   - 有效年月：使用任一未來年月，例如 `12/30` 或頁面下拉選單中的未來年份。
   - 安全碼：`222`
   - 若頁面要求持卡人、手機或 Email，使用測試帳號資料，不要填入真實個資。

3. 操作欄位時使用彈性定位。
   - 優先用 `browser_snapshot` 取得實際欄位名稱與按鈕文字。
   - 卡號可能是單一欄位，也可能拆成 4 個欄位；拆欄時依序填入 `4311`、`9522`、`2222`、`2222`。
   - 有效年月可能是文字欄位或下拉選單；若是分開欄位，月份填 `12`，年份填 `30` 或 `2030`。
   - 送出按鈕可能顯示為 `確認付款`、`送出`、`Submit`、`下一步` 或同等語意。

4. 完成測試站付款確認。
   - 送出信用卡資料後，若綠界測試頁出現 3D 驗證、確認付款或交易結果確認頁，依頁面提示選擇測試成功付款。
   - 等待瀏覽器導回本機 `ECPAY_CLIENT_BACK_BASE_URL` 或 `BASE_URL`。
   - 預期最終 URL 為 `/orders/:id?payment=success`，或先進入 `/payments/ecpay/result` 後再 302 導回訂單詳情。

5. 若外部支付頁無法操作。
   - 若 Playwright MCP 因跨站導轉、外部網路、iframe、防機器人驗證或測試站版面限制無法完成信用卡付款，停止操作外部頁。
   - 改用合法的 `POST /api/payments/ecpay/return` 本機模擬回呼，payload 必須包含正確 `MerchantTradeNo`、`TradeAmt`、`RtnCode=1` 與有效 `CheckMacValue`。
   - 回報時明確標示「未完成真實綠界信用卡頁付款，改用本機回呼模擬付款成功」。

## 測試完成摘要

完成測試後只提供精簡摘要：

- 測試結果：成功或失敗。
- base URL 與是否使用綠界測試站。
- 測試帳號、商品 ID、訂單 ID、訂單編號、`MerchantTradeNo`。
- `POST /api/orders` 與 `GET /api/orders/:id` 的狀態碼。
- 最終 URL、`status` 與 `payment_status`。
- console 是否有本專案未處理例外。
- 若失敗，只列出卡住的步驟、錯誤訊息與關鍵 API 回應摘要。

## 注意事項

- 不要使用正式金流環境或真實信用卡。
- 不要回報 `.env`、金流密鑰、JWT 或完整個資。
- 測試資料使用唯一 Email，避免和既有會員衝突。
- 必須使用 URL、畫面文字、API 回應與訂單狀態判斷成功。
- 若需要新增測試檔，沿用本專案 CommonJS、2 空白縮排、分號與繁體中文用語。
