# 前端现状与修复方案（当前布局版）

## 当前流程快照
- 路由：Home → Onboarding（`frontend/src/pages/Onboarding.tsx`，2 张引导卡，点击任意处前进，最后一步按钮跳转问卷）→ Question（6 题，分页 2 页，各 3 题）→ Draw（右侧 20 张卡片带滚动/拖拽，左侧手动槽位，需点击 Continue 才跳 Result）→ Result（本地布尔解锁，默认卡牌占位，支付未接）。
- 数据：问卷提交仅携带 q1–q3；卡牌选择仅传 cardIds；结果展示使用本地占位图片与 cardId 数字；支付相关接口未调用。
- i18n：`result.locked.*` 在 zh 存在，en 缺失。

## 核心问题（基于现代码）
1) 问卷提交缺失：`Question.tsx` 只提交 q1–q3，q4–q6 用户输入被丢弃。  
2) 问卷未透传/未展示：答案未写入路由/全局，Result 页不展示意图标签。  
3) 支付/解锁闭环缺失：Result 通过本地 `isUnlocked` 变量解锁，无 Stripe checkout/订单校验，且无币种选择。  
4) 抽牌数据未落地：选中的 cardIds 仅用于占位展示，未调用 `fetchDraw`/`fetchInterpretation` 生成 Past/Now/Future 内容。  
5) 抽牌交互与性能：允许重复选择；需手动 Continue，且 VISIBLE_CARDS=20 较重；存在 vibrate 调用。  
6) i18n 缺口：英文包缺 `result.locked`，英文界面会显示 key/空白。  
7) 状态兜底：Result 若无路由 state，会用默认 `[0,1,2]`，与用户实际抽牌不一致；缺少空状态提示与回退。

## 修复方案与优先级
决策更新：
- 抽牌跳转：保留手动 Continue（不自动跳转）。
- 选牌策略：强制唯一，不允许重复。
- 币种：Stripe Checkout 需要明确 price/currency，无法“自动选择”；用语言/地理猜测选择币种，并提供手动切换（见下）。

P0（数据正确性 + 支付闭环）
- 问卷闭环：保留 6 题两页，校验 q1–q6 必答；提交体包含 6 题；跳转 `/draw` 时将答案写入 state 或全局 store；Result 读取并展示问卷标签。  
- 支付解锁：Result 锁定态仅展示免费摘要/卡牌，点击调用 `createCheckout`（按语言/地区选 currency），跳转 sessionUrl；回跳后用 `getOrder` 校验订单状态设置解锁；缺失状态给出重试/返回首页。  
- i18n 补齐：为 en.json 增补 `result.locked.title/summary/desc/unlock`，并在 Result 增加文案回退，避免 key 泄漏。  
- 状态守卫：Result 无 state 时提示“请重新抽牌”并返回首页；阻止使用默认 `[0,1,2]`。

P1（抽牌逻辑与数据）
- 选牌与跳转：选中卡牌强制唯一；保留手动 Continue（按钮置灰至 3 张选满）；可选在点击 Continue 时短暂 Loading。  
- 卡面数量与性能：将 VISIBLE_CARDS 调整为 10–12，减少渲染负担；去除 vibrate。  
- 结果内容：选牌完成后调用 `fetchDraw` / `fetchInterpretation`（按 cardIds + language）拉取 Past/Now/Future 文案；锁定态仅展示免费部分，解锁态展示完整内容。接口失败时给友好降级。

P2（体验与安全网）
- Onboarding 交互：当前“点击任意处前进”易误触，可改为仅按钮/浮层提示（需确认）。  
- 国际化健壮性：缺失 key 时显示占位而非空白；语言切换保持路由与已购状态。  
- 错误与重试：支付失败/取消的提示与重试入口；抽牌/问卷接口报错的 Toast/提示。

## 执行清单（文件级指引）
- `frontend/src/pages/Question.tsx`：校验 q1–q6；提交体补全；将答案写入路由 state；必要时展示错误提示。  
- `frontend/src/pages/Draw.tsx`：控制 VISIBLE_CARDS≈10–12；去除 vibrate；选牌强制唯一；保留手动 Continue（3 张前禁用）；点击 Continue 时可加轻量 Loading；在跳转时携带 cardIds 与问卷答案。  
- `frontend/src/pages/Result.tsx`：读取 state（cardIds + answers），缺失则提示返回；锁定态显示免费摘要 + 价格 CTA；集成 createCheckout/getOrder；根据订单/回跳查询设置解锁；调用 fetchDraw/fetchInterpretation 拉取内容并分层展示；添加加载/错误态。  
- `frontend/src/locales/en.json`：补 `result.locked.*` 文案，与 zh 结构对齐。  
- `frontend/src/api.ts`：若需要，补充支付回调参数或状态解析。

## 待确认
- Stripe 币种选择：建议默认语言→币种（zh→CNY；其他→USD），并提供手动切换；如需 IP 匹配再定。  
- Onboarding 点击任意处前进是否改为按钮/提示（当前保留）。

## 验收清单
- 问卷 6 题两页全部提交；答案在 Result 可见。  
- 抽牌卡面数量减负，选牌去重，跳转策略符合确认结果。  
- 未支付只见免费摘要，支付成功后完整解读；支付失败/取消有提示与重试。  
- 英文界面无缺失文案；无路由 state 时有友好回退。  
