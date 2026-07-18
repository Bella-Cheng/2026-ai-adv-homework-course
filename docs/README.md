# 文件目錄

本目錄整理專案開發、架構、資料模型與規劃紀錄，建議把這份文件當成 `docs/` 的入口索引。若只想快速找到該看哪份文件，可以先從這裡開始。

## 文件用途

### `ARCHITECTURE.md`

說明專案整體架構、目錄分工、啟動流程與前後端資料流。  
適合在需要理解模組責任、頁面與 API 串接方式、或資料如何在 middleware / route / database 之間流動時閱讀。

### `DATA_MODEL.md`

整理 SQLite 資料表、欄位用途、表間關係與核心資料流程。  
適合在調整資料表、訂單、購物車、庫存、會員資料或 transaction 邏輯時查閱。

### `DEVELOPMENT.md`

定義本專案的開發規範，包括程式風格、命名、繁體中文用語與錯誤處理格式。  
所有實作或文件修改前都應先確認這份規範。

### `FEATURES.md`

盤點目前專案已經完成的功能範圍，避免重複開發或漏補相依流程。  
適合在新增功能前先確認「這個功能到底已經有沒有做過」。

### `ROUTES.md`

整理頁面路由、前後台 API 路由與 middleware 對照。  
適合在新增或修改頁面、API、權限控制與路由規格時快速查表。

## 規劃與封存

### `plans/`

存放功能規劃、實作紀錄與階段性變更說明。

### `plans/archive/`

存放已完成或已封存的規劃紀錄，作為後續追查設計決策、環境設定與功能演進背景的參考。  
這個資料夾主要看用途與歷史脈絡，不需要當成日常開發的第一閱讀入口。

## 建議閱讀路徑

- 小型前端或文案調整：`DEVELOPMENT.md` + `FEATURES.md`
- 新增或修改 API：`DEVELOPMENT.md` + `ROUTES.md` + `FEATURES.md`
- 跨模組功能調整：`DEVELOPMENT.md` + `ARCHITECTURE.md` + `FEATURES.md`
- 涉及資料庫、購物車、訂單、庫存或 transaction：`DEVELOPMENT.md` + `DATA_MODEL.md` + `ARCHITECTURE.md`
