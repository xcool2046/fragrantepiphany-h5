# 部署指南 - fragrantepiphany-h5

本文档详细说明了如何在本地开发环境和生产服务器上部署本项目。
ssh root@47.243.157.75 你可以直接帮我部署，已做好无密码
## 1. 环境准备

### 本地开发环境
- **Node.js**: v18+
- **Docker & Docker Compose**: 用于启动数据库和完整环境模拟
- **Git**: 代码版本控制

### 生产服务器 (Ubuntu 22.04 推荐)
- **Docker & Docker Compose**: 核心运行环境
- **Nginx (宿主机)**: 作为反向代理，处理 SSL 和域名路由
- **Certbot**: 用于申请 SSL 证书
- **Git**: 拉取代码

---

## 2. 配置文件准备 (.env)

在项目根目录创建 `.env` 文件。**注意：本地和服务器的配置略有不同。**

### 通用配置 (本地 & 服务器)
```env
# 数据库配置 (Docker 内部连接)
DATABASE_URL=postgresql://tarot:tarot@db:5432/tarot

# Stripe 支付配置 (请替换为实际密钥)
STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_PUBLISHABLE_KEY_TEST=pk_test_xxx
STRIPE_SECRET_KEY_TEST=sk_test_xxx
STRIPE_PRICE_ID_CNY=price_xxx
STRIPE_PRICE_ID_USD=price_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# 后台管理员账号
ADMIN_USER=admin
ADMIN_PASS=admin
SESSION_SECRET=your_complex_session_secret
```

### 差异配置

| 变量名 | 本地开发 (Local) | 生产服务器 (Server) | 说明 |
| :--- | :--- | :--- | :--- |
| `PUBLIC_BASE_URL` | `http://localhost:8080` | `https://fragrantepiphany.com` | 前端访问地址，用于 Stripe 回调跳转 |
| `VITE_API_BASE_URL` | `http://localhost:3000` | `https://backend.fragrantepiphany.com` | 前端调用后端的 API 基准地址 |

---

## 3. 本地开发部署 (Local Development)

### 步骤 1: 启动服务
在项目根目录下运行：
```bash
# 构建并启动所有服务 (前端、后端、数据库、内部 Nginx)
docker-compose up -d --build
```

### 步骤 2: 访问验证
- **前端首页**: [http://localhost:8080](http://localhost:8080)
- **管理后台**: [http://localhost:8080/admin](http://localhost:8080/admin)
- **后端 API**: [http://localhost:3000](http://localhost:3000)

### 步骤 3: 常用命令
```bash
# 查看日志
docker-compose logs -f backend
docker-compose logs -f frontend

# 重启后端 (代码修改后)
docker-compose restart backend
```

---

## 4. 生产服务器部署 (Server Deployment)

服务器部署采用 **宿主机 Nginx + Docker 容器** 的架构。
- **宿主机 Nginx**: 监听 80/443，处理 SSL，根据域名转发流量。
- **Docker 容器**: 运行应用服务，映射端口到宿主机 (Frontend: 8080, Backend: 3000)。

### 步骤 1: 克隆代码
```bash
cd /root
git clone https://github.com/xcool2046/fragrantepiphany-h5.git
cd fragrantepiphany-h5
```

### 步骤 2: 配置环境变量
创建并编辑 `.env` 文件，填入生产环境配置 (参考第 2 节)。

### 步骤 3: 启动 Docker 服务
```bash
# 确保端口未被占用 (8080, 3000, 5432)
docker compose up -d --build
```

### 步骤 4: 配置宿主机 Nginx

你需要配置两个域名：
1.  `fragrantepiphany.com`: 主站 (前端)
2.  `backend.fragrantepiphany.com`: 后台管理 & API

#### A. 主站配置 (`/etc/nginx/sites-available/my-website`)
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name fragrantepiphany.com www.fragrantepiphany.com;

    # SSL 配置 (Certbot 生成)
    ssl_certificate /etc/letsencrypt/live/fragrantepiphany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fragrantepiphany.com/privkey.pem;

    # 转发到 Docker 内部 Nginx (8080)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

#### B. 后台 & API 配置 (`/etc/nginx/sites-available/backend`)
```nginx
server {
    listen 80;
    listen 443 ssl;
    server_name backend.fragrantepiphany.com;

    ssl_certificate /etc/letsencrypt/live/fragrantepiphany.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/fragrantepiphany.com/privkey.pem;

    # 1. 访问根路径 -> 跳转到 /admin (管理后台)
    location = / {
        return 301 /admin;
    }

    # 2. API 请求 -> 转发到后端容器 (3000)
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 3. 其他请求 (管理后台页面资源) -> 转发到前端容器 (8080)
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 步骤 5: 启用配置并重启 Nginx
```bash
ln -s /etc/nginx/sites-available/my-website /etc/nginx/sites-enabled/
ln -s /etc/nginx/sites-available/backend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 步骤 6: 初始化数据库
```bash
# 进入后端容器执行迁移
docker compose exec backend npm run migration:run
```

---

## 5. 一键部署 (推荐)

为了简化部署流程，项目根目录提供了一个 `deploy.sh` 脚本，自动处理代码提交、推送和服务器更新。

### 使用方法

在本地终端运行：

```bash
# ./deploy.sh "您的提交信息"
./deploy.sh "fix: update UI layout"
```

该脚本会自动执行以下操作：
1.  `git add .` & `git commit`
2.  `git push`
3.  SSH 连接服务器
4.  `git pull`
5.  `docker compose up -d --build`
6.  `docker compose restart nginx`

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
