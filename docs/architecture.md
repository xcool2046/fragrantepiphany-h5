# 架构与技术选型（已确认部分）

## 前端（H5 优先，兼顾 Web）
- 框架：React + TypeScript + Vite。
- 路由：React Router。
- 状态与数据：Zustand（轻量状态）+ TanStack Query（请求/缓存）。
- 样式：Tailwind CSS；如需设计系统，可在 Tailwind 上封装组件。
- 表单/校验：React Hook Form + Zod。
- 动画：Framer Motion（抽牌动画、过渡）。
- i18n：react-i18next（默认英文，内置中文翻译；未启用外部文案表）。

## 后端与数据
- 框架：Node.js + NestJS（REST）；ORM：Prisma；DB：PostgreSQL。
- 支付：Stripe 收银台；支付回跳后校验订单状态并返回前端。
- 数据模型：tarot_interpretations(card_name, category, position, interpretation, language)，为 (card_name, category, position) 建复合索引。
- 缓存：可用 Redis 预热 702 条组合，降低查询延迟。

## 部署与运维（当前预算 ¥9,000 可交付程度）
- 交付：推荐容器化（Docker），单机 Nginx + Node + PostgreSQL（同机或托管 DB 均可）；提供启动脚本/Compose 与基础运维说明。若客户不接受 Docker，可给裸机启动脚本。
- 环境：dev/stage/prod 可共用一台机器的多实例（端口或容器隔离）；HTTPS 依赖客户域名与证书。
- 监控/日志：基础访问日志与应用日志，简易健康检查；如需 APM/埋点需额外确认。
- 邮件：占位模板（可根据后续文案调整）；如启用 Resend/SendGrid 需提供域名与 API Key。

## 体验与规则
- 抽牌：固定 3 张，不重复；位置 Past/Now/Future。
- 领域：爱情/友情/亲情；问题分类仅用于筛选，不额外乘以文案数量。
- 免费/付费：免费展示 Past 简版；付费解锁 Now + Action + Future 及推荐。
- 多语言：前台英文为主，可切换中文；后台英文。
- 动画建议：无声效/震动要求；抽牌卡片放大确认 + 放入槽位的平滑过渡；转场可选“波纹/墨滴”或更轻的渐变+粒子，保证 H5 性能。

## 待评审/可调整项
- 是否需要后台管理 UI 的具体范围（当前以前台闭环为主，可留轻管理页）。
- 监控/埋点、灰度/蓝绿发布策略（如需）。
- 邮件或其他通知渠道是否必须上线首版。
