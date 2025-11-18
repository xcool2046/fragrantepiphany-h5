# 部署指南 - fragrantepiphany-h5

## 前置条件
- 服务器已安装 Docker 与 Docker Compose
- 域名解析：
  - fragrantepiphany.com -> 服务器 IP
  - backend.fragrantepiphany.com -> 服务器 IP
- Stripe 密钥与 price_id、webhook secret 可用（测试/正式二选一）
- 服务器可访问外网（拉取镜像、npm）

## 1. 克隆代码
```bash
git clone https://github.com/xcool2046/fragrantepiphany-h5
cd fragrantepiphany-h5
```

## 2. 准备 .env（放在仓库根目录）
示例（请替换实际值，不要提交到 Git）：
```
DATABASE_URL=postgresql://tarot:tarot@db:5432/tarot

STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_xxx
STRIPE_SECRET_KEY_TEST=sk_test_xxx
STRIPE_PRICE_ID_CNY=price_xxx   # RMB 15
STRIPE_PRICE_ID_USD=price_xxx   # USD 5
STRIPE_WEBHOOK_SECRET=whsec_xxx

PUBLIC_BASE_URL=https://fragrantepiphany.com
VITE_API_BASE_URL=https://backend.fragrantepiphany.com

ADMIN_USER=monicacjx
ADMIN_PASS=kittycjx88358985
SESSION_SECRET=your_session_secret
```

## 3. Nginx 反代配置（容器内 nginx）
`nginx.conf` 内容示例（仓库根已有，可替换为如下）：
```
events {}
http {
  server {
    listen 80;
    server_name fragrantepiphany.com;
    location / { proxy_pass http://frontend:4173; }
  }
  server {
    listen 80;
    server_name backend.fragrantepiphany.com;
    location / { proxy_pass http://backend:3000; }
  }
}
```
如需 HTTPS，增加 443 server 块并加载证书/私钥（可用 certbot 配置）。

## 4. 构建并启动
```bash
docker-compose build --no-cache frontend backend
docker-compose up -d
```
预期容器：h5-web-frontend-1、h5-web-backend-1、h5-web-db-1、h5-web-nginx-1。

## 5. 初始化数据库（迁移+种子）
在宿主机执行（连接 compose 的 Postgres）：
```bash
cd backend
DATABASE_URL=postgresql://tarot:tarot@localhost:5432/tarot node scripts/run-init.js
```
此脚本会：
- 确保表结构（解读/订单/用户）
- 运行迁移
- 导入 sample-data/cards-example.json

## 6. 验证
- 前端： http://fragrantepiphany.com （若配 HTTPS 则用 https）
- 后端： http://backend.fragrantepiphany.com/api/interp/draw
- 支付：使用 Stripe 测试密钥走一遍 Checkout，回调应命中 `/api/pay/webhook`。

## 7. 常用命令
- 查看容器：`docker ps`
- 查看日志：
  - `docker logs h5-web-frontend-1`
  - `docker logs h5-web-backend-1`
  - `docker logs h5-web-nginx-1`
- 重新构建单个服务：`docker-compose build --no-cache frontend`（或 backend）
- 重启：`docker-compose up -d`

## 8. Firecrawl 抓取
当域名可公网访问后，可用 Firecrawl 或第三方爬虫对 `https://fragrantepiphany.com` 进行抓取检测。若需协助，请提供域名前端可访问确认。

## 9. HTTPS（可选）
如需 HTTPS：
- 确保 80/443 端口开放
- 使用 certbot 或已有证书，更新 nginx.conf 增加 443 server 块，加载证书/私钥，对应前后端域名。
