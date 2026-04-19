# 路由總表

本文件整理目前專案的頁面路由與 API 路由，方便在開發、除錯與功能擴充時快速查表。

## 1. 頁面路由

所有頁面路由由 `src/routes/pageRoutes.js` 負責，並透過 EJS layout 與 `pageScript` 載入對應前端腳本。

| 路徑 | 用途 | Layout | 前端腳本 |
| --- | --- | --- | --- |
| `/` | 首頁 | `views/layouts/front.ejs` | `public/js/pages/index.js` |
| `/products/:id` | 商品詳情頁 | `views/layouts/front.ejs` | `public/js/pages/product-detail.js` |
| `/cart` | 購物車頁 | `views/layouts/front.ejs` | `public/js/pages/cart.js` |
| `/checkout` | 結帳頁 | `views/layouts/front.ejs` | `public/js/pages/checkout.js` |
| `/login` | 登入／註冊頁 | `views/layouts/front.ejs` | `public/js/pages/login.js` |
| `/orders` | 我的訂單列表 | `views/layouts/front.ejs` | `public/js/pages/orders.js` |
| `/orders/:id` | 訂單詳情頁 | `views/layouts/front.ejs` | `public/js/pages/order-detail.js` |
| `/admin/products` | 後台商品管理頁 | `views/layouts/admin.ejs` | `public/js/pages/admin-products.js` |
| `/admin/orders` | 後台訂單管理頁 | `views/layouts/admin.ejs` | `public/js/pages/admin-orders.js` |

## 2. 認證相關 API

對應檔案：`src/routes/authRoutes.js`

| Method | 路徑 | 用途 | 權限 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 註冊新會員 | 公開 |
| `POST` | `/api/auth/login` | 會員登入 | 公開 |
| `GET` | `/api/auth/profile` | 取得目前登入者資料 | JWT |

## 3. 前台商品 API
## 4. 購物車 API

對應檔案：`src/routes/cartRoutes.js`

購物車採雙模式驗證：

- 若帶 `Authorization: Bearer <token>`，以會員身分操作
- 若未登入，改用 `X-Session-Id` 識別訪客購物車

| Method | 路徑 | 用途 | 權限 |
| --- | --- | --- | --- |
| `GET` | `/api/cart` | 取得購物車內容 | JWT 或 Session |
| `POST` | `/api/cart` | 加入商品至購物車 | JWT 或 Session |
| `PATCH` | `/api/cart/:itemId` | 更新購物車數量 | JWT 或 Session |
| `DELETE` | `/api/cart/:itemId` | 刪除購物車項目 | JWT 或 Session |

## 5. 前台訂單 API

對應檔案：`src/routes/orderRoutes.js`

| Method | 路徑 | 用途 | 權限 |
| --- | --- | --- | --- |
| `POST` | `/api/orders` | 建立訂單 | JWT |
| `GET` | `/api/orders` | 查詢我的訂單列表 | JWT |
| `GET` | `/api/orders/:id` | 查詢我的訂單詳情 | JWT |
| `PATCH` | `/api/orders/:id/pay` | 模擬付款成功或失敗 | JWT |

## 6. 後台商品 API

對應檔案：`src/routes/adminProductRoutes.js`

所有路由都先經過：

- `authMiddleware`
- `adminMiddleware`

| Method | 路徑 | 用途 | 權限 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/products` | 後台商品列表 | 管理員 |
| `POST` | `/api/admin/products` | 新增商品 | 管理員 |
| `PUT` | `/api/admin/products/:id` | 編輯商品 | 管理員 |
| `DELETE` | `/api/admin/products/:id` | 刪除商品 | 管理員 |

## 7. 後台訂單 API

對應檔案：`src/routes/adminOrderRoutes.js`

所有路由都先經過：

- `authMiddleware`
- `adminMiddleware`

| Method | 路徑 | 用途 | 權限 |
| --- | --- | --- | --- |
| `GET` | `/api/admin/orders` | 後台訂單列表，可用 `status` 篩選 | 管理員 |
| `GET` | `/api/admin/orders/:id` | 後台訂單詳情 | 管理員 |

## 8. Middleware 對照

| Middleware | 檔案 | 用途 |
| --- | --- | --- |
| `sessionMiddleware` | `src/middleware/sessionMiddleware.js` | 從 `X-Session-Id` 讀取訪客 session |
| `authMiddleware` | `src/middleware/authMiddleware.js` | 驗證 JWT 並設定 `req.user` |
| `adminMiddleware` | `src/middleware/adminMiddleware.js` | 限制只有管理員可存取 |
| `errorHandler` | `src/middleware/errorHandler.js` | 統一未攔截錯誤回應 |

## 9. 開發提醒

- 新增頁面時，除了補 `pageRoutes.js`，也要確認是否需要對應的 `views/pages/*.ejs` 與 `public/js/pages/*.js`。
- 新增 API 時，請同步補上：
  - 權限控制
  - OpenAPI 註解
  - `tests/` 對應測試
  - `docs/FEATURES.md` 與必要文件更新
- 若路由會影響購物車、訂單或登入狀態，需額外確認前端 `auth.js`、`api.js`、`header-init.js` 是否需要同步調整。
