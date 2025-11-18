# 页面内容与文案要点（首版）

> 适用于落地 i18n 资源（en/zh）和设计稿。业务解读库不在此文档，参见数据表与导入导出规范。

## 导航与共通
- 语言切换：EN / 中文；提示“Language”。
- 底部/顶部导航（可选）：Home / Quiz / Draw / Result / Pay。

## 首页 / 引导（/）
- 标题：Fragrant Epiphany / “带着香气的顿悟”。
- 副标题：A Journey Through Scent, Spirit and Stars。
- 价值主张：塔罗 × 香水，给“能喷在身上的答案”。
- 亮点三条：塔罗解析、香水推荐（100+ 库）、温柔陪伴。
- CTA 主：Start explore / 开始探索；次 CTA：Learn more / 了解更多。

## About（/about）
- 使命：在大改变前点亮一个温柔、真实的转折点。
- 提供：塔罗占卜；香水推荐（回应当下的香气）；独特体验（可喷的答案）。
- 创办人简介（简）：管理/顾问背景，心理/音乐/香气爱好，学习塔罗并建立香水库，关注人本与情绪张力。
- 语气：温柔、意象化（光/香/庙宇）。
- CTA：Start explore。

## 玩法介绍（/how-it-works）
- 流程：答问卷 → 选择 3 张牌 → 免费 Past 摘要 → 支付 → 完整解读 + 推荐。
- 规则：固定 3 张，不重复，Past/Now/Future；第三张后自动跳转。
- 动效提示：轻量波纹/渐变，无重粒子/音效。

## 问卷（/quiz）
每问四选一，完成才可继续；显示进度。
1) 当前困扰：关系与情感 / 事业与财富 / 自我与成长 / 机遇与未知。
2) 最渴望：清晰与答案 / 勇气与力量 / 释放与疗愈 / 确认与验证。
3) 当前状态：主动出击 / 徘徊观望 / 感到耗竭 / 冷静分析。
- 按钮：Next / Continue；提示“回答完三题后开始抽牌”。

## 抽牌（/draw）
- 顶部提示：可放大牌轮、滑动、点击选牌；固定 3 张，不重复，第三张后自动跳转结果。
- 左侧槽位：Past / Now / Future（占位文字）。
- 选中态按钮：Place into slot / 放入槽位；选中后飞入槽位，轻量 Loading 0.6–0.8s。

## 免费结果（/result）
- 显示问卷标签（困扰/渴望/状态）。
- Past（免费）：摘要 1–2 句 + 1 条提示/行动。
- 提示：完整解读需支付；价格 RMB 15 / USD 5。
- CTA：Unlock full reading / 解锁完整解读。

## 支付（/pay → Stripe Checkout）
- 订单摘要：币种、金额、所选标签。
- 按钮：Proceed to payment / 去支付（Stripe Checkout）。
- 提示：支付成功/失败将回跳显示状态。

## 支付回调页（/pay/callback）
- 成功：Payment succeeded / 支付成功；按钮“View full result / 查看完整解读”。
- 失败/取消：Payment not completed / 支付未完成；按钮“Retry payment / 重试支付”“Back to home / 返回首页”。

## 完整结果（解锁后）
- Now：2–3 句现状描述。
- Action：2–3 条行动建议（列表）。
- Future：2–3 句未来预见。
- 推荐：2–3 条卡片（标题 + 一行描述，沿用香气/意象语言）。
- 次 CTA：Read again / 再次占卜；Share / 分享（可选）。

## 后台（轻量）
- 登录：用户名/密码提示。
- 配置：价格（RMB/USD）、语言开关、回调 URL、Stripe key/env 显示（敏感值隐藏/脱敏）。
- 解读库：导入/导出 CSV/JSON 按 `card_name, category, position, language, summary, interpretation, action?, future?, recommendation[]`。
- 问卷文案：可编辑三问四选一文本。
- 订单：列表只读，含状态/金额/币种/创建时间。

## i18n 说明
- 将以上 UI 文案写入 `locales/en.json` / `locales/zh.json`，键可按页面分组（home.*, about.*, quiz.*, draw.*, result.*, pay.*, callback.*, admin.*）。
- 业务数据（解读库/推荐）不放 i18n 文件，由后端返回对应语言。
