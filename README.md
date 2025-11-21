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
3. `docker compose up --build`（默认端口：前端 4173，后端 3000，Nginx 8080）。
4. 访问前端 `http://localhost:8080`，后台 `http://localhost:8080/admin`。

更详细的环境变量、迁移、种子数据与 Nginx 反代示例见 `docs/dev-guide.md` 与 `docs/deploy-guide.md`。
