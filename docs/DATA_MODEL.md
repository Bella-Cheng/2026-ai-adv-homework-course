# 資料模型說明

本文件整理目前專案的 SQLite 資料表、欄位用途、表間關係與主要資料流，作為開發與維護時的查閱基準。

## 1. 資料庫位置與來源

- 資料庫檔案：`database.sqlite`
- 初始化入口：`src/database.js`
- 使用套件：`better-sqlite3`

系統啟動時會由 `src/database.js` 自動：

1. 建立資料表
2. 開啟 WAL 模式
3. 建立管理員種子帳號
4. 建立商品種子資料

## 2. 資料表總覽

目前核心資料表如下：

- `users`
- `products`
- `cart_items`
- `orders`
- `order_items`

## 3. users

用途：儲存一般會員與管理員帳號資料。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `TEXT` | 主鍵，UUID |
| `email` | `TEXT` | 使用者 Email，唯一值 |
| `password_hash` | `TEXT` | bcrypt 雜湊後密碼 |
| `name` | `TEXT` | 使用者名稱 |
| `role` | `TEXT` | 角色，僅允許 `user` 或 `admin` |
| `created_at` | `TEXT` | 建立時間 |

補充：

- 預設管理員帳號來自 `.env` 的 `ADMIN_EMAIL` 與 `ADMIN_PASSWORD`
- JWT 內容會帶出 `userId`、`email`、`role`

## 4. products

用途：儲存商品資料與庫存。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `TEXT` | 主鍵，UUID |
| `name` | `TEXT` | 商品名稱 |
| `description` | `TEXT` | 商品描述 |
| `price` | `INTEGER` | 商品價格，必須大於 0 |
| `stock` | `INTEGER` | 庫存數量，不得小於 0 |
| `image_url` | `TEXT` | 商品圖片網址 |
| `created_at` | `TEXT` | 建立時間 |
| `updated_at` | `TEXT` | 更新時間 |

補充：

- 前台商品列表與商品詳情都來自此表
- 建立訂單時會依此表檢查庫存並扣減 `stock`

## 5. cart_items

用途：儲存購物車項目，支援訪客與登入會員雙模式。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `TEXT` | 主鍵，UUID |
| `session_id` | `TEXT` | 訪客購物車識別碼 |
| `user_id` | `TEXT` | 已登入會員 ID |
| `product_id` | `TEXT` | 對應商品 ID |
| `quantity` | `INTEGER` | 數量，必須大於 0 |

補充：

- 訪客模式時使用 `session_id`
- 會員模式時使用 `user_id`
- `product_id` 連到 `products.id`
- 同一筆購物車資料不會同時依賴前後兩種身分邏輯，實務上會以其中一種為主

## 6. orders

用途：儲存訂單主檔。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `TEXT` | 主鍵，UUID |
| `order_no` | `TEXT` | 訂單編號，唯一值 |
| `user_id` | `TEXT` | 下單會員 ID |
| `recipient_name` | `TEXT` | 收件人姓名 |
| `recipient_email` | `TEXT` | 收件人 Email |
| `recipient_address` | `TEXT` | 收件地址 |
| `total_amount` | `INTEGER` | 訂單總金額 |
| `status` | `TEXT` | 訂單狀態，允許 `pending`、`paid`、`failed` |
| `created_at` | `TEXT` | 建立時間 |

補充：

- 訂單只允許登入會員建立，不支援純訪客下單
- `order_no` 由 `orderRoutes.js` 動態產生

## 7. order_items

用途：儲存訂單明細。

| 欄位 | 型別 | 說明 |
| --- | --- | --- |
| `id` | `TEXT` | 主鍵，UUID |
| `order_id` | `TEXT` | 所屬訂單 ID |
| `product_id` | `TEXT` | 商品 ID |
| `product_name` | `TEXT` | 下單當下的商品名稱快照 |
| `product_price` | `INTEGER` | 下單當下的商品價格快照 |
| `quantity` | `INTEGER` | 購買數量 |

補充：

- 明細保留商品名稱與價格快照，避免商品後續修改影響歷史訂單內容
- `order_id` 連到 `orders.id`

## 8. 表間關係

可用以下方式理解關聯：

- `users (1) -> (N) orders`
- `users (1) -> (N) cart_items`
- `products (1) -> (N) cart_items`
- `orders (1) -> (N) order_items`
- `products (1) -> (N) order_items`

補充說明：

- `cart_items.user_id` 與 `orders.user_id` 都對應 `users.id`
- `cart_items.session_id` 是訪客模式的識別欄位，不連到其他資料表

## 9. 主要資料流

### 商品瀏覽

1. 前端呼叫 `products` API
2. 後端從 `products` 查詢列表或單筆商品
3. 回傳給頁面渲染使用

### 加入購物車

1. 前端送出 `productId` 與 `quantity`
2. 後端依 JWT 或 `X-Session-Id` 判斷擁有者
3. 寫入或更新 `cart_items`
4. 同步檢查 `products.stock`

### 建立訂單

1. 後端從 `cart_items` 撈出目前會員的購物車
2. 關聯 `products` 取得價格與庫存
3. 建立 `orders`
4. 建立 `order_items`
5. 扣除 `products.stock`
6. 清除該會員的 `cart_items`

## 10. 開發提醒

- 新增欄位時，需同步檢查：
  - `src/database.js` schema
  - 對應 route 的驗證與寫入邏輯
  - 測試資料與斷言
  - OpenAPI 註解
  - `docs/` 相關文件
- 若變更訂單、庫存或購物車欄位，優先確認 transaction 是否仍完整。
- 若調整角色或登入資訊，需同步檢查 JWT payload 與 `authMiddleware` 的解析邏輯。
