# kodueFlow Design Spec

**Date:** 2026-03-12
**Status:** Approved

---

## Overview

kodueFlow 是一個本地端的音樂節奏視覺化工具，主要用於個人練習輔助，兼顧作曲/編曲參考。使用者可設定 BPM、拍號、小節數與循環次數，工具會同步輸出視覺動畫與節拍器音效。

---

## Goals

- 精準的節拍計時，不因 JavaScript event loop 延遲而漂移
- 流暢的視覺動畫，與音效時間點同步
- 跨平台支援（macOS、Windows），直接開啟瀏覽器即可使用，無需安裝或 build
- 簡潔直觀的 UI，練習場景下快速調整參數

## Non-goals

- 不需要伺服器或後端
- 不需要帳號、儲存或雲端同步
- 不支援 MIDI 輸出（此版本）
- 不需要行動裝置優化（此版本）

---

## Tech Stack

| 層次 | 技術 |
|------|------|
| UI 框架 | Vanilla JS（無 framework，無 build 工具） |
| 音頻 | Web Audio API（原生瀏覽器 API） |
| 動畫 | CSS Animation + `requestAnimationFrame` |
| 計時 | `AudioContext.currentTime`（硬體時鐘） |
| 執行環境 | 任何現代瀏覽器（Chrome / Firefox / Edge / Safari） |

---

## File Structure

```
kodueFlow/
├── index.html          # 主頁面，HTML 結構
├── css/
│   └── style.css       # 版面配置 + 動畫定義
└── js/
    ├── scheduler.js    # 音頻引擎：Look-ahead Scheduler
    ├── metronome.js    # 節拍狀態機：BPM、拍號、循環邏輯
    └── ui.js           # DOM 更新、動畫觸發、事件綁定
```

---

## UI Design

### 佈局：左側面板 + 右側視覺化

```
┌─────────────────┬──────────────────────────────────────┐
│   Control Panel │   Visualizer                         │
│                 │                                      │
│  BPM: 120 ▲▼   │  [MEASURE 1/8]  [LOOP 1/4]           │
│  拍號: 4 / 4    │                                      │
│  小節數: 8      │         ●  (節拍球)                   │
│  循環: 4        │                                      │
│  細分: OFF ▼    │  ┌──┐ ┌──┐ ┌──┐ ┌──┐               │
│                 │  │█ │ │  │ │  │ │  │  (小節網格)    │
│  [ ▶ START ]   │  └──┘ └──┘ └──┘ └──┘               │
└─────────────────┴──────────────────────────────────────┘
```

### 視覺風格

- **配色**：淺色主題（白底 `#ffffff`，靛藍強調色 `#5a67d8`）
- **節拍球大小**：約 30px 直徑
- **節拍動畫**：Scale + Glow（每拍縮放 1.0 → 1.45 倍，同步發光暈）

---

## Control Panel

| 控制項 | 類型 | 預設值 | 範圍 |
|--------|------|--------|------|
| BPM | 數字輸入 + ▲▼ 按鈕 | 120 | 20–300 |
| 拍號（分子） | 數字輸入 | 4 | 1–16 |
| 拍號（分母） | 下拉選單 | 4 | 2, 4, 8, 16 |
| 顯示小節數 | 數字輸入 | 8 | 1–64 |
| 循環次數 | 數字輸入 | 4 | 1–99，或 ∞ |
| 細分 | 開關 + 下拉 | 關 | ♩ ♪ ♬（1/2, 1/4, 1/8） |
| Start / Stop | 按鈕 | — | — |

---

## Visualizer

### 儀表板
顯示當前：BPM（靜態顯示）、`當前小節 / 總小節數`、`當前循環 / 總循環數`

### 節拍球
- 常態：`#c7d2fe`（淡靛藍）
- 觸發時（每拍）：scale 1.0 → 1.45，顏色 → `#5a67d8`，加 glow shadow
- 動畫時長：對應一拍長度的 30%（快速回彈）
- 強拍（每小節第一拍）可選用不同顏色或更大 scale

### 小節網格
- 每個小節顯示為一個格子
- 當前進行中的小節：高亮（靛藍填色）
- 已完成的小節：次要色
- 未進行的小節：空白/灰色

---

## Audio Engine

### Look-ahead Scheduler（scheduler.js）

精準計時的核心機制，解決 JavaScript event loop 延遲漂移問題：

```
┌─────────────────────────────────────────────────────┐
│  AudioContext.currentTime  ←  瀏覽器硬體時鐘（精準）  │
└────────────────┬────────────────────────────────────┘
                 │
  setTimeout 每 25ms 觸發一次 scheduler
                 │
  向前預排 100ms 窗口內的所有節拍事件
                 │
  audioContext.createOscillator() 在精確時間點發聲
                 │
  requestAnimationFrame 讀取 audioContext.currentTime
  → 觸發對應的視覺動畫（無額外延遲）
```

**關鍵參數：**
- `LOOKAHEAD_MS = 25` — scheduler 呼叫間隔
- `SCHEDULE_AHEAD_TIME = 0.1` — 預排窗口（秒）

### 音效設計

| 事件 | 音調 | 時長 |
|------|------|------|
| 強拍（每小節第一拍） | 880 Hz | 60ms |
| 弱拍 | 440 Hz | 40ms |
| 細分拍（subdivision） | 220 Hz | 20ms |

波形：`sine`，envelope：快速 attack（0ms）+ 短 decay

---

## State Machine（metronome.js）

```js
state = {
  // 設定（使用者可調整）
  bpm: 120,
  beatsPerMeasure: 4,
  beatUnit: 4,
  totalMeasures: 8,
  loopCount: 4,          // null = 無限循環
  subdivisionEnabled: false,
  subdivisionValue: 2,   // 每拍細分數

  // 執行中狀態（唯讀）
  isPlaying: false,
  currentBeat: 0,
  currentMeasure: 0,
  currentLoop: 0,
  nextBeatTime: 0,       // audioContext 時間戳
}
```

**狀態轉移：**
```
idle → playing（按 Start）
playing → idle（按 Stop，或所有循環結束）
playing → playing（loop_complete，繼續下一循環）
```

---

## Error Handling

| 情境 | 處理方式 |
|------|----------|
| 瀏覽器不支援 Web Audio API | 頁面頂部顯示提示橫幅，功能降級為視覺模式 |
| AudioContext 被瀏覽器暫停（autoplay policy） | 點擊 Start 時自動 `resume()`，不需使用者額外操作 |
| BPM 輸入超出範圍 | clamp 到合法值（20–300），即時提示 |

---

## Cross-Platform Compatibility

工具為純瀏覽器應用，在以下環境測試目標：

- macOS + Chrome / Firefox / Safari
- Windows + Chrome / Firefox / Edge

無需安裝、無需 Node.js、無需網路連線。雙擊 `index.html` 即可開啟使用。
