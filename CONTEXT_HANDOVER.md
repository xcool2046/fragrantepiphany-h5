## 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**：生产环境问题排查与修复 / 数据本地化（中译英） / UI 细节优化。
- **已验证功能**：
  1. **数据库完整性**：通过 `verify_admin_perfume.ts` 脚本确认生产库中 `admin` 用户和 148 条香水数据均存在。
  2. **前端布局优化**：本地验证了 Result 页面的条件渲染布局和 Perfume 页面的新设计（间距、斜体、按钮样式）。
  3. **构建配置修复**：确认 `frontend/.env.production` 能够强制指定 `VITE_API_BASE_URL=/api`，解决了生产环境前端连不上后端的问题（待部署验证）。
  4. **前端国际化**：用户已手动替换 `Breath.tsx`, `Result.tsx`, `PerfumePage.tsx` 中的硬编码文本为 i18n 键值。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **生产环境前端连接问题**：
  - **症状**：生产环境 Admin Login 报 "Invalid credentials"（实际是网络/404错误），Perfume 页面加载失败。
  - **无效尝试**：依赖默认构建配置（Vite 默认 base 为 `/`，但 API 请求若不走 Nginx 代理会跨域或 404）。
  - **解决方案**：创建 `frontend/.env.production` 写入 `VITE_API_BASE_URL=/api`。配合 Nginx 的 `location ^~ /api { proxy_pass ... }` 配置，确保生产环境请求正确转发至后端容器。
- **布局高度自适应**：
  - **场景**：Result 页面“未解锁”状态下内容重叠或留白过多。
  - **解决方案**：移除绝对定位覆盖层，改用 React 条件渲染 (`{!isUnlocked ? <LockedContent/> : <UnlockedContent/>}`)，让容器高度由实际内容撑开。
- **数据验证脚本**：
  - **技巧**：在 `backend/scripts/` 下编写独立的 `ts-node` 脚本（如 `verify_admin_perfume.ts`），直接引用 TypeORM Entity 连接生产数据库进行“只读”检查，比手敲 SQL 更安全且能复用业务逻辑。

## 🚧 遗留难点与待办 (Pending Issues)
- **香水数据缺失英文翻译 (Missing Translations)**
  - **状态**：进行中。已定位到约 1500 条（含重复引用）香水记录缺失 `description_en`, `quote_en`, `notes_top_en`。
  - **当前卡点**：已导出缺失数据到 `backend/missing_perfumes.json` 并提取去重文本到 `backend/translation_source.json`。**急需生成翻译后的 JSON 数据文件**。
  - **接着查**：查看 `backend/scripts/generate_translations.ts`（草稿状态）和 `backend/scripts/update_perfume_en_full.ts`（更新逻辑已就绪，只差数据源）。
- **生产环境部署验证**
  - **状态**：待验证。
  - **待办**：执行 `./deploy.sh` 将前端配置修复和后端代码推送到服务器，并验证 Admin 登录和 Perfume 页面加载是否恢复正常。

## 📂 核心文件结构 (Core Directory Structure)
- `backend/`
  - `src/entities/perfume.entity.ts` # 香水实体定义，对应 `perfumes` 表
  - `scripts/`
    - `verify_admin_perfume.ts`    # [工具] 验证生产库 Admin 和香水数据
    - `dump_missing_en.ts`         # [工具] 导出缺失英文的香水数据
    - `update_perfume_en_full.ts`  # [工具] 读取 JSON 批量更新数据库英文通过 (待执行)
    - `generate_translations.ts`   # [草稿] 用于生成翻译的脚本
  - `missing_perfumes.json`        # [临时] 导出的缺失数据源
  - `translation_source.json`      # [临时] 提取的去重待翻译文本
- `frontend/`
  - `.env.production`              # [关键] 生产环境构建配置
  - `src/components/PerfumePage.tsx` # 香水详情页组件 (已优化布局)
  - `src/pages/Result.tsx`         # 结果页组件 (已优化布局)
- `deploy.sh`                      # 自动化部署脚本

## ➡️ 下一步指令 (Next Action)
1. **完成翻译数据生成**：
   - 读取 `backend/translation_source.json`。
   - 利用 AI 能力将其中文内容翻译为英文（注意保留 Tarot 风格和香水专业术语）。
   - 生成 `backend/scripts/perfume_data_en.json`，格式需匹配 `update_perfume_en_full.ts` 的读取要求（`[{id, desc_en, quote_en, notes_en}, ...]`）。
2. **执行数据更新**：
   - 在 `backend` 目录下运行 `npx ts-node scripts/update_perfume_en_full.ts`，将翻译写入数据库。
3. **部署修复**：
   - 在根目录执行 `./deploy.sh`。
   - 这一步会将前端的 `.env.production` 配置生效，并更新后端的 Entity 定义和数据。
4. **最终验证**：
   - 访问线上 Admin Panel (`/admin/admin`) 确认登录成功。
   - 访问 H5 Perfume 页面，确认加载正常且英文文案显示正确（不再回退显示中文）。
