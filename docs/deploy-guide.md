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
- 当前支付逻辑使用 `config.json`（可选）里的 `price_usd`，默认为 500（即 $5）。`STRIPE_PRICE_ID_*` 已不再使用。
- `PUBLIC_BASE_URL` 会拼接 `/pay/callback` 作为 Stripe 回跳地址，请与实际域名一致。
- Feature flags（后端）：`FEATURE_ADMIN_ORDERS` / `FEATURE_ADMIN_PRICING`，默认关闭。

## 3. 本地运行（Docker Compose）
```bash
docker compose up --build
docker compose exec backend npm run typeorm -- migration:run
docker compose exec backend npm run seed
```
- 端口：nginx 8080（转发 frontend 4173 / backend 3000），db 5432。
- 访问：前端/后台 `http://localhost:8080`。
- Stripe Webhook（本地）可用 `stripe listen` 转发到 `http://localhost:3000/api/pay/webhook`，将 whsec 写入 `.env`。

## 4. 生产部署（示例流程）
1) SSH 登录（已开免密）：`ssh root@47.243.157.75`  
2) 代码：`cd /root/fragrantepiphany-h5`（首次需 `git clone https://github.com/xcool2046/fragrantepiphany-h5.git`）。  
3) `.env`：参考第 2 节填写生产值（尤其是 Stripe live key 与 webhook secret，`PUBLIC_BASE_URL=https://fragrantepiphany.com`，`VITE_API_BASE_URL=https://backend.fragrantepiphany.com`）。  
4) 构建/启动：
```bash
docker compose up -d --build
docker compose exec backend npm run typeorm -- migration:run
```
5) 宿主机 Nginx 反代示例（80/443 → 容器 8080/3000）：
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
  location = / { return 301 /admin; }
  location /api/ { proxy_pass http://127.0.0.1:3000; }
  location / { proxy_pass http://127.0.0.1:8080; }
}
```
6) 重载 Nginx：`nginx -t && systemctl reload nginx`

## 5. 一键部署脚本（deploy.sh）
```bash
./deploy.sh "commit message"
```
- 动作：git add/commit/push → SSH 服务器拉代码 → `docker compose up -d --build` → `docker compose restart nginx`。  
- 服务器地址/IP 与免密登录已保留在脚本中，必要时请先确认机器状态再执行。

---

## 6. 验证部署

| 访问地址 | 预期结果 |
| :--- | :--- |
| `https://fragrantepiphany.com` | 显示前端首页 |
| `https://backend.fragrantepiphany.com` | 跳转至 `/admin` 显示后台登录页 |
| `https://backend.fragrantepiphany.com/api/pay/create-session` | 返回 API 响应 (如 400/500 JSON) |

## 6. 常见问题排查

- **支付报错 "Unknown parameter"**: 检查 `backend/src/pay/pay.service.ts`，确保使用的是 `payment_method_types: ['card']` 且 Docker 镜像已重新构建。
- **后台 404**: 检查 `backend` 域名的 Nginx 配置是否正确转发了非 `/api` 请求到 8080 端口。
- **CORS 错误**: 确保 `.env` 中的 `VITE_API_BASE_URL` 与实际访问的 API 域名一致。
```
