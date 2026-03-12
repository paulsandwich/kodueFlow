## 1. 專案結構建立

- [x] 1.1 建立 `index.html` 基本骨架（HTML5、`<script type="module">` 載入 js/ui.js）
- [x] 1.2 建立 `css/style.css` 空檔案
- [x] 1.3 建立 `js/scheduler.js` 空檔案
- [x] 1.4 建立 `js/metronome.js` 空檔案
- [x] 1.5 建立 `js/ui.js` 空檔案

## 2. 音頻引擎（scheduler.js）

- [x] 2.1 初始化 `AudioContext`，偵測 Web Audio API 支援；不支援時設定 `audioFallback = true`
- [x] 2.2 實作 `scheduleNote(frequency, duration, time)` — 在指定 `audioContext.currentTime` 建立 OscillatorNode + GainNode 並播放
- [x] 2.3 實作 `scheduler()` 函式 — 以 Look-ahead 模式預排 `SCHEDULE_AHEAD_TIME = 0.1s` 窗口內的所有節拍
- [x] 2.4 在 `scheduler()` 內依 `isDownbeat` 選擇音調（880Hz / 440Hz），並 push 到 `beatQueue`
- [x] 2.5 實作 subdivision 排程 — 若 `subdivisionEnabled`，在拍間均分插入 220Hz 音效（**不** push 到 beatQueue）
- [x] 2.6 以 `setInterval(scheduler, SCHEDULER_INTERVAL_MS)` 啟動排程迴圈；`stop()` 時 `clearInterval`
- [x] 2.7 在 `start()` 時呼叫 `audioContext.resume()` 處理 autoplay policy

## 3. 節拍狀態機（metronome.js）

- [x] 3.1 定義 `state` 物件（bpm, beatsPerMeasure, beatUnit, totalMeasures, loopCount, subdivisionEnabled, subdivisionValue, currentBeat, currentMeasure, currentLoop, nextBeatTime, isPlaying）
- [x] 3.2 實作 `beatDuration()` — 回傳 `(60 / state.bpm) * (4 / state.beatUnit)`
- [x] 3.3 實作 `advanceBeat()` — 推進 currentBeat，在邊界推進 currentMeasure，在邊界推進 currentLoop；所有循環結束時呼叫 `stop()`
- [x] 3.4 實作 `pendingChanges` 機制 — 拍號、小節數、循環數變更暫存，於小節邊界 flush
- [x] 3.5 實作 `start()` — 重置計數器，設定 `nextBeatTime = audioContext.currentTime`，啟動 scheduler
- [x] 3.6 實作 `stop()` — 停止 scheduler，重置所有計數器，觸發 UI reset 回呼

## 4. UI 版面（index.html + style.css）

- [x] 4.1 實作兩欄版面：左側 `.control-panel`（固定寬度）+ 右側 `.visualizer`（flex 填滿）
- [x] 4.2 套用淺色主題 CSS 變數（`--accent: #5a67d8`、`--accent-dark: #3730a3`、`--ball-idle: #c7d2fe`）
- [x] 4.3 在 `.control-panel` 加入 BPM 輸入（number input + ▲▼ 按鈕）
- [x] 4.4 在 `.control-panel` 加入拍號輸入（分子 number input + 分母 select：2/4/8/16）
- [x] 4.5 在 `.control-panel` 加入每循環小節數輸入（number input，1–64）
- [x] 4.6 在 `.control-panel` 加入循環次數輸入（number input 1–99 + ∞ 核取方塊）
- [x] 4.7 在 `.control-panel` 加入 Subdivision 開關（checkbox）+ 細分值選擇（select：2/3/4）
- [x] 4.8 在 `.control-panel` 加入 Start/Stop 按鈕
- [x] 4.9 在 `.visualizer` 加入儀表板（顯示 BPM、MEASURE X/N、LOOP X/N）
- [x] 4.10 在 `.visualizer` 加入 `.beat-ball` 元素（30px 圓形）
- [x] 4.11 在 `.visualizer` 加入 `.measure-grid` 容器（CSS grid）

## 5. UI 動畫與互動（ui.js）

- [x] 5.1 實作 `requestAnimationFrame` 主迴圈 — 每幀掃描 `beatQueue`，消費 `beatTime <= audioContext.currentTime` 的條目
- [x] 5.2 實作 `animateBeat(isDownbeat)` — 計算 clamped 動畫時長（30% of beatDuration，50ms–300ms），設定 scale 和顏色，setTimeout 後復原
- [x] 5.3 強拍動畫：scale 1.6、color `#3730a3`、加強 glow
- [x] 5.4 弱拍動畫：scale 1.45、color `#5a67d8`、標準 glow
- [x] 5.5 實作 `updateMeasureGrid(currentMeasure, totalMeasures)` — 更新每個格子的 current / completed / pending class
- [x] 5.6 實作儀表板更新 — 在每次 beat 消費後更新 MEASURE / LOOP 顯示（currentMeasure + 1、currentLoop + 1）
- [x] 5.7 綁定 BPM 輸入事件 — 即時更新 `state.bpm`（playback 中立即生效）
- [x] 5.8 綁定拍號、小節數、循環數輸入事件 — 寫入 `pendingChanges`
- [x] 5.9 綁定 Subdivision 開關與細分值選擇事件 — 即時更新 state
- [x] 5.10 綁定 Start/Stop 按鈕事件 — 呼叫 `metronome.start()` / `metronome.stop()`
- [x] 5.11 實作 `resetUI()` — stop 時清空格子狀態、復原球到 idle、重置儀表板
- [x] 5.12 實作自然完成的 linger 效果 — 所有循環結束後格子保持 ~1 秒，然後 fade 並 reset

## 6. 錯誤處理與降級

- [x] 6.1 頁面載入時偵測 Web Audio API；若不支援，顯示頂部警告橫幅並切換為 `setInterval` fallback 模式
- [x] 6.2 BPM input 加入 clamp 驗證（20–300），超出範圍時即時修正並視覺提示

## 7. 跨平台驗證

- [x] 7.1 在 macOS Chrome 測試：直接雙擊 `index.html` 開啟，確認音效與動畫正常
- [x] 7.2 在 macOS Firefox 或 Safari 測試：確認 ES Module 載入與 Web Audio API 正常
- [x] 7.3 在 Windows Chrome 或 Edge 測試：確認 `file://` 協議下 ES Module 可載入（若有 CORS 問題，改為 `<script>` + IIFE）
