# 專案架構總覽

本文件用來快速理解專案全貌，重點放在目錄結構、模組責任，以及資料如何在頁面、API、middleware 與 SQLite 之間流動。

## 1. 目錄結構

```text
.
├─ app.js                 # Express 入口，串接 middleware、API routes、頁面 routes
├─ server.js              # 啟動 HTTP 服務
├─ src/
│  ├─ database.js         # SQLite 初始化、建表、種子資料
│  ├─ middleware/         # 認證、session、權限、錯誤處理
│  └─ routes/             # 前台 API、後台 API、頁面路由
├─ public/
│  ├─ css/                # Tailwind 輸入與輸出
│  └─ js/                 # 共用前端腳本與各頁 Vue 程式
├─ views/
│  ├─ layouts/            # front/admin 版型
│  ├─ partials/           # header、footer、notification
│  └─ pages/              # 前台與後台 EJS 頁面
├─ tests/                 # Vitest + Supertest 測試
└─ docs/                  # 專案文件
```

## 2. 啟動流程

1. `server.js` 載入 `app.js`，檢查 `JWT_SECRET` 後啟動伺服器。
2. `app.js` 載入 `src/database.js`，建立資料表並補入管理員與商品種子資料。
3. Express 掛載共用 middleware：
   - `cors`
   - `express.json()`
   - `express.urlencoded()`
   - `sessionMiddleware`
4. 掛載 API routes 與頁面 routes，最後接上 404 與 `errorHandler`。

## 3. 模組分工

- `src/routes/pageRoutes.js`
  - 負責前台與後台頁面的 EJS render。
  - 透過 `pageScript` 參數決定要載入哪個 `public/js/pages/*.js`。
- `src/routes/productRoutes.js`
  - 提供前台商品列表與商品詳細 API。
- `src/routes/cartRoutes.js`
  - 管理購物車，支援 JWT 使用者與訪客 session 雙模式。
- `src/routes/orderRoutes.js`
  - 登入會員後可建立訂單、查詢訂單、模擬付款結果。
- `src/routes/adminProductRoutes.js`、`src/routes/adminOrderRoutes.js`
  - 後台管理 API，必須通過登入與管理員權限檢查。
- `src/middleware/authMiddleware.js`
  - 驗證 Bearer Token，解析 `req.user`。
- `src/middleware/sessionMiddleware.js`
  - 從 `X-Session-Id` 讀取訪客購物車識別。
- `src/middleware/errorHandler.js`
  - 統一處理未攔截錯誤，避免內部細節外洩。

## 4. 前台資料流

前台頁面採「EJS 畫面殼 + 前端 JS 呼叫 API」模式：

1. 使用者請求頁面，例如 `/cart`。
2. `pageRoutes.js` 渲染 `views/pages/cart.ejs`，再包進 `views/layouts/front.ejs`。
3. `front.ejs` 載入共用腳本：
   - `auth.js`：管理 token、使用者資訊、session id
   - `api.js`：統一 fetch 與 401 處理
   - `header-init.js`：初始化登入導覽與購物車 badge
4. 頁面專屬腳本，例如 `public/js/pages/cart.js`，呼叫 `/api/cart` 取得資料並更新畫面。

## 5. 購物車與會員雙軌流程

購物車是本專案最關鍵的資料流之一：

- 未登入使用者：
  - 前端透過 `Auth.getSessionId()` 產生並保存 `X-Session-Id`
  - `cartRoutes.js` 以 `session_id` 存取 `cart_items`
- 已登入使用者：
  - 前端帶入 `Authorization: Bearer <token>`
  - `authMiddleware` 或 `dualAuth` 解析 `user_id`
  - `cart_items` 改以 `user_id` 為擁有者

這表示購物車 API 同時支援訪客與會員，但訂單 API 僅允許登入會員使用。

## 6. 訂單資料流

建立訂單時的流程如下：

1. 前端結帳頁呼叫 `POST /api/orders`。
2. `orderRoutes.js` 驗證收件資料與登入狀態。
3. 從 `cart_items` 與 `products` 撈出購物車內容。
4. 檢查庫存是否足夠。
5. 以 transaction 一次完成：
   - 新增 `orders`
   - 新增 `order_items`
   - 扣除 `products.stock`
   - 清空使用者購物車
6. 回傳訂單編號、金額、狀態與品項資料。

後台則可透過 `/api/admin/orders` 查詢所有訂單，前台使用者只能看到自己的訂單。

## 7. 資料庫結構

核心資料表如下：

- `users`：會員與管理員帳號
- `products`：商品資料與庫存
- `cart_items`：購物車項目，可綁 `session_id` 或 `user_id`
- `orders`：訂單主檔
- `order_items`：訂單明細

`src/database.js` 是唯一資料庫初始化入口，也是理解 schema 與種子資料的第一站。

## 8. API 回應模式

所有 API 都維持一致格式：

```json
{
  "data": {},
  "error": null,
  "message": "成功訊息"
}
```

失敗時改為：

```json
{
  "data": null,
  "error": "VALIDATION_ERROR",
  "message": "繁體中文錯誤訊息"
}
```

這個格式同時影響前端顯示、測試斷言與錯誤處理邏輯。

## 9. 測試對應

`tests/` 以功能切分：

- `auth.test.js`
- `products.test.js`
- `cart.test.js`
- `orders.test.js`
- `adminProducts.test.js`
- `adminOrders.test.js`

測試主要透過 `supertest` 呼叫 `app.js` 匯出的 Express app，`tests/setup.js` 提供管理員登入與建立測試使用者的 helper。
