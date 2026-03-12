## Why

初版 kodueFlow 使用單一球體閃爍代表節拍，缺乏對「目前是第幾拍」的直觀感知；左側控制面板的設定變更也缺乏明確的套用確認機制，容易在練習中誤觸。此次改版強化視覺節奏感知與操作控制感。

## What Changes

- **MODIFIED** `beat-visualizer`：將節拍球替換為 N 個點（N = beatsPerMeasure），橫排排列，每拍到來時對應的點發光，強拍（第 1 拍）點較大
- **MODIFIED** `control-panel`：BPM 維持即時生效；拍號、小節數、循環次數改為「編輯後按套用按鈕」觸發，按鈕在有未套用變更時顯示橘色 dirty 狀態
- 右側視覺化區域整體放大（字體、間距、元件尺寸）
- measure-grid 進度條改為水平置中

## Capabilities

### New Capabilities

（無）

### Modified Capabilities

- `beat-visualizer`：節拍顯示從單一球體改為 N 個點陣列；強拍點尺寸不同；動畫目標從固定元素改為依 beatNumber 定位
- `control-panel`：新增「套用結構設定」按鈕；拍號 / 小節數 / 循環數的變更改由按鈕觸發 pendingChanges flush，而非 change 事件；按鈕具備 dirty 指示狀態

## Impact

- `index.html`：移除 `.beat-ball-container`，新增 `.beat-dots` 容器；左側加入套用按鈕
- `css/style.css`：新增 `.beat-dot`、`.beat-dot.downbeat`、`.beat-dot.active` 樣式；apply 按鈕 dirty 狀態；視覺化區放大
- `js/ui.js`：`animateBeat()` 改為定位第 beatNumber 個點；拍號變更時重新渲染點數量；apply 按鈕 dirty 邏輯
