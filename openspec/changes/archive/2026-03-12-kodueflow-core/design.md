## Context

kodueFlow 是全新建立的本地端音樂節奏視覺化工具，無既有程式碼庫。核心挑戰是在瀏覽器環境中實現精準的節拍計時（不漂移），同時提供流暢的視覺動畫。

技術限制：純前端（HTML/CSS/JS），無 build 工具，直接以 `file://` 協議開啟。

## Goals / Non-Goals

**Goals:**
- 使用 Web Audio API Look-ahead Scheduler 實現不漂移的精準節拍計時
- 定義 `beatQueue` 作為音頻引擎與 UI 層之間唯一的同步介面
- 單一 HTML 入口，跨 macOS / Windows 瀏覽器直接開啟

**Non-Goals:**
- MIDI 輸出、音頻檔案載入、行動裝置優化
- 任何後端、伺服器、帳號系統

## Decisions

### D1：Look-ahead Scheduler 而非 setInterval 計時

`setInterval` / `setTimeout` 受 JavaScript event loop jitter 影響，在高 CPU 負載下會偏移 10–50ms，練習場景下可感知。

採用 Web Audio API Look-ahead Scheduler：
- `setTimeout` 每 25ms（`SCHEDULER_INTERVAL_MS`）觸發 scheduler
- scheduler 向前預排 `SCHEDULE_AHEAD_TIME = 0.1s`（100ms）窗口內的所有節拍
- 節拍音效由 `audioContext.createOscillator()` 在精確的 `audioContext.currentTime` 時間點發聲
- 視覺動畫在 `requestAnimationFrame` loop 中讀取 `audioContext.currentTime`，與音效共用同一時鐘，無額外偏移

> 參考：[Chris Wilson — A Tale of Two Clocks](https://web.dev/audio-scheduling/)

### D2：beatQueue 作為音頻 → UI 的單向介面

`scheduler.js` 不直接操作 DOM。每次預排時，將即將到來的節拍寫入共享陣列：

```js
beatQueue.push({ beatTime, beatNumber, measureNumber, isDownbeat })
```

`ui.js` 的 `requestAnimationFrame` loop 每幀掃描 beatQueue，取出 `beatTime <= audioContext.currentTime` 的條目觸發動畫，然後移除。細分拍（subdivision）**不進入 beatQueue**，由 `scheduler.js` 內部排程，僅輸出音效。

好處：兩個模組職責清晰，可獨立測試；視覺層不持有時間邏輯。

### D3：Beat Duration 計算納入 beatUnit

```js
beatDuration = (60 / bpm) * (4 / beatUnit)
```

`beatUnit` 為拍號分母（2/4/8/16）。預設 4（四分音符為一拍）。此公式確保 6/8、3/8 等拍號下的 tempo 感覺正確。

### D4：播放中參數變更策略

- BPM 變更：立即生效，下一個 scheduler 週期採用新值（影響 `beatDuration`）
- 拍號、小節數、循環數：當前小節結束後生效，避免中途撕裂
- 細分開關：立即生效

實作方式：state 物件持有 `pendingChanges`，在小節邊界 flush。

### D5：模組以 ES Module `<script type="module">` 載入

避免全域變數污染，`file://` 協議下 ES Module 在 Chrome/Firefox/Edge/Safari 均支援。載入順序：`scheduler.js` → `metronome.js` → `ui.js`，依賴關係透過 import 明確。

## Risks / Trade-offs

- **AudioContext autoplay policy**：瀏覽器在無 user gesture 前會暫停 AudioContext。緩解：點擊 Start 時呼叫 `audioContext.resume()`，不需額外提示。
- **file:// CORS 限制**：部分瀏覽器對 `file://` 下的 ES Module import 有限制（主要是 Chrome）。緩解：若遇到問題，可改用 `<script>` 標籤 + IIFE 模式，不影響功能。
- **極端 BPM 下動畫不可見**：300 BPM + beatUnit=8 時一拍僅 0.1s，30% 動畫時長為 30ms，低於視覺感知閾值。緩解：動畫時長 clamp 至 50ms–300ms。
- **無自動化測試**：純前端工具，無 test runner，正確性依賴手動測試與明確的模組邊界。

## Open Questions

（無，所有設計決策已在 spec 評審中確定）
