# 开发说明（首版）

## 技术栈与目录约定
- 前端：Vite + React + TypeScript，React Router，Zustand（轻状态）+ TanStack Query（请求/缓存），Tailwind CSS，Framer Motion（动画），react-i18next（en/zh）。
- 后端：NestJS（REST）+ Prisma，PostgreSQL；Stripe Checkout；可选 Redis 缓存。
- 部署：Docker / Docker Compose，Nginx 反代；环境通过 `.env` / Compose 注入。

## 环境变量（示例命名）
- 前端：
  - `VITE_API_BASE_URL` 后端 API 根路径。
  - `VITE_STRIPE_PK` 对应环境的 Publishable Key（test/live）。
  - `VITE_PRICE_ID_CNY` / `VITE_PRICE_ID_USD`（可选，或由后端返回）。
- 后端：
  - `DATABASE_URL` Postgres 连接串。
  - `PORT` 服务端口，`HOST` 绑定地址。
  - `STRIPE_SECRET_KEY`（test/live）、`STRIPE_WEBHOOK_SECRET`（whsec...）。
  - `STRIPE_PRICE_ID_CNY` / `STRIPE_PRICE_ID_USD`（若由后端创建 Checkout 会用）。
  - `SESSION_SECRET`（后台登录），`ADMIN_USER` / `ADMIN_PASS`。
  - 可选：`REDIS_URL`（缓存）。

## 数据模型（Prisma 简述）
- `tarot_interpretation`：card_name, category, position, language, summary, interpretation, action?, future?, recommendation(json)。复合唯一：(card_name, category, position, language)。
- `order`：id, amount, currency, price_id, status (pending/succeeded/failed), stripe_session_id/payment_intent_id, email?, language, created_at。
- `questionnaire`（可选存储提交）：q1/q2/q3 选项，locale。
- `user`（后台登录）：username, password_hash, role(single-tenant)。

## 核心 API（REST 草案）
- 公共：
  - `GET /api/cards?category=&position=&language=` 列出/分页抽牌资源（可返回卡牌元数据）。
  - `POST /api/draw` 输入：lang、category(optional)、count=3（默认不重复）→ 返回 3 张牌列表。
  - `GET /api/interpretation` 查询组合：card_name, category, position, language → 返回 summary/interpretation/action/future/recommendation。
  - `POST /api/questionnaire`（可选存储）提交 q1/q2/q3。
  - `POST /api/pay/create-session` 输入：currency(rmb/usd)、price_id 或从配置读取、locale、metadata（questionnaire tags/selection）；返回 Stripe Checkout session url/id。
  - `POST /api/pay/webhook` Stripe 回调，校验签名；更新 `order` 状态。
  - `GET /api/pay/order/:id` 查询订单/支付状态（前端轮询或回跳使用）。
- 后台（需登录）：
  - `POST /api/admin/login`、`POST /api/admin/logout`。
  - `GET/PUT /api/admin/config` 基础配置（价格、语言开关、回调 URL 等）。
  - `GET/PUT /api/admin/interpretations` 列表/编辑；`POST /import`、`GET /export`（CSV/JSON）。
  - `GET /api/admin/orders` 订单只读。

## 前端路由与数据流
- `/` 引导/落地：展示品牌、CTA、语言切换；按钮进入问卷或玩法介绍。
- `/about` About 品牌页（可合并在首页段落）。
- `/how-it-works` 玩法介绍；说明抽牌规则/流程。
- `/quiz` 问卷 3 问四选一（状态存 zustand 或 query 缓存）；提交后进入抽牌。
- `/draw` 抽牌页：获取卡牌列表（可分页）；选牌三张、不重复；第三张后轻量 loading → `/result`。
- `/result` 免费部分：展示 Past 摘要 + 问卷标签；显示价格和“解锁”按钮调用 `pay/create-session`。
- `/pay` Stripe Checkout 跳转；回跳 `/pay/callback?session_id=&status=`。
- `/pay/callback` 根据 query 调用订单状态，成功则解锁完整解读；失败提供重试/返回。
- `/result/full` 或同页解锁视图：显示 Now/Action/Future + 推荐。
- 共通：语言切换、轻底部导航（可选），错误/加载状态提示。

## 付费逻辑
- 价格：RMB 15（`price_1SUlJp2a1TSt8d5Us1Fvxyj3`）、USD 5（`price_1SUlJq2a1TSt8d5UDjk1u0Ek`）。
- 流程：前端调用 create-session → 重定向到 Stripe → 回跳 callback → 后端 webhook 校验 → 更新订单 → 前端查询订单解锁内容。
- 校验：后端使用 `STRIPE_WEBHOOK_SECRET` 验证；订单状态以 webhook/查询为准，不信任前端 query。

## 多语言（i18n）
- 使用 react-i18next，资源文件 `locales/en.json` / `locales/zh.json`；包含页面标题、按钮、提示文案等 UI 字符串。
- 业务文案（解读库、推荐）存后端数据表，不放 i18n 资源；UI 层仅管界面文字。

