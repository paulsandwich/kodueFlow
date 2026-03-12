# kodueFlow

本地瀏覽器音樂節拍視覺化工具。用於練習節奏感知，提供節拍器聲音、拍子點陣列動畫、小節進度格以及播放狀態儀表板。

## 使用方式

直接用瀏覽器開啟 `index.html`，無需安裝任何套件或伺服器。

> Chrome 建議：直接雙擊開啟即可。

## 功能

### 左側控制面板

| 控制項 | 說明 |
|--------|------|
| **BPM** | 每分鐘拍數，20–300，立即生效 |
| **拍號** | 分子（每小節幾拍，1–16）/ 分母（2/4/8/16） |
| **每循環小節數** | 1–64 小節 |
| **循環次數** | 1–99 次，或 ∞ 無限循環 |
| **細分 (Subdivision)** | 開啟後可設定每拍細分數（÷2 / ÷3 / ÷4），立即生效 |
| **套用結構設定** | 將拍號、小節數、循環次數的變更一次套用（按鈕變橘色表示有未套用的變更） |
| **START / STOP** | 開始或停止播放 |

> BPM 與 Subdivision 立即生效；拍號、小節數、循環次數需按「套用結構設定」才生效。

### 右側視覺化區域

- **儀表板**：即時顯示 BPM、目前小節/總小節、目前循環/總循環
- **拍子點**：依拍號顯示對應數量的點，到哪一拍該點發光；強拍（第 1 拍）點較大；超過 8 拍自動換行
- **小節進度格**：顯示每次循環的所有小節，已播放的格子變色，當前小節高亮

## 檔案結構

```
kodueFlow/
├── index.html          # 主頁面
├── css/
│   └── style.css       # 樣式（Light 主題）
└── js/
    ├── scheduler.js    # Web Audio API Look-ahead 排程器
    ├── metronome.js    # 節拍器狀態機與邏輯
    └── ui.js           # UI 層：動畫、DOM 操作、控制綁定
```

## 技術細節

- **純 Vanilla JS**，無任何框架或相依套件
- **Web Audio API Look-ahead Scheduler**：使用 `audioContext.currentTime` 作為主時鐘，提前 100ms 預排拍點，解決 JS event loop 時間漂移問題
- **beatQueue**：scheduler 與 UI 之間的共享佇列，每個 entry 含 `{ beatTime, beatNumber, isDownbeat, measureNumber, loopNumber }`
- **requestAnimationFrame 動畫**：RAF 迴圈消費 beatQueue，依 `beatNumber` 定位對應點執行 Scale + Glow 動畫
- **pendingChanges**：播放中的結構設定變更暫存於此，在小節或循環邊界生效

## 瀏覽器支援

| 瀏覽器 | 狀態 |
|--------|------|
| Chrome / Edge | 完整支援 |
| Firefox | 完整支援 |
| Safari | 完整支援 |
| 不支援 Web Audio API | 切換為視覺模式（無音效，計時精度降低） |
