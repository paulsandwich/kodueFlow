## Why

練習樂器時缺乏精準且直觀的節奏視覺化工具——現有節拍器 App 多為純音頻，無法提供小節進度、循環計數等視覺反饋。kodueFlow 是一個本地瀏覽器工具，同步輸出節拍器音效與視覺動畫，幫助音樂人在練習和編曲時更清楚感知節奏結構。

## What Changes

- 新增 `index.html`：主頁面，左側控制面板 + 右側視覺化區佈局
- 新增 `css/style.css`：淺色主題、節拍球動畫、小節網格樣式
- 新增 `js/scheduler.js`：基於 Web Audio API Look-ahead Scheduler 的精準音頻引擎
- 新增 `js/metronome.js`：節拍狀態機，管理 BPM、拍號、循環邏輯與 beatQueue
- 新增 `js/ui.js`：DOM 更新、requestAnimationFrame 動畫循環、事件綁定

## Capabilities

### New Capabilities

- `audio-engine`：Look-ahead Scheduler 音頻引擎，使用 AudioContext.currentTime 精準排程節拍音效（強拍 880Hz / 弱拍 440Hz / 細分 220Hz），透過 beatQueue 介面與視覺層同步
- `beat-visualizer`：節拍球視覺化，Scale + Glow 動畫（弱拍 scale 1.45 / 強拍 scale 1.6），與 beatQueue 對齊 audioContext.currentTime 觸發
- `measure-grid`：多小節進度網格，高亮顯示當前進行中的小節，支援循環計數儀表板
- `control-panel`：使用者控制介面，支援 BPM（20–300）、拍號（分子 1–16 / 分母 2/4/8/16）、每循環小節數（1–64）、循環次數（1–99 或 ∞）、細分開關（2/3/4 sub-ticks per beat）

### Modified Capabilities

（無既有 spec，此為全新專案）

## Impact

- 新建 `index.html`、`css/`、`js/` 目錄與檔案，無外部依賴
- 執行環境：瀏覽器（Chrome / Firefox / Edge / Safari），macOS 與 Windows 均支援
- 無 Node.js、無 build 工具、無網路連線需求
