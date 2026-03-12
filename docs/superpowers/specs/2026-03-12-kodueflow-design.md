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
| 每循環小節數 | 數字輸入 | 8 | 1–64 |
| 循環次數 | 數字輸入 | 4 | 1–99，或 ∞ |
| 細分 | 開關 + 下拉 | 關 | 2 / 3 / 4（每拍細分數） |
| Start / Stop | 按鈕 | — | — |

---

## Visualizer

### 儀表板
顯示當前：BPM（靜態顯示）、`當前小節 / 總小節數`、`當前循環 / 總循環數`

### 節拍球
- 常態：`#c7d2fe`（淡靛藍）
- 弱拍觸發：scale 1.0 → 1.45，顏色 → `#5a67d8`，加 glow shadow
- 強拍（每小節第一拍）觸發：scale 1.0 → 1.6，顏色 → `#3730a3`，glow 加強
- 細分拍觸發：無球動畫（僅音效），避免視覺干擾
- 動畫時長：一拍長度的 30%，clamped 至 50ms–300ms（避免極快/極慢 BPM 時動畫不可見或過慢）

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
- `SCHEDULER_INTERVAL_MS = 25` — scheduler 呼叫間隔（setTimeout 頻率）
- `SCHEDULE_AHEAD_TIME = 0.1` — 預排窗口（秒，即 100ms）

**Beat Duration 計算：**
```js
beatDuration = (60 / bpm) * (4 / beatUnit)
// beatUnit = 拍號分母（2/4/8/16）
// 例：BPM=120, beatUnit=4 → beatDuration = 0.5s
// 例：BPM=120, beatUnit=8 → beatDuration = 0.25s（八分音符為一拍）
```

**Scheduler 與 UI 的介面：`beatQueue`**

`scheduler.js` 每次預排時，將即將到來的節拍寫入共享陣列：
```js
beatQueue.push({ beatTime, beatNumber, measureNumber, isDownbeat })
// beatTime: audioContext 時間戳
// beatNumber: 在小節內的第幾拍（0-indexed）
// measureNumber: 第幾個小節（0-indexed）
// isDownbeat: 是否為強拍（beatNumber === 0）
```

`ui.js` 的 `requestAnimationFrame` loop 每幀掃描 `beatQueue`，取出 `beatTime <= audioContext.currentTime` 的條目，觸發對應動畫並從 queue 移除。

細分拍（subdivision）事件**不進入 beatQueue**，由 `scheduler.js` 內部直接排程 OscillatorNode，不觸發任何視覺動畫。

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
  currentBeat: 0,        // 0-indexed，顯示時 +1
  currentMeasure: 0,     // 0-indexed，顯示時 +1
  currentLoop: 0,        // 0-indexed，顯示時 +1
  nextBeatTime: 0,       // audioContext 時間戳
}
```

**狀態轉移：**
```
idle → playing（按 Start）
playing → idle（按 Stop，或所有循環結束）
playing → playing（loop_complete，繼續下一循環）
```

**播放中修改參數的行為：**
- BPM 變更：**立即生效**，下一個 scheduler 週期採用新 BPM
- 拍號、小節數、循環數變更：**在當前小節結束後生效**（避免中途撕裂）
- 細分開關：**立即生效**

**循環結束 / Stop 後的視覺狀態：**
- 所有循環正常結束：小節網格保留最後狀態 1 秒後淡出重置，節拍球回到常態色
- 按 Stop 中途停止：立即停止動畫，所有計數歸零，網格清空
- 再次按 Start：從頭開始（currentBeat = 0, currentMeasure = 0, currentLoop = 0）

---

## Error Handling

| 情境 | 處理方式 |
|------|----------|
| 瀏覽器不支援 Web Audio API | 頁面頂部顯示提示橫幅，功能降級為視覺模式（動畫改由 `setInterval` 驅動，精度降低，無音效） |
| AudioContext 被瀏覽器暫停（autoplay policy） | 點擊 Start 時自動 `resume()`，不需使用者額外操作 |
| BPM 輸入超出範圍 | clamp 到合法值（20–300），即時提示 |
| 播放中修改拍號或小節數 | 當前小節結束後生效，不中斷播放 |
| 細分值導致 tick 過密（如 16/16 + 4x subdivision 在 300 BPM） | 允許，無上限限制；使用者自行判斷可用性 |

**已知限制（v1）：**
- 不支援鍵盤快捷鍵（Space 開始/停止、↑↓ 調 BPM）— 預留為 v2 功能

---

## Cross-Platform Compatibility

工具為純瀏覽器應用，在以下環境測試目標：

- macOS + Chrome / Firefox / Safari
- Windows + Chrome / Firefox / Edge

無需安裝、無需 Node.js、無需網路連線。雙擊 `index.html` 即可開啟使用。
