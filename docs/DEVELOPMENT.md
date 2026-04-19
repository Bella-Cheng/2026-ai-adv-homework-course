# 開發規範

本文件是本專案的強制開發基準。所有 Agent 與貢獻者在修改程式碼時，都必須優先遵守這份規範；若與個人習慣衝突，請以本文件為準。

## 1. 基本原則

- 文件、註解、介面文案、錯誤訊息一律使用繁體中文。
- 所有新檔案與修改內容必須使用 UTF-8 編碼，避免出現中文亂碼。
- 修改時優先延續既有寫法，不要混入新的框架風格或語法偏好。
- 每次變更應聚焦單一功能，不要順手重構無關檔案。

## 2. 後端 JavaScript 風格

後端檔案包含 `app.js`、`server.js`、`src/routes/`、`src/middleware/`、`src/database.js`。

- 模組系統固定使用 CommonJS：`require(...)` 與 `module.exports`。
- 預設使用 `const`；只有在值會重新指定時才使用 `let`。
- 不要在後端新程式碼使用 `var`。
- 縮排固定 2 個空白，保留分號。
- 優先使用 `function 名稱() {}` 或具名 handler，避免濫用匿名箭頭函式串接過長邏輯。
- 路由處理器內的邏輯要短小；重複流程應抽成區域 helper 或 middleware。

範例：

```js
function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

## 3. 前端 JavaScript 風格

前端檔案位於 `public/js/` 與 `public/js/pages/`，目前以瀏覽器腳本與 Vue 全域 API 為主。

- 延續現有寫法，允許使用 `const` 搭配 `function` 宣告。
- 既有檔案若已使用 `var` 與 `function`，可在同檔延續，但不要新增 ES module、TypeScript 或打包器語法。
- DOM 事件、API 呼叫、提示訊息應保持簡潔，避免在頁面檔中塞入大型商業邏輯。
- 同一頁面腳本的命名需與模板對齊，例如 `views/pages/orders.ejs` 對應 `public/js/pages/orders.js`。

## 4. 命名規則

- 變數與函式使用 `camelCase`，例如 `orderItems`、`loadCart`。
- 類常數與環境變數使用 `UPPER_SNAKE_CASE`，例如 `JWT_SECRET`。
- 路由檔使用描述性名稱，並以資源為中心：`productRoutes.js`、`adminOrderRoutes.js`。
- middleware 檔名以職責命名：`authMiddleware.js`、`errorHandler.js`。
- 不使用縮寫不明的名稱，例如 `d`, `tmp`, `handleIt`；名稱必須能直接看出用途。

## 5. 中文用語規範

- 一律使用繁體中文，不使用簡體中文。
- 同一概念用詞保持一致：
  - `使用者`，不要混用 `用户`
  - `購物車`，不要混用 `購物籃`
  - `訂單`，不要混用 `工單`
  - `登入` / `註冊` / `管理員` 採固定寫法
- API 欄位名稱維持既有英文命名；對外訊息與畫面文字使用繁體中文。
- 若需新增中文訊息，語氣應直接、清楚，不要口語化或混用中英。

## 6. 錯誤處理模式

所有 API 回應必須維持既有格式：

```json
{
  "data": null,
  "error": "VALIDATION_ERROR",
  "message": "欄位驗證失敗"
}
```

強制規則如下：

- 成功回應：`error` 必須為 `null`，`data` 放實際資料。
- 失敗回應：`data` 必須為 `null`，`error` 使用穩定的錯誤代碼，`message` 提供可讀的繁體中文訊息。
- 驗證錯誤優先回傳 `400`，未授權回傳 `401`，禁止存取回傳 `403`，查無資料回傳 `404`，衝突回傳 `409`。
- 不要把資料庫錯誤、堆疊、JWT 細節直接暴露給前端。
- 共用錯誤處理優先交給 `src/middleware/errorHandler.js`；若在 route 內可明確判斷，直接回傳一致格式。

## 7. 資料庫與商業邏輯

- SQLite 存取統一透過 `better-sqlite3` 與 `src/database.js`。
- 涉及多步驟寫入的流程必須使用 transaction，例如建立訂單、扣庫存、清空購物車。
- schema、seed、查詢欄位名稱應延續既有命名，不自行重命名資料表欄位。

## 8. 測試與交付要求

- 修改 API 或 middleware 時，必須同步更新 `tests/` 中對應的 `*.test.js`。
- 至少涵蓋 1 個成功案例與 1 個失敗案例。
- 新增 API 時，應補上 OpenAPI 註解，並確認 `npm run openapi` 可產生正確文件。
- 交付前至少執行 `npm test`；若未執行，需明確註明原因。

## 9. Agent 產碼禁止事項

- 不要混入簡體中文。
- 不要新增與現況不一致的程式風格，例如把 CommonJS 改成 ESM。
- 不要改動無關檔案格式。
- 不要自行更換 API 回應結構。
- 不要輸出含糊命名、過度抽象的 helper，或與現有資料流不一致的設計。
