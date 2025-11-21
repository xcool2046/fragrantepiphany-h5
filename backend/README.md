# Backend（NestJS + TypeORM）

> 简要说明，完整流程请见项目根目录的 `docs/dev-guide.md` 与 `docs/deploy-guide.md`。

## 快速开始（本机）
```bash
npm install
npm run build
npm run typeorm -- migration:run
npm run seed             # 导入 sample-data/cards-example.json
npm run start:dev        # http://localhost:3000
```

## 环境变量（根 `.env`）
- `DATABASE_URL`（例如 `postgresql://tarot:tarot@db:5432/tarot`）
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `PUBLIC_BASE_URL`（拼接回调 `/pay/callback`）
- `ADMIN_USER` / `ADMIN_PASS` / `SESSION_SECRET`
- 可选：`FEATURE_ADMIN_ORDERS`、`FEATURE_ADMIN_PRICING`

## 支付与价格
- `config.json`（根目录，可选）支持 `price_usd`/`price_cny`，当前代码强制使用 USD 金额。未提供时默认 500 美分（$5）。

## 常用命令
- 开发：`npm run start:dev`
- 构建：`npm run build`
- 测试：`npm run test`（如需）
- Lint：`npm run lint`
