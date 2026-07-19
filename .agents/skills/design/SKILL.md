---
name: design
description: 用於 Bloom Club 花店 Figma 設計工作，包含首頁、登入頁、購物車、季節花束版型、共用元件、配色更新與純設計稿修改。使用此 skill 時必須使用 Figma MCP，且除非使用者明確要求程式修改，否則不要修改 EJS、Tailwind、JavaScript、後端程式或其他專案檔案。
---

# Bloom Club Figma Design Skill

## 執行規則

- 必須使用 Figma MCP。
- 只建立或修改 Figma 設計稿。
- 不要修改 EJS、Tailwind、JavaScript、後端程式、資料庫或其他專案程式碼。
- 修改前先確認目標 page / frame，避免改到舊版草稿。
- 目前設計基準是 `首頁｜Wix 2396 復古風 Layout`。
- 首頁、登入、購物車的 header、配色、卡片圓角、陰影與留白必須一致。

## Figma 檔案

- Figma file key: `2vdqjyeiunzsnIY0ZwekDf`
- 完成連結：`https://www.figma.com/design/2vdqjyeiunzsnIY0ZwekDf/%E5%85%AD%E8%A7%92AI%E8%AA%B2%E7%A8%8B---%E8%8A%B1%E5%BA%97?node-id=0-1&p=f&t=NhkEyuB4XoEzmhdY-0`

## 品牌定位

Bloom Club 是高質感花藝電商，定位為「依照每一季風格策劃當季花束」。

核心方向：

- 精品花藝
- 日系留白
- 復古宴會感
- 季節限定花束
- 沉穩、精緻、帶有手作花藝溫度

季節策略：

- 這一季：夏季風格花束
- 下一季：秋季風格花束
- 後續可依季節切換為春季、夏季、秋季、冬季系列

避免：

- 過重、過亮、過飽和的色彩
- 卡片避免四角全直角
- 與花店、花藝、花禮、季節感無關的文案

## 色彩與材質

使用目前 Figma 上已定稿的 Bloom Club 配色。

| Token | 色名 | HEX | 用途 |
| --- | --- | --- | --- |
| `cream` | 暖霧米白 | `#F4F1E8` | 頁面底色、大面積留白 |
| `ivory` | 象牙白 | `#FFFDF7` | 卡片、表單、商品資訊底 |
| `green` | 深森綠 | `#153A30` | Header、Footer、主要品牌識別 |
| `deep` | 墨綠黑 | `#0D211C` | Top bar、深色區塊 |
| `sage` | 鼠尾草綠 | `#9AA99B` | 輔助色、柔和狀態、標籤 |
| `brass` | 霧金 | `#C8A765` | CTA、價格、重點線條 |
| `blush` | 乾燥玫瑰 | `#D9B9AE` | 柔和點綴、提醒或失敗狀態 |
| `ink` | 墨黑 | `#1E211E` | 標題與主要文字 |
| `muted` | 灰橄欖 | `#6C6E66` | 說明文字、次要資訊 |
| `line` | 亞麻線 | `#D8D0C0` | 邊框、分隔線 |
| `photo` | 花材圖底 | `#EAE4D9` | 商品圖、分類圖、季節形象圖 placeholder |

配色比例：

- 大面積背景使用 `cream`
- 卡片、表單、商品資訊底使用 `ivory`
- Header / Footer 使用 `green` + `deep`
- CTA、價格、重要分隔線使用 `brass`
- 季節輔助色可使用 `sage`、`blush`
- 文字使用 `ink`、`muted`

材質方向：

- 紙感、亞麻、自然花材、柔霧光影
- 不使用亮面塑膠感、強烈霓虹、卡通貼紙感
- 商品圖可先使用 `photo` 色塊 placeholder，保留給使用者後續替換

## 季節花束規則

設計重點為「當季花束」。

### 夏季風格花束

這一季預設為夏季風格。

視覺語彙：

- 清爽、透氣、日光感
- 白色、淡粉、淡黃、淺綠花材
- 可搭配玻璃花器、自然藤編、亞麻布、米白背景

文案方向：