## 开发/运行
- 前端：`npm install && npm run dev`（或 pnpm）；环境 `VITE_*`。
- 后端：`npm install && npm run start:dev`；`npx prisma migrate dev`，可用 `sample-data/cards-example.json` 作为 seed。
- Docker/Compose：提供 `docker-compose.yml` 启动前后端+DB+Nginx。
- CI（可选）：lint/typecheck/test。

## 部署
- 默认使用 Docker/Compose：容器化 Nginx（提供前端静态与反代后端）、后端 Node、Postgres（若不用托管）。前端静态可打包后挂载或放入 Nginx 容器。
- 拓扑：Nginx → 前端静态 → 后端（Node）→ Postgres；HTTPS 用现有证书。
- 环境切换：通过 env 区分 test/prod Stripe key、price_id、webhook secret（Compose/.env 注入）。

### Compose 运行（开发/测试）
1) 准备 `.env`（根目录，不提交）：
```
DATABASE_URL=postgresql://tarot:tarot@db:5432/tarot
STRIPE_PUBLISHABLE_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_PUBLISHABLE_KEY_TEST=...
STRIPE_SECRET_KEY_TEST=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_ID_CNY=price_...
STRIPE_PRICE_ID_USD=price_...
PUBLIC_BASE_URL=http://localhost:4173
ADMIN_USER=monicacjx
ADMIN_PASS=kittycjx88358985
SESSION_SECRET=devsecret
```
2) 端口说明：仓库默认 `nginx` 服务映射为 `8080:80`（配合服务器的宿主机 Nginx 反代 80/443）。如果本地希望继续使用 `http://localhost`，在根目录创建 `docker-compose.override.yml`（已在 `.gitignore`）覆盖端口：
```
services:
  nginx:
    ports:
      - "80:80"
```
3) `docker compose up --build`（或 `docker compose up -d`），Compose 会自动读取 override；默认端口：nginx 8080（若未覆盖）、frontend 4173，backend 3000，db 5432。
4) 运行迁移/种子（容器内或本机）：
- 迁移：`cd backend && npm run build && npm run typeorm -- migration:run`（或在容器内执行）。
- 种子：`cd backend && npm run seed`（用 sample-data/cards-example.json）。

### 手动运行（本机）
1) Postgres 本地：创建数据库，对应 DATABASE_URL。
2) 后端：`cd backend && npm install && npm run build && npm run typeorm -- migration:run && npm run seed && npm run start:dev`。
3) 前端：`cd frontend && npm install && npm run dev -- --host --port 4173`，设置 `VITE_API_BASE_URL=http://localhost:3000`。

## 监控与埋点（推荐）
- 前端：基础错误上报（Sentry 或 window.onerror）、支付关键链路事件（create-session、redirect、success、fail）。
- 后端：访问日志、应用错误日志；关键支付事件写入订单表。

## 邮件（首版建议）
- 仅预留接口与占位模板，不默认发送；待文案与域名邮箱就绪再启用。

## 文件与素材
- 素材路径：`assets/`（cards/web/background）；遵循命名规范，优先 WebP/JPEG。
- PPT 摘要与品牌语气：见 `docs/brand.md`；UI 规范见 `docs/ui.md`；需求全量见 `docs/requirements.md`；未决项见 `docs/open-questions.md`。

## 测试指南 (Testing Guide)

### 1. 测试环境
- **前台**: `http://localhost:8080/` (建议使用移动端模拟器，如 iPhone 12/14 Pro，390x844)
- **后台**: `http://localhost:8080/admin` (桌面端)
- **Mock 支付**: 在开发/测试环境下，可使用 URL 参数 `?mock_pay=true` 模拟支付成功状态（例如访问 `/result?mock_pay=true` 或在支付跳转前使用），以便验证付费后的 UI 逻辑。

### 2. 核心测试场景
| 场景 | 关键步骤 | 预期结果 |
| :--- | :--- | :--- |
| **全链路闭环** | Home -> Quiz (3题) -> Draw (3张) -> Result (Free) -> Pay -> Result (Paid) | 流程顺畅，付费后内容解锁。 |
| **H5 适配** | 检查 Quiz 底部按钮、Draw 轮盘交互、Result 支付栏 | 无遮挡，交互灵敏；Draw 页提供兜底按钮。 |
| **后台管理** | Login -> Interpretations/Orders/Settings | 登录鉴权正常，数据加载无误。 |

### 3. 自动化测试建议
- 工具：推荐使用 `playwright` 或 `puppeteer`。
- 配置：Viewport 设置为 `390x844` (iPhone 12 Pro)。
- 技巧：针对 Canvas 轮盘，若无法精确定位，可使用坐标点击或直接点击右下角的兜底按钮 (Fallback Button)。

