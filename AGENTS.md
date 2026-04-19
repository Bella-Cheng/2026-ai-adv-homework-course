# Repository Guidelines

## 專案結構與模組分工
本專案是以 Node.js 建立的電商後端，前台頁面使用 EJS 伺服器端渲染。`app.js` 負責串接 middleware、API routes 與頁面 routes，`server.js` 負責啟動 HTTP 服務。後端主要程式放在 `src/`：`src/routes/` 放 Express 路由模組，`src/middleware/` 放共用請求處理邏輯，`src/database.js` 負責 SQLite 初始化與種子資料。前端靜態資源位於 `public/`，其中 `public/js/pages/` 放頁面腳本，`public/css/` 放 Tailwind 輸入與輸出檔。樣板放在 `views/`，依 `layouts/`、`pages/`、`partials/` 分類。測試檔集中在 `tests/`。

## 建置、測試與開發指令
先執行 `npm install` 安裝依賴。`npm run start` 會先建置 Tailwind CSS，再以 `PORT` 或預設 `3001` 啟動伺服器。`npm run dev:server` 適合只修改後端程式時使用；`npm run dev:css` 會監看 `public/css/input.css`，適合前端樣式開發。`npm test` 會執行一次 Vitest 測試。`npm run openapi` 會根據路由註解產生 `openapi.json`。

## 程式風格與命名規範
請沿用現有 CommonJS 寫法：使用 `require(...)`、`module.exports`、分號，並採用 2 個空白縮排。變數與函式使用 `camelCase`，環境變數使用 `UPPER_SNAKE_CASE`。路由檔名應清楚描述資源，例如 `adminProductRoutes.js`。新增模板與前端腳本時，請對齊現有命名，例如 `views/pages/orders.ejs` 搭配 `public/js/pages/orders.js`。

## 測試規範
測試框架使用 Vitest 與 Supertest。新增測試請放在 `tests/`，並使用 `*.test.js` 命名，例如 `products.test.js`。可重用 `tests/setup.js` 內的 helper 來取得管理員 token 或建立測試使用者。專案目前未設定 coverage 門檻，因此每次修改 route 或 middleware 時，至少補一個成功案例與一個失敗案例。

## Commit 與 Pull Request 規範
目前 git 歷史以簡短主旨為主，例如 `init`。後續 commit 建議維持簡潔、祈使句、單一範圍，例如 `add order status validation`。Pull Request 應說明行為變更、列出驗證方式（如 `npm test`）、註明環境變數或資料表異動；若有修改 EJS 頁面或前端資產，請附上畫面截圖。

## 安全性與設定提醒
本機開發前請先將 `.env.example` 複製為 `.env`。`server.js` 啟動前必須提供 `JWT_SECRET`。不要提交 `.env`、正式環境密鑰，或本機 SQLite 產物，例如 `database.sqlite-wal`。

## 文件閱讀指引
不需要每次都讀完整個專案，請先依任務類型選擇最小必要文件：

- 所有程式修改都先讀 `docs/DEVELOPMENT.md`，確認程式風格、命名、繁體中文用語與錯誤處理規範。
- 新增功能前先讀 `docs/FEATURES.md`，確認是否已有相同或相近功能，避免重複開發。
- 需要理解整體模組責任、前後端串接或資料流時，讀 `docs/ARCHITECTURE.md`。
- 調整頁面或 API 路由時，讀 `docs/ROUTES.md`。
- 牽涉資料表、購物車、訂單、庫存或 transaction 時，讀 `docs/DATA_MODEL.md`。

建議的最小組合如下：

- 小型前端或文案調整：`docs/DEVELOPMENT.md` + `docs/FEATURES.md`
- 新增或修改 API：`docs/DEVELOPMENT.md` + `docs/ROUTES.md` + `docs/FEATURES.md`
- 跨模組功能調整：`docs/DEVELOPMENT.md` + `docs/ARCHITECTURE.md` + `docs/FEATURES.md`
- 涉及資料庫或訂單流程：`docs/DEVELOPMENT.md` + `docs/DATA_MODEL.md` + `docs/ARCHITECTURE.md`