- 夏季花束
- 夏日花禮
- 清爽花材
- 當季限定
- 本季熱賣

### 秋季風格花束

下一季預設為秋季風格。

視覺語彙：

- 溫暖、沉穩、乾燥花材感
- 乾燥玫瑰、霧金、鼠尾草綠、奶茶色、深綠
- 可搭配紙材包裝、暖色光影、復古花器

文案方向：

- 秋季預購
- 秋日花禮
- 下季花束
- 預購通知
- 季節限定

## Header 規則

首頁、登入、購物車 header 必須一致。

結構：

- Top bar：高度 36px，背景 `deep`
- Main nav：高度 74px，背景 `green`
- 左側品牌：
  - `Bloom Club`
  - `Floral Studio`
- 中間導覽：
  - 首頁
  - 所有花藝商品
  - 本季熱賣
  - 下季預購
  - 登入 / 購物車
- 右側通知(未來功能，此階段暫不規劃)：
  - 文字 `通知`
  - 小鈴鐺 icon

鈴鐺 icon 使用簡潔線性圖示，顏色優先用 `brass`。

## 卡片與元件規則

- 商品卡片 border radius：8px
- 商品圖 placeholder border radius：8px，並開啟裁切
- 分類圖卡片 border radius：8px
- 分類與商品卡片使用柔和雙層陰影，避免死硬平面感
- 卡片邊框使用 `line`
- CTA 優先使用 `brass` 底色、`deep` 文字
- 次要按鈕使用 `green` 或 outline

## 頁面設計重點

### 首頁

必備區塊：

- Header
- Hero
- 探索花禮分類
- 精選商品
- 所有花藝商品
- 本季熱賣
- 下季預購通知
- 顧客花束好評分享
- Footer

「所有花藝商品」：

- 使用現有商品資料
- 每列卡片間距 96px
- 卡片與上方商品圖皆為 8px 圓角

「下季預購通知」：

- 以秋季風格花束作為下一季方向
- 卡片只需要中英文名稱與預購按鈕，不要放過多說明

### 登入

- Header 必須與首頁一致
- 背景使用 `cream`
- 登入卡片使用 `ivory`、8px 圓角、柔和陰影
- 表單欄位使用 `cream` 或淡色底，邊框使用 `line`
- 登入 CTA 使用 `brass`
- 視覺區只放花藝、季節花束或品牌形象 placeholder

### 購物車

- Header 必須與首頁一致
- 花束卡片右上角要有 `X` 移除按鈕
- 商品圖片 placeholder 使用 8px 圓角
- 主要 layout 採左側花禮明細、右側訂單摘要
- 訂單摘要可使用 `green` 深色卡片搭配 `brass` CTA
- 需要設計一般、成功、失敗狀態

## 商品資料

設計商品卡時優先使用現有資料：

1. 粉色玫瑰花束 / Pink Rose Bouquet / NT$1680
2. 白色百合花禮盒 / White Lily Gift Box / NT$1280
3. 繽紛向日葵花束 / Sunflower Bouquet / NT$980
4. 紫色鬱金香盆栽 / Purple Tulip Pot / NT$750
5. 乾燥花藝術花圈 / Dried Flower Wreath / NT$1450
6. 迷你多肉組合盆 / Mini Succulent Set / NT$580
7. 經典紅玫瑰花束 / Classic Red Rose Bouquet / NT$3980
8. 季節鮮花訂閱（月配） / Monthly Flower Subscription / NT$890

## 顧客評論

可使用 3 則評論：

- 李小姐：花束非常漂亮，包裝精緻，送給媽媽她超開心的！配送也很準時。
- 張小姐：第二次購買了，品質一如既往的好。花材新鮮，整體搭配很有美感。
- 王先生：女朋友收到花束超感動！會再回購的，推薦給大家！

## 交付檢查

完成 Figma 修改後，回覆使用者時確認：

- 修改了哪些 page / frame
- 是否同步目前標準配色
- 是否改為季節花束定位
- 是否取消 IP / 聯名方向
- 是否維持 header 一致
- 是否未修改程式碼



