1. 階段一：需求釐清與規格制定
    a. 啟動 brainstorming skill：我想要定期從資料倉儲的資料更新到我的資料庫供後續分析，讓我在分析時可以使用分析的資料庫，不影響到資料倉儲的效能，請幫我 brainstorm 需求和設計方案
    b. 建立新功能和資料夾，討論完成使用 opsx:new 指令建立該功能專屬資料夾：/opsx:new 請把上面的內容寫成提案
    c. 快速生成規格文件：/opsx:ff
2. 任務拆解與細化
    a. 使用 writing-plans 技能將 tasks.md 拆解成更細：請讀取 openspec/changes/xxx/tasks.md 並使用 writing-plans 技能，將這些大任務拆解成非常「微小的任務」（每個約 2-5 分鐘可完成），以便我們後續進行嚴格的 TDD 開發
3. 建立隔離開發環境
    a. 為了確保 main branch 的乾淨與安全，需要建立獨立的工作區：規格文件都準備好了，為了確保測試環境是乾淨的，請使用 using-git-worktree 技能
4. 紀律化的程式碼實作
    a. 清空紀錄並重新載入規格：/clear 接著請詳閱 openspec/changes/xxx 目錄下的 design.md, proposal.md, tasks.md，我們接下來會完全以這些文件為依據開發
    b. 開始 TDD 循環：開始執行微型計畫的第一項任務。請嚴格遵守 TDD (Red-Green-Refactor) 流程：先寫一個會失敗的測試，再寫實作碼讓它通過
5. 審查與收尾
    a. 程式碼審查：所有任務看來都完成了。請執行 Code Review，嚴格檢查目前的實作是否完全符合 openspec/changes/xxx/specs/ 中的需求定義
    b. 合併與清理：審查沒問題。請結束這個開發分支，將代碼合併回主分支，並清理 Worktree。
    c. 規格歸檔：/opsx:archive
