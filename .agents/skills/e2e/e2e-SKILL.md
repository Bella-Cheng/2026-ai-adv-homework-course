---
name: e2e
description: 當需要使用 Playwright MCP 為本專案執行或設計端對端測試時使用，特別是綠界金流完整流程：從商品詳情、加入購物車、登入或註冊、結帳、送出綠界付款表單、付款結果導回，到訂單詳情與付款狀態驗證。適用於正常付款、付款失敗、欄位驗證錯誤、重新付款、API 狀態檢查與測試證據整理。
---

# 綠界金流 E2E 測試

## 目標

使用 Playwright MCP 自動測試綠界金流完整流程，從進入商品頁到付款完成的每一個動作，並同時驗證畫面、API 回應、訂單狀態與付款狀態。

必測範圍：

- 正常流程：商品頁加入購物車、登入或註冊、填寫結帳資料、建立訂單、前往綠界付款、付款成功導回、訂單狀態正確。
- 異常情境：付款失敗、付款取消、欄位驗證錯誤、未登入導向、空購物車導向、失敗後重新付款。
- 交付證據：記錄操作結果、關鍵 API 回應、console error；截圖只在失敗、版面疑慮或需要交付佐證時使用。

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
- `POST /api/orders/:id/ecpay-checkout`
- `POST /api/payments/ecpay/return`
- `POST /payments/ecpay/result`
- `PATCH /api/orders/:id/pay`

付款狀態預期：

- 建立訂單後：`status=pending`、`payment_status=pending`
- 付款成功後：`status=paid`、`payment_status=paid`
- 付款失敗後：`status=pending`、`payment_status=failed`，且可重新付款

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
- 截圖留證：`mcp__playwright.browser_take_screenshot`
- 調整行動版尺寸：`mcp__playwright.browser_resize`

範例：

```js
mcp__playwright.browser_navigate({ url: 'http://localhost:3001/products/<productId>' });
mcp__playwright.browser_find({ text: '前往綠界付款' });
mcp__playwright.browser_click({ target: '<snapshot ref 或 CSS selector>', element: '前往綠界付款按鈕' });
mcp__playwright.browser_network_requests({ filter: '/api/orders', static: false });
```

截圖目的：

- 失敗時保留當下畫面，方便定位卡在哪一步。
- 驗證付款結果頁、訂單詳情頁或行動版版面是否顯示正確。
- 交付測試報告時提供佐證。

不要把截圖當成主要斷言；主要斷言應以畫面文字、URL、API 回應與資料狀態為準。

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
   - 若可操作外部綠界測試頁，等待網址包含 `payment-stage.ecpay.com.tw`，依測試頁流程完成付款。
   - 若 MCP 環境無法操作外部綠界頁，改用本機模擬付款，例如 `PATCH /api/orders/:id/pay` 或合法的 `POST /api/payments/ecpay/return`。回報時必須註明這是本機模擬，不是真實外部刷卡頁。

7. 驗證成功導回與訂單狀態。
   - 預期導回 `/orders/:id?payment=success`。
   - 頁面應出現 `訂單成立`、`感謝你的訂購` 或已付款狀態。
   - 用 `GET /api/orders/:id` 驗證 `status=paid`、`payment_status=paid`。

## 異常情境

### 欄位驗證錯誤

1. 保持已登入且購物車有商品，進入 `/checkout`。
2. 不填資料直接點 `前往綠界付款`。
3. 預期出現 `請輸入收件人姓名`、`請輸入 Email`、`請輸入收件地址`。
4. 輸入 `bad-email` 後再送出。
5. 預期出現 `Email 格式不正確`。
6. 驗證沒有成功送出 `POST /api/orders`。

### 未登入導向

1. 清除 `localStorage`。
2. 導航到 `/checkout`。
3. 預期導向 `/login`，且 redirect 指向 `/checkout`。

### 空購物車導向

1. 登入新測試帳號但不加入商品。
2. 導航到 `/checkout`。
3. 預期導向 `/cart`。

### 付款失敗

1. 建立待付款訂單。
2. 使用綠界測試頁或本機模擬產生失敗付款。
3. 預期導回 `/orders/:id?payment=failed`。
4. 頁面應出現 `付款未完成` 或 `付款發生問題`。
5. 用 `GET /api/orders/:id` 驗證 `status=pending`、`payment_status=failed`。
6. 預期頁面出現 `重新付款` 或 `前往綠界付款`。

### 重新付款

1. 在付款失敗訂單詳情頁點 `重新付款` 或 `前往綠界付款`。
2. 預期呼叫 `POST /api/orders/:id/ecpay-checkout`。
3. 回應應含 `payment.fields.MerchantTradeNo` 與 `payment.fields.CheckMacValue`。
4. 再模擬付款成功後，訂單應更新為 `status=paid`、`payment_status=paid`。

### 已付款訂單不可再次建立付款請求

1. 對已付款訂單呼叫 `POST /api/orders/:id/ecpay-checkout`。
2. 預期 API 失敗，訊息應為 `只有尚未付款完成的訂單可以建立綠界付款請求` 或同等語意。

## 建議補測

- `CheckMacValue` 錯誤時，`POST /api/payments/ecpay/return` 不可把訂單改成已付款。
- `TradeAmt` 與訂單金額不一致時，不可更新付款狀態。
- 同一筆成功回呼重送時，訂單應維持 paid，不能破壞資料。
- 付款取消應導回 `payment=cancel`，並顯示取消或處理中提示。
- 庫存不足時，加入購物車或建立訂單應失敗，且不得建立異常訂單。
- 使用 `browser_resize({ width: 390, height: 844 })` 跑一次結帳與訂單詳情，確認手機版按鈕可點、文字不重疊。
- 流程結束後檢查 `browser_console_messages({ level: 'error', all: true })`，不能有未處理例外。

## 回報格式

完成測試後回報：

- base URL、測試帳號、商品 ID、訂單 ID、訂單編號、`MerchantTradeNo`。
- 正常流程是否完成，最終 `status` 與 `payment_status`。
- 每個異常情境的操作、預期結果、實際結果。
- 關鍵 API 請求的狀態碼與回應摘要。
- 是否使用真實綠界測試頁；若使用本機模擬，必須明確註明。
- 若失敗，提供重現步驟、錯誤訊息、console error、API 回應摘要；必要時附截圖檔名。

## 注意事項

- 不要使用正式金流環境或真實信用卡。
- 不要回報 `.env`、金流密鑰、JWT 或完整個資。
- 測試資料使用唯一 Email，避免和既有會員衝突。
- 不要只用截圖判斷成功；必須驗證 API 與訂單狀態。
- 若需要新增測試檔，沿用本專案 CommonJS、2 空白縮排、分號與繁體中文用語。
