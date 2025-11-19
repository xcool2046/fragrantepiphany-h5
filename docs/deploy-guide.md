# 部署指南 - fragrantepiphany-h5

## 前置条件
- 服务器已安装 Docker 与 Docker Compose
- 宿主机已安装 Nginx，并有权限在 `/etc/nginx/sites-enabled/` 写入配置
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

> 📌 **注意**：`PUBLIC_BASE_URL` 必须是 Stripe 能访问的完整域名（本地调试可用 `http://localhost:8080`），否则 Stripe 创建 Checkout Session 会报 `url_invalid`，前端便会看到 “Failed to create payment session”。上线前务必填入正式 HTTPS 域名。

> 🛠️ **服务器登录**：已在云主机上配置免密登录，可直接使用 `ssh root@47.243.157.75` 进入部署机，然后按照本指南运行 `docker compose build && docker compose up -d` 即可。若需切换分支或更新代码，登录后 `cd /home/code/h5-web` 操作。

## 3. Nginx 反代配置（宿主机）
此仓库的 `docker-compose.yml` 中，容器内 `nginx` 端口映射为 `8080:80`，留出宿主机 80/443 给反向代理。服务器上请在 `/etc/nginx/sites-enabled/my-website`（或自定义）设置反代，并在宿主机完成 SSL 终止，例如：
```
server {
    listen 80;
    listen 443 ssl;
    server_name fragrantepiphany.com;

    ssl_certificate /etc/letsencrypt/live/fragrantepiphany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fragrantepiphany.com/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name backend.fragrantepiphany.com;
    return 301 https://fragrantepiphany.com$request_uri;
}
```
说明：
- 宿主机 Nginx 处理 80/443 和证书，流量转发到本地 `127.0.0.1:8080`（容器内 Nginx）。
- **不要**把 Compose 端口改回 `80:80`，以免与宿主机 Nginx 冲突。
- HTTPS 证书示例使用 Let’s Encrypt 路径，按实际证书调整。

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
- 前端： https://fragrantepiphany.com （HTTP 会经宿主机/Cloudflare 跳转或透传到 8080）
- 后端： https://fragrantepiphany.com/api/interp/draw（已由宿主机 Nginx 反向到容器）
- 后台： https://fragrantepiphany.com/admin
  - 默认账号：`admin`
  - 默认密码：`admin` (请在 .env 中修改)
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
