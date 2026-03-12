## 1. Beat Dots — HTML 結構

- [x] 1.1 在 `index.html` 移除 `.beat-ball-container` 和 `#beat-ball`，改為 `<div id="beat-dots" class="beat-dots"></div>`

## 2. Beat Dots — CSS 樣式

- [x] 2.1 在 `style.css` 新增 `.beat-dots`：flex 橫排、`flex-wrap: wrap`、置中、gap 間距
- [x] 2.2 新增 `.beat-dot`：圓形、idle 顏色 `#c7d2fe`、transition（同原 `.beat-ball`）
- [x] 2.3 新增 `.beat-dot.downbeat`：尺寸約 1.4× 標準點（例如標準 18px → 強拍 26px）
- [x] 2.4 移除或保留原 `.beat-ball` 樣式（保留供參考，或直接刪除）

## 3. Beat Dots — JS 渲染邏輯

- [x] 3.1 在 `ui.js` 新增 `renderBeatDots(beatsPerMeasure)` — 清空 `#beat-dots`，依數量建立 `.beat-dot` 元素，index 0 加上 `.downbeat` class
- [x] 3.2 將 `ballEl` 相關 DOM ref 改為 `dotsEl = document.getElementById('beat-dots')`
- [x] 3.3 修改 `animateBeat(isDownbeat)` 簽名為 `animateBeat(beatNumber, isDownbeat)`，改為操作 `dotsEl.children[beatNumber]`
- [x] 3.4 在 `startRAF` 的 beatQueue 消費處，將 `animateBeat(entry.isDownbeat)` 改為 `animateBeat(entry.beatNumber, entry.isDownbeat)`
- [x] 3.5 在 DOMContentLoaded 初始化時呼叫 `renderBeatDots(metronomeState.beatsPerMeasure)`

## 4. Apply 按鈕 — HTML

- [x] 4.1 在 `index.html` 左側面板加入 Apply 按鈕：`<button id="apply-btn" class="apply-btn">套用結構設定</button>`（置於 Start/Stop 按鈕上方）

## 5. Apply 按鈕 — CSS

- [x] 5.1 新增 `.apply-btn`：預設樣式（靛藍邊框、白底或淡色背景）
- [x] 5.2 新增 `.apply-btn.dirty`：橘色背景 / 橘色邊框，明確區隔有未套用變更的狀態

## 6. Apply 按鈕 — JS 邏輯

- [x] 6.1 新增 `isDirty` flag（初始 `false`）和 `pendingUI` 物件存放暫存值
- [x] 6.2 修改 `beatsInput`、`beatUnitSelect`、`measuresInput`、`loopCountInput` 的 change 事件：改為寫入 `pendingUI`，並呼叫 `setDirty(true)`
- [x] 6.3 實作 `setDirty(flag)`：更新 `isDirty`，切換 `apply-btn` 的 `.dirty` class 和按鈕文字（dirty 時顯示「● 有變更，點擊套用」）
- [x] 6.4 綁定 `apply-btn` click 事件：呼叫 `applyStructuralChanges()`
- [x] 6.5 實作 `applyStructuralChanges()`：將 `pendingUI` flush 到 `metronomeState` 或 `pendingChanges`（依播放狀態），重建 dots 和 grid，呼叫 `setDirty(false)`

## 7. 視覺化區域放大

- [x] 7.1 調大 `.dashboard` 的字體與 `.dash-value` 尺寸（約 +4px）
- [x] 7.2 調大 `.visualizer` 的 `gap` 與 `padding`
- [x] 7.3 調大 `.measure-cell` 高度（從 28px 調至 36px）

## 8. Measure Grid 置中

- [x] 8.1 在 `.measure-grid` 加上 `margin: 0 auto` 或 `align-self: center`，確保水平置中於視覺化區域

## 9. 驗證

- [x] 9.1 測試 4/4 拍：啟動後確認 4 個點，第 1 拍強拍較大，動畫正確
- [x] 9.2 測試換拍號（例如 6/8）：Apply 後確認點數量更新為 6
- [x] 9.3 測試 Apply dirty 狀態：修改拍號 → 按鈕變橘 → Apply → 按鈕恢復正常
- [x] 9.4 測試播放中 Apply：確認在下一小節邊界生效
- [x] 9.5 測試 12 拍換行：確認前 8 個點在第一行，後 4 個在第二行
