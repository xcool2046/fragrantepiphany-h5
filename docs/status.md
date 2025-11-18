# 项目进度与待办（快照）

## 已完成
- 前端：Vite + React/TS，路由骨架（首页/About/玩法/问卷/抽牌/结果/支付/回调）、i18n（en/zh）、Tailwind 主题、Framer Motion 抽牌占位动画；问卷/抽牌/结果/支付前后端联调（create-session、回调轮询）。
- 后端：Nest + TypeORM + Postgres；实体（interpretation/order/user）；支付（Stripe Checkout + webhook 校验 + 订单查询）；Auth（env 单账号登录 + JWT）；抽牌接口（Past/Now/Future 位置池随机）；解读查询；CSV 导入/导出（需 JWT）；问卷提交占位；初始化脚本 `scripts/run-init.js`（建表+迁移+seed）。
- 数据：sample-data/cards-example.json；`npm run seed`（或 `node scripts/run-init.js`）导入占位数据。
- 部署：Docker/Compose（frontend serve dist、backend、Postgres、nginx）；`nginx.conf` 反代示例；端口当前映射：nginx 8080->80，backend 3000，frontend 4173，db 5432。
- 文档：需求/架构/open-questions/UI/brand/page-content/ppt-extract；部署指南 `docs/deploy-guide.md`（域名解析、env、反代、构建、初始化、验证、HTTPS 可选）；dev-guide 更新。

## 待完成/待确认
- UI：需要根据反馈调整样式/布局/动效（当前为基础版）。
- 生产部署：
  - 在服务器按 deploy-guide 配置 .env、DNS、Nginx/HTTPS，`docker-compose build --no-cache frontend backend && docker-compose up -d`。
  - 运行初始化：`cd backend && DATABASE_URL=postgresql://tarot:tarot@localhost:5432/tarot node scripts/run-init.js`。
  - Stripe webhook 指向 `https://backend.<your-domain>/api/pay/webhook`，env 切换到 live key/price 时同步更新。
- 前端对接生产后端：`VITE_API_BASE_URL` 需指向公网后端域名。
- Firecrawl：仅当前端域名公网可访问时才能抓取；本地/内网地址无法用 Firecrawl。
- 审阅/增强：
  - 导入/导出校验与去重（当前仅简单解析）。
  - 抽牌规则如需更复杂权重/去重策略可再调。
  - 监控/埋点/邮件（尚未接入）。

## 常用命令
- 构建/启动：`docker-compose build --no-cache frontend backend && docker-compose up -d`
- 查看容器：`docker ps`
- 日志：`docker logs h5-web-frontend-1` / `h5-web-backend-1` / `h5-web-nginx-1`
- 初始化（宿主机连 compose DB）：`cd backend && DATABASE_URL=postgresql://tarot:tarot@localhost:5432/tarot node scripts/run-init.js`
- 重新导入 seed：同上命令
- 生产反代示例：`nginx.conf` 中前端转 `frontend:4173`，后端转 `backend:3000`；HTTPS 可自行加证书与 443 server 块。
