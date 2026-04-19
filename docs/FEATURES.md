# 功能清單

本文件用來盤點目前專案已實作的功能，作為新增功能前的快速檢查基準，避免重複開發、漏改測試或忽略相依流程。

## 1. 前台頁面功能

目前已提供以下前台頁面：

- 首頁 `/`
- 商品詳情 `/products/:id`
- 購物車 `/cart`
- 結帳頁 `/checkout`
- 登入／註冊頁 `/login`
- 訂單列表 `/orders`
- 訂單詳情 `/orders/:id`

頁面由 `src/routes/pageRoutes.js` 負責 render，並透過 `pageScript` 對應 `public/js/pages/*.js` 處理互動與 API 呼叫。

## 2. 會員與驗證功能

已實作的會員功能如下：

- 使用者註冊 `POST /api/auth/register`
- 使用者登入 `POST /api/auth/login`
- 取得目前會員資料 `GET /api/auth/profile`
- JWT 驗證機制
- 前端 localStorage 保存 token 與使用者資訊
- 管理員角色判斷 `Auth.isAdmin()`

現況說明：

- 後端透過 `authMiddleware` 驗證 Bearer Token。
- `server.js` 啟動時必須提供 `JWT_SECRET`。
- 管理員帳號由 `src/database.js` 在初始化時自動建立。

## 3. 商品功能

前台商品功能：

- 商品列表查詢 `GET /api/products`
- 商品詳情查詢 `GET /api/products/:id`
- 支援分頁參數 `page`、`limit`

後台商品管理功能：

- 商品列表查詢 `GET /api/admin/products`
- 新增商品 `POST /api/admin/products`
- 編輯商品 `PUT /api/admin/products/:id`
- 刪除商品 `DELETE /api/admin/products/:id`

已包含的規則：

- 價格必須大於 0
- 庫存不得小於 0
- 若商品存在待付款訂單中，禁止刪除

## 4. 購物車功能

購物車採雙模式設計，支援訪客與已登入會員：

- 取得購物車 `GET /api/cart`
- 加入購物車 `POST /api/cart`
- 修改數量 `PATCH /api/cart/:itemId`
- 刪除項目 `DELETE /api/cart/:itemId`

已包含的規則：

- 訪客以 `X-Session-Id` 識別購物車
- 已登入會員以 `user_id` 識別購物車
- 加入與修改數量時會檢查庫存
- Header 會顯示購物車 badge 數量

## 5. 訂單功能

前台會員訂單功能：

- 建立訂單 `POST /api/orders`
- 查詢我的訂單 `GET /api/orders`
- 查詢訂單詳情 `GET /api/orders/:id`
- 模擬付款結果 `PATCH /api/orders/:id/pay`

建立訂單時已包含：

- 驗證收件人姓名、Email、地址
- 檢查購物車是否為空
- 檢查商品庫存
- 使用 transaction 建立訂單、寫入明細、扣庫存、清空購物車

後台訂單功能：

- 訂單列表查詢 `GET /api/admin/orders`
- 訂單詳情查詢 `GET /api/admin/orders/:id`
- 支援依 `status` 篩選訂單

## 6. 權限與角色控制

目前已實作的權限規則如下：

- 前台商品瀏覽不需登入
- 購物車允許訪客與會員使用
- 建立訂單、查詢我的訂單需登入
- 後台商品與訂單 API 需同時通過登入與管理員權限檢查
- 前端登入狀態會影響 header 導覽與後台入口顯示

## 7. 文件與測試覆蓋

目前已有的支援項目：

- OpenAPI 註解已寫在多數 route 檔案中
- 可透過 `npm run openapi` 產生 `openapi.json`
- 測試檔已涵蓋：
  - `auth.test.js`
  - `products.test.js`
  - `cart.test.js`
  - `orders.test.js`
  - `adminProducts.test.js`
  - `adminOrders.test.js`

## 8. 新增功能前檢查清單

新增功能前請先確認以下事項：

- 是否已有相同或相近 API
- 是否已有對應頁面與前端腳本
- 是否需要補 admin 權限或登入驗證
- 是否會影響購物車、訂單或庫存流程
- 是否需要補 OpenAPI 註解
- 是否需要更新或新增 `tests/*.test.js`
- 是否需要同步更新 `ARCHITECTURE.md`、`DEVELOPMENT.md` 或其他 `docs/` 文件

## 9. 目前尚未看到的功能

以下能力目前在程式中未看到完整實作，新增時可視為新功能而非延伸修改：

- 忘記密碼／重設密碼
- 會員資料編輯
- 商品分類、搜尋、排序
- 線上金流串接完成版
- 優惠券、折扣碼、促銷活動
- 訂單取消、退貨、退款流程
- 圖片上傳與檔案儲存管理
