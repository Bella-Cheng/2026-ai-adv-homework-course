# 花禮電商後端專案

## AI 開發工具說明

本專案為六角學院 AI 開發課的練習專案，開發過程中以 **Codex CLI** 作為主要的 AI 開發工具。

這份專案的重點不只是完成功能，而是實際練習如何把 AI 納入日常開發流程。Codex CLI 在本專案中主要協助以下工作：

- 協助理解需求與拆解功能
- 協助撰寫與延伸既有程式碼
- 協助整理 API、路由、資料模型與文件內容
- 協助補充測試案例與除錯
- 協助撰寫 README 與開發相關文件

因此，這份作品除了展示電商系統功能，也展示了如何以 AI 工具輔助專案開發、文件整理與維護流程。

## 專案內容

本專案以 Node.js、Express、SQLite 建立，前台頁面採 EJS 伺服器端渲染，提供會員認證、商品瀏覽、購物車、訂單流程，以及管理員後台商品與訂單管理功能。

## 專案特色

- 前後端同專案維護，支援 EJS 頁面與 RESTful API
- JWT 會員認證，含註冊、登入、個人資料查詢
- 商品列表與商品詳情 API，支援分頁查詢
- 購物車支援訪客 `X-Session-Id` 與會員 JWT 雙模式
- 訂單建立流程含 transaction、扣庫存、清空購物車
- 管理員可管理商品與查詢訂單
- 內建 OpenAPI 文件產生與 Vitest/Supertest 測試
- 啟動時自動初始化 SQLite schema 與種子資料

## 技術棧

- Node.js
- Express 4
- EJS
- SQLite + `better-sqlite3`
- JWT + `jsonwebtoken`
- Tailwind CSS CLI
- Vitest
- Supertest
- Swagger JSDoc

## 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 建立環境變數

將 `.env.example` 複製成 `.env`，至少設定 `JWT_SECRET`。

```env
JWT_SECRET=your-jwt-secret-key-here
BASE_URL=http://localhost:3001
FRONTEND_URL=http://localhost:5173

ADMIN_EMAIL=admin@hexschool.com
ADMIN_PASSWORD=12345678

ECPAY_MERCHANT_ID=3002607
ECPAY_HASH_KEY=pwFHCqoQZGmho4w6
ECPAY_HASH_IV=EkRm7iFT261dpevs
ECPAY_ENV=staging
```

### 3. 啟動專案

正式啟動：

```bash
npm run start
```

僅啟動後端：

```bash
npm run dev:server
```

開發 Tailwind CSS：

```bash
npm run dev:css
```

預設服務網址為 `http://localhost:3001`。

## 可用指令

| 指令 | 說明 |
| --- | --- |
| `npm run start` | 先建置 Tailwind CSS，再啟動伺服器 |
| `npm run dev:server` | 啟動 Node.js 後端 |
| `npm run dev:css` | 監看 `public/css/input.css` 並輸出樣式 |
| `npm run css:build` | 建置壓縮版 Tailwind CSS |
| `npm run test` | 執行 Vitest 測試 |
| `npm run openapi` | 根據路由註解產生 `openapi.json` |

## 預設資料

系統啟動時會自動：

- 建立 SQLite 資料表
- 開啟 WAL 模式
- 建立管理員帳號
- 建立 8 筆花禮商品種子資料

若未自行覆寫 `.env`，預設管理員帳號為：

- Email：`admin@hexschool.com`
- Password：`12345678`

## 核心功能

### 前台功能

- 首頁商品列表
- 商品詳情頁
- 會員註冊、登入、取得個人資料
- 訪客／會員購物車
- 建立訂單、查詢訂單列表與訂單詳情
- 模擬付款成功或失敗

### 後台功能

- 商品列表、新增、編輯、刪除
- 訂單列表、訂單詳情、狀態篩選

## 路由總覽

### 頁面路由

