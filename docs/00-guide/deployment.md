# 部署指南 - fragrantepiphany-h5

本文档说明本地与生产的部署方式，保留现有服务器信息供内部使用。  
ssh root@47.243.157.75 你可以直接帮我部署，已做好无密码

## 1. 环境准备
### 本地
- Node.js 18+
- Docker / Docker Compose
- Git

### 生产（示例：Ubuntu 22.04）
- Docker / Docker Compose
- Nginx（宿主机反代 80/443，SSL 证书用 Certbot）
- Git

## 2. 环境变量 (.env)
根目录创建 `.env`（不要提交），字段与 `.env.example` 一致：
```env
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_PUBLISHABLE_KEY_TEST=
STRIPE_SECRET_KEY_TEST=
STRIPE_WEBHOOK_SECRET=
DATABASE_URL=postgresql://tarot:tarot@db:5432/tarot
PORT=3000
HOST=0.0.0.0
SESSION_SECRET=
ADMIN_USER=admin
ADMIN_PASS=admin
PUBLIC_BASE_URL=http://localhost:4173
VITE_API_BASE_URL=http://localhost:3000
```
- 支付价格取自 Stripe Dashboard 的 price，建议在 `STRIPE_PRICE_IDS_JSON`（或 `_TEST`）中为各币种配置对应的 price_id；未填则后端会调用 Stripe API 按币种抓取首个启用的价格并缓存，仍推荐显式配置以避免抓到错误 price。
- `PUBLIC_BASE_URL` 会拼接 `/pay/callback` 作为 Stripe 回跳地址，请与实际域名一致。
- Feature flags（后端）：`FEATURE_ADMIN_ORDERS` / `FEATURE_ADMIN_PRICING`，默认关闭。

## 3. 本地运行（Docker Compose）
```bash
docker compose up --build
docker compose exec backend npm run typeorm -- migration:run
docker compose exec backend npm run seed
```
- 端口：nginx 8080（挂载前端 dist，/api 反代 backend:3000），db 5432。
- 访问：前端/后台 `http://localhost:8080`。
- Stripe Webhook（本地）可用 `stripe listen` 转发到 `http://localhost:3000/api/pay/webhook`，将 whsec 写入 `.env`。

## 4. 生产部署（仅手动流程，已移除 deploy.sh）
后台入口 `/admin`（登录后默认落到 `/admin/interpretations`），请确认 `.env` 的 `ADMIN_USER/ADMIN_PASS` 已按需设置。  
**不再使用脚本，严格按下列手动步骤执行，避免脚本失败耽误：**

1) **推代码**：确保本地改动已 `git commit` 并 `git push`。
2) **本地前端构建**：
   ```bash
   cd frontend
   VITE_API_BASE_URL=/api npm run build
   ```
3) **上传前端静态**（仅 dist，避免 node_modules/.env）：
   ```bash
   rsync -av --delete frontend/dist/ root@47.243.157.75:/root/fragrantepiphany-h5/frontend/dist/
   ```
4) **同步后端与配置（可选）**：
   ```bash
   rsync -av --delete --exclude 'node_modules' --exclude '.git' --exclude '.env' backend nginx.conf docker-compose*.yml root@47.243.157.75:/root/fragrantepiphany-h5
   ```
   （若已推代码，也可直接在服务器 `git pull`）
5) **服务器执行**：
   ```bash
   ssh root@47.243.157.75
   cd /root/fragrantepiphany-h5
   git pull  # 若第4步已 rsync 覆盖可跳过
   docker compose up -d --build backend nginx  # 重建后端并加载最新 nginx.conf
   docker compose exec backend npm run typeorm -- -d dist/ormconfig.js migration:run
   docker compose restart nginx
   ```
6) **验证**：硬刷新 https://fragrantepiphany.com（Console 无 MIME 报错）；https://backend.fragrantepiphany.com 自动跳转 `/admin`；`curl 127.0.0.1:3000/api/health` 返回 200/JSON。
6) 宿主机 Nginx 反代示例（80/443 → 容器 8080/3000）：
```nginx
server {
  listen 80;
  listen 443 ssl;
  server_name fragrantepiphany.com www.fragrantepiphany.com;
  ssl_certificate /etc/letsencrypt/live/fragrantepiphany.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/fragrantepiphany.com/privkey.pem;
  location / { proxy_pass http://127.0.0.1:8080; }
}

server {
  listen 80;
  listen 443 ssl;
  server_name backend.fragrantepiphany.com;
  ssl_certificate /etc/letsencrypt/live/fragrantepiphany.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/fragrantepiphany.com/privkey.pem;
  # 后台直接访问 /admin
  location = / { return 301 /admin; }
  # API 请求转发到后端容器端口 3000
  location /api/ { proxy_pass http://127.0.0.1:3000; }
  # 其他请求（如后台静态资源）转发到前端容器端口 8080
  location / { proxy_pass http://127.0.0.1:8080; }
}
```
7) 重载 Nginx（宿主机反代）：`nginx -t && systemctl reload nginx`

---

## 5. 快速自查 / 手动部署步骤
若部署异常，可按以下顺序在服务器执行：
1) `cd /root/fragrantepiphany-h5 && git pull`
2) 确认 `.env` 存在且含 `PORT=3000`、`HOST=0.0.0.0`、正确域名 / Stripe key
3) `docker compose up -d --build`
4) 迁移：`docker compose exec backend npm run typeorm -- -d dist/ormconfig.js migration:run`
5) 健康检查：`docker compose ps`（backend/nginx == Up），`curl 127.0.0.1:3000/api/health`
6) Nginx：`nginx -t && systemctl reload nginx`
常见 502 处理：看后端日志 `docker compose logs backend --tail=100`，检查端口监听 `ss -lntp | grep 3000`，以及 Nginx 反代是否仍指向 127.0.0.1:3000。

## 9. 资源路径说明
- 卡牌素材：`frontend/src/assets/cards/01.jpg`~`78.jpg`，构建后访问路径 `/assets/cards/XX.jpg`；数据库 `cards.image_url` 已批量映射到该规范。
- 上传文件：后端通过 `/uploads` 提供，Nginx 与 Vite dev 已配置代理。
- 旧版前端与资料已归档在 `docs/archive/`，生产不需部署。

## 7. 验证部署

| 访问地址 | 预期结果 |
| :--- | :--- |
| `https://fragrantepiphany.com` | 显示前端首页 |
| `https://backend.fragrantepiphany.com` | 跳转至 `/admin` 显示后台登录页 |
| `https://backend.fragrantepiphany.com/api/pay/create-session` | 返回 API 响应 (如 400/500 JSON) |

## 8. 常见问题排查

- **支付报错 "Unknown parameter"**: 检查 `backend/src/pay/pay.service.ts`，确保使用的是 `payment_method_types: ['card']` 且 Docker 镜像已重新构建。
- **后台 404**: 检查 `backend` 域名的 Nginx 配置是否正确转发了非 `/api` 请求到 8080 端口。
- **CORS 错误**: 确保 `.env` 中的 `VITE_API_BASE_URL` 与实际访问的 API 域名一致。
```
