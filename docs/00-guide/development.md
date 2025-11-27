# 开发说明（更新版）

> 面向现有代码状态：前端 Vite/React，后端 NestJS + TypeORM + Postgres，Stripe Checkout；部署默认 Docker Compose + Nginx。

## 技术栈速览
- 前端：Vite + React + TypeScript，React Router v7，Zustand + TanStack Query，Tailwind，Framer Motion，react-i18next（en/zh）。
- 后端：NestJS + TypeORM，PostgreSQL，Stripe Checkout。
- **核心数据表**：
  - `questions`: 问卷题目（ID 1-6）。
  - `perfumes`: 香水数据（品牌、名称、香调、图片），由 Excel 导入。
  - `rules`: 塔罗牌与香水的映射规则（决定 Result 页展示内容）。
  - `orders`: 支付订单记录。
- 价格机制：优先按 `STRIPE_PRICE_IDS_JSON`（或 `_TEST`）映射币种到 price_id。
- 部署：Docker Compose（services: db/postgres, backend, nginx；frontend 静态由 `frontend/dist` 挂载），宿主机可再配 Nginx 反代 80/443。

## 环境变量（根目录 `.env`，不要提交）
与 `.env.example` 对齐：
```
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY_TEST=
STRIPE_SECRET_KEY_TEST=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_IDS_JSON={"usd":"price_xxx","cny":"price_yyy"}
DATABASE_URL=postgresql://tarot:tarot@db:5432/tarot
PORT=3000
HOST=0.0.0.0
SESSION_SECRET=
ADMIN_USER=admin
ADMIN_PASS=admin
PUBLIC_BASE_URL=http://localhost:4173
VITE_API_BASE_URL=http://localhost:3000
```
- 前端只需要 `VITE_API_BASE_URL`（可在构建 args 传入），其余由后端使用。
- 后端支付：必须设置 `STRIPE_SECRET_KEY`（对应环境的秘钥）和 `STRIPE_WEBHOOK_SECRET`（Dashboard/Webhook 配置生成）。价格由 Stripe Dashboard 的 price 决定，需要配置 `STRIPE_PRICE_IDS_JSON`（如 `{ "usd": "price_xxx", "cny": "price_yyy" }`；测试可用 `_TEST` 变量），按请求币种匹配对应 price_id，未配置对应币种会报错。
- 管理员账号默认 `admin/admin`，生产请修改。
- Feature flag：`FEATURE_ADMIN_ORDERS`、`FEATURE_ADMIN_PRICING`（默认关闭，见后端 AdminController）。

## 本地手动运行（不经 Docker）
1) Postgres：自备实例，确保 `DATABASE_URL` 可连。  
2) 后端：
```bash
cd backend
npm install
npm run build
npm run typeorm -- migration:run   # 应用 migrations
npm run seed                       # 导入 sample-data/cards-example.json
npm run start:dev                  # http://localhost:3000
```
3) 前端：
```bash
cd frontend
npm install
npm run dev -- --host --port 4173  # http://localhost:4173
```
4) Stripe Webhook（本地调试）：可用 `stripe listen` 转发到 `http://localhost:3000/api/pay/webhook`，并把得到的 whsec 写入 `.env` 的 `STRIPE_WEBHOOK_SECRET`。

## Docker Compose 运行
```bash
cp .env.example .env   # 根据需要填写
# 若本地改过前端，请先构建 dist（容器直接挂载静态资源）
cd frontend && npm install && npm run build && cd ..
docker compose up --build
```
- 端口：db 5432，backend 3000，nginx 8080（统一提供前端/后台，反代 /api 到 backend:3000）。如需本地直接 80/443，可在 `docker-compose.override.yml` 覆盖。
- 迁移/种子（容器内执行）：
```bash
docker compose exec backend npm run typeorm -- migration:run
docker compose exec backend npm run seed
```
- 访问：前端/后台 `http://localhost:8080`。

## 价格与支付说明
- 价格由 Stripe Dashboard 的 price 决定；后端按币种在 `STRIPE_PRICE_IDS_JSON`（或 `STRIPE_PRICE_IDS_JSON_TEST`）里查 price_id 创建 Session。未配置的币种会报错，建议为支持的币种（至少 USD/CNY）分别创建 price_id。
- 回调地址：`success_url/cancel_url` 使用 `PUBLIC_BASE_URL` 拼接 `/pay/callback`，记得与实际域名对应。
- Webhook：`STRIPE_WEBHOOK_SECRET` 用于校验签名；`orders` 表记录 `status`（pending/succeeded/failed）。

## 构建/检查命令
- 前端：`npm run build`（tsc + vite），`npm run lint`。后台默认页 `/admin/interpretations`，登录凭据由 `.env` 的 `ADMIN_USER/ADMIN_PASS` 控制。
- 后端：`npm run build`，`npm run test`（如需），`npm run lint`（带 --fix）。
- 常见问题：若 TypeORM 找不到实体，确认 `DATABASE_URL` 正确、迁移已运行；若支付报错检查是否配置了正确的 `STRIPE_PRICE_IDS_JSON` 或 Stripe 账户下是否存在对应币种的启用价格。

## Mock 支付提示
- 前端 Result 页支持 `?mock_pay=true` 解锁，用于开发联调；请在上线前移除或仅在 `import.meta.env.DEV` 下启用（详见 `docs/development_notes.md`）。

## 目录速览
- `frontend/src`：路由、页面、store、API 封装（Axios 基于 `VITE_API_BASE_URL`）；后台卡面素材路径规范 `/assets/cards/01.jpg`~`78.jpg`（已在 DB 批量映射）。
- `backend/src`：`pay`、`admin`、`interp`、`questionnaire` 等模块；`entities` 下为 TypeORM 实体；`migrations` 为数据迁移。
- `sample-data/cards-example.json`：种子数据示例。

## 开发小贴士 (Tips / FAQ)

### Mock 支付 (解锁测试)
为了方便测试 Result 页的解锁逻辑（无需真实支付），可使用后门参数：
- **用法**: URL 后追加 `?mock_pay=true`
  - 例: `http://localhost:8080/result?mock_pay=true`
- **效果**: 强制页面显示为“已支付”状态（解锁所有卡牌和解读）。
- **注意**: 上线前请确保在 `Result.tsx` 中禁用或移除此逻辑，或改为仅在 `import.meta.env.DEV` 下生效。

