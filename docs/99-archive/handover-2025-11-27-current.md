# 交接文档（最新）

## 1. 当前进度
- **规则功能移除**：删除 `rules` 表（迁移 `1764239000000-drop-rules.ts`）、移除 Rule 实体和前后台入口；`matchRule` 仅用三张牌默认解读拼合返回合成结果。
- **Nginx MIME 修复**：`nginx.conf` 已包含 `include /etc/nginx/mime.types; default_type application/octet-stream;`，防止 JS 被当 text/plain。
- **生产同步**：已将前端 dist、后端代码和 nginx.conf rsync 到 `/root/fragrantepiphany-h5`，重建 backend、执行迁移（无 pending）、重启 nginx。
- **部署文档与脚本**：`docs/deploy-guide.md` 只保留手动流程；`deploy.sh` 重写为手动辅助脚本（本地构建/rsync/远程 compose + 迁移 + 重启）。

## 2. 已解决

- 访问空规则数据导致匹配缺失的问题：规则路径已移除，使用默认解读拼合。

## 3. 遗留/关注
- 生产白屏（JS MIME text/plain）已修；Nginx 配置更新并重启。
- 确认生产静态资源是否完整：`curl -I https://fragrantepiphany.com/assets/index-*.js` 应为 `Content-Type: application/javascript`；如缺少 `index-*.js` 或被返回 text/html/plain，需重新上传 dist 并清缓存/CDN。
- 本地有大量未提交改动（`git status` 很多 M/D/新增），后续操作前需梳理并分批提交，避免脏文件同步。
- 前端 dist 上传需确保包含主入口 JS；容器内 `/var/www/html/assets` 目前仅少量 JS，需核实 Cloudflare/缓存覆盖情况。

## 4. 核心文件/目录
- 后端：`backend/src/interp/interp.controller.ts`（合成解读）、`backend/src/migrations/1764239000000-drop-rules.ts`、模块文件已去除 Rule。
- 前端：`frontend/src/pages/admin/AdminLayout.tsx` & `frontend/src/main.tsx` 去掉 Rules；`frontend/src/pages/admin/Rules.tsx` 已删；`frontend/src/api.ts` 仍保留 matchRule 调用（后端返回合成结果）。
- 配置/部署：`nginx.conf`、`docker-compose.yml`（nginx 挂载 `frontend/dist`，backend 3000，db 5432）、`deploy.sh`（最新手动辅助）。
- 文档索引：`README.md`（索引与快速开始）、`docs/deploy-guide.md`（手动部署）、`docs/dev-guide.md`（环境/迁移说明）。
- 资源：卡牌 `frontend/src/assets/cards/01.jpg`~`78.jpg`；解析 Excel `事业正式.xlsx`/`感情正式.xlsx`/`自我正式.xlsx`（rules 已废弃）。

## 5. 手动部署要点（摘要）
1) 本地：`cd frontend && VITE_API_BASE_URL=/api npm run build`
2) rsync：`rsync -av --delete frontend/dist/ root@47.243.157.75:/root/fragrantepiphany-h5/frontend/dist/`
3) 若需同步后端/配置：排除 `node_modules/.git/.env/uploads` 后 rsync。
4) 服务器：`docker compose up -d --build backend nginx && docker compose exec backend npm run typeorm -- -d dist/ormconfig.js migration:run && docker compose restart nginx`
5) 验证：硬刷新前端、检查 Console 无 MIME 报错；`curl 127.0.0.1:3000/api/health`。

## 6. 快速检查列表
- 静态 JS Content-Type 是否正确？
- dist 是否包含 `index-*.js` 并已上传？
- 迁移命令是否使用 `-d dist/ormconfig.js`？
- 本地未提交改动是否需整理/提交？
