# Fragrant Epiphany H5

> A Tarot reading experience with perfume recommendations.

## 📚 文档索引
- **需求与范围**：`docs/requirements.md`
- **开发指南**：`docs/dev-guide.md`
- **部署指南**：`docs/deploy-guide.md`
- **页面内容要点**：`docs/page-content.md`
- **UI 规范**：`docs/ui.md`
- **品牌基调**：`docs/brand.md`
- **后台方案**：`docs/admin-plan.md`
- **开发笔记 / 预发布检查**：`docs/development_notes.md`
- **历史方案归档**：`docs/archive/`

## 🚀 快速开始（Docker Compose）
1. 安装 Docker / Docker Compose（v2 以上）。
2. `cp .env.example .env` 并填好 Stripe/数据库/管理员账号等变量。
3. 若修改过前端代码，先 `cd frontend && npm install && npm run build` 产出 `dist/`（容器直接挂载静态文件，不再单独启动前端服务）。
4. `docker compose up --build`（默认端口：backend 3000，nginx 8080 统一提供前端/后台，db 5432）。
5. 访问前端 `http://localhost:8080`，后台 `http://localhost:8080/admin`。本地开发模式（Vite）访问 `http://localhost:4173/admin`，默认账号/密码 `admin / admin`（登录后默认进入 Interpretations）。

## 资源与归档
- 卡牌素材：`frontend/src/assets/cards/01.jpg` ~ `78.jpg`，构建后访问路径 `/assets/cards/XX.jpg`；数据库 `cards.image_url` 需按此规范（已批量更新）。
- 旧版前端与资料已归档在 `docs/archive/`（含 `frontend_old`、ppt/xlsx 资料）。

更详细的环境变量、迁移、种子数据与 Nginx 反代示例见 `docs/dev-guide.md` 与 `docs/deploy-guide.md`。