| 路徑 | 說明 |
| --- | --- |
| `/` | 首頁 |
| `/products/:id` | 商品詳情頁 |
| `/cart` | 購物車頁 |
| `/checkout` | 結帳頁 |
| `/login` | 登入／註冊頁 |
| `/orders` | 我的訂單列表 |
| `/orders/:id` | 訂單詳情頁 |
| `/admin/products` | 後台商品管理頁 |
| `/admin/orders` | 後台訂單管理頁 |

### API 路由

| Method | 路徑 | 說明 | 權限 |
| --- | --- | --- | --- |
| `POST` | `/api/auth/register` | 註冊會員 | 公開 |
| `POST` | `/api/auth/login` | 會員登入 | 公開 |
| `GET` | `/api/auth/profile` | 取得個人資料 | JWT |
| `GET` | `/api/products` | 商品列表 | 公開 |
| `GET` | `/api/products/:id` | 商品詳情 | 公開 |
| `GET` | `/api/cart` | 取得購物車 | JWT 或 Session |
| `POST` | `/api/cart` | 加入購物車 | JWT 或 Session |
| `PATCH` | `/api/cart/:itemId` | 更新購物車數量 | JWT 或 Session |
| `DELETE` | `/api/cart/:itemId` | 刪除購物車項目 | JWT 或 Session |
| `POST` | `/api/orders` | 建立訂單 | JWT |
| `GET` | `/api/orders` | 我的訂單列表 | JWT |
| `GET` | `/api/orders/:id` | 我的訂單詳情 | JWT |
| `PATCH` | `/api/orders/:id/pay` | 模擬付款 | JWT |
| `GET` | `/api/admin/products` | 後台商品列表 | 管理員 |
| `POST` | `/api/admin/products` | 新增商品 | 管理員 |
| `PUT` | `/api/admin/products/:id` | 編輯商品 | 管理員 |
| `DELETE` | `/api/admin/products/:id` | 刪除商品 | 管理員 |
| `GET` | `/api/admin/orders` | 後台訂單列表 | 管理員 |
| `GET` | `/api/admin/orders/:id` | 後台訂單詳情 | 管理員 |

## API 回應格式

成功回應：

```json
{
  "data": {},
  "error": null,
  "message": "成功"
}
```

失敗回應：

```json
{
  "data": null,
  "error": "VALIDATION_ERROR",
  "message": "欄位驗證失敗"
}
```

## 專案結構

```text
.
├─ app.js                     # Express 設定、middleware、API 與頁面 routes
├─ server.js                  # HTTP 啟動入口
├─ src/
│  ├─ database.js             # SQLite schema、seed、初始化
│  ├─ middleware/             # 認證、session、錯誤處理等 middleware
│  └─ routes/                 # API 與頁面路由
├─ public/
│  ├─ css/                    # Tailwind 輸入與輸出
│  ├─ js/                     # 共用前端腳本
│  └─ stylesheets/            # 其他靜態樣式
├─ views/
│  ├─ layouts/                # 前後台 layout
│  ├─ pages/                  # EJS 頁面
│  └─ partials/               # 共用區塊
├─ tests/                     # Vitest + Supertest 測試
└─ docs/                      # 專案文件
```

## 測試與文件

執行測試：

```bash
npm test
```

產生 OpenAPI 文件：

```bash
npm run openapi
```

專案文件位於 `docs/`：

- `docs/DEVELOPMENT.md`：開發規範
- `docs/FEATURES.md`：功能清單
- `docs/ARCHITECTURE.md`：系統架構與資料流
- `docs/ROUTES.md`：路由總表
- `docs/DATA_MODEL.md`：資料模型說明

## 開發提醒

- 後端程式統一使用 CommonJS
- 文件、錯誤訊息與介面文案使用繁體中文
- 修改 API 或 middleware 時，至少補 1 個成功案例與 1 個失敗案例
- 新增 API 時同步補上 OpenAPI 註解與 `tests/`
- 不要提交 `.env`、正式環境密鑰與本機 SQLite 暫存檔

## 授權

此專案供學習與作業練習使用。
