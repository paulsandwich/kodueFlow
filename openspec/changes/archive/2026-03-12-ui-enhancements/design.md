## Context

kodueFlow 初版使用單一 `.beat-ball` 元素做節拍視覺化，beat 資訊已透過 `beatQueue` 傳遞（含 `beatNumber`、`isDownbeat`），具備足夠資訊支援多點顯示。控制面板目前使用 `change` 事件即時更新 state 或寫入 `pendingChanges`，改版需要插入一個明確的「套用」觸發點。

## Goals / Non-Goals

**Goals:**
- 以 `beatsPerMeasure` 個點取代單一球體，讓使用者能直觀看到「現在是第幾拍」
- 加入 Apply 按鈕，BPM 依然即時，結構設定需明確確認
- 視覺化區域整體放大、measure-grid 置中

**Non-Goals:**
- 不改變音頻引擎、scheduler、狀態機邏輯
- 不新增新的控制項或功能

## Decisions

### D1：點陣列由 UI 層動態渲染

`beatsPerMeasure` 改變時（套用後），`ui.js` 重新建立 `.beat-dots` 容器內的所有 `.beat-dot` 元素。不使用 CSS 計算或 template，直接 JS 操作 DOM，保持與現有 `updateMeasureGrid()` 一致的模式。

### D2：強拍點以 CSS class 區分尺寸

強拍（beat index 0）的點加上 `.downbeat` class，CSS 負責大小差異（約 1.4 倍）。動畫邏輯不需感知強拍/弱拍的尺寸差異。

### D3：animateBeat 改為定位第 N 個點

現有 `animateBeat(isDownbeat)` 只操作固定的 `ballEl`。改為 `animateBeat(beatNumber, isDownbeat)`，在 `.beat-dots` 中取得 `children[beatNumber]`，對該元素套用相同的 scale + glow inline style，setTimeout 後復原。

### D4：Apply 按鈕的 dirty 狀態管理

新增 `isDirty` flag（初始 false）。當使用者修改拍號 / 小節數 / 循環次數時，設定 `isDirty = true`，按鈕套用橘色樣式並更新文字。Apply 點擊後：
1. flush `pendingChanges` 到 state（若正在播放，pendingChanges 機制保持不變，在小節邊界生效）
2. 若未播放，立即更新 state 並重新渲染點陣列和 grid
3. 重設 `isDirty = false`，按鈕回到正常樣式

### D5：wrap 策略 — 每行最多 8 個點

`beatsPerMeasure > 8` 時，使用 CSS `flex-wrap: wrap`，每個點設固定寬度讓自然換行。每行最多 8 個由 JS 計算點的寬度比例來保證，或簡單以 `max-width` 限制容器 row 寬度。

## Risks / Trade-offs

- [風險] 拍號從高值換到低值時，舊點若有殘留動畫狀態可能顯示異常 → 緩解：重建點陣列前清除所有 inline style
- [風險] 播放中套用拍號變更，點陣列在小節邊界才更新，期間顯示舊數量的點 → 可接受，行為一致且可預期
