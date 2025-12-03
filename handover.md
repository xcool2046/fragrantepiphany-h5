# 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**：Perfume 数据治理与 Admin UI 本地化阶段。重点在于修复香水数据的英文缺失问题，以及 Admin 后台的中文适配。
- **已验证功能**：
  1. **Admin UI 本地化**：`Perfumes.tsx` 已完成全量汉化（标题、按钮、表单），已在前端验证。
  2. **基础数据同步**：运行了 `sync_perfume_names.ts`，将 `brand_name`/`product_name` 同步到 `_en` 字段（作为兜底），修复了 312 条数据。
  3. **保存报错修复**：后端 `admin.controller.ts` 已处理 Postgres 23505 唯一键冲突错误，前端可正确提示“ID重复”。

# 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **数据演进策略**：
  - **问题**：历史数据只有 `brand_name` (混合语言)，新需求要求分离 `_zh` 和 `_en`。
  - **方案**：TypeORM Migration 添加 `_en` 列 -> 脚本 `sync_perfume_names.ts` 进行存量数据迁移/兜底 -> 后续通过 Admin 面板维护。
  - **技巧**：使用 `ts-node` 运行独立脚本操作 TypeORM DataSource，需注意 `dotenv` 加载路径 (`path: __dirname + '/.env'`) 和 SSL 连接配置。
- **Admin 交互优化**：
  - **自动填充**：前端 `Perfumes.tsx` 监听 `card_id` 变化，自动从后端获取 `card_name`，避免人工输入错误。
  - **错误处理**：后端拦截底层 DB 错误，转换为 HTTP 400 + 友好 Message 返回给前端。

# 🚧 遗留难点与待办 (Pending Issues)
- **缺失英文描述 (Critical)**：
  - **状态**：进行中。用户反馈 "Oud Satin Mood" (Card ID 78) 等香水的 `description_en` 仍为空或显示中文。
  - **排查进度**：
    - 已检查 `perfume_translations_final.json` 和 `batch1`，**未找到** "Oud Satin Mood" 的翻译。
    - 数据库查询确认 ID 459 (Oud Satin Mood) 的 `description_en` 为空。
    - 怀疑翻译源文件遗漏，或位于 `assets/excel_files` 中的原始 Excel 表格里。
  - **下一步**：必须找到这部分缺失数据的来源（可能是 `perfume.xlsx` 或其他 Excel），提取并写入数据库。

# 📂 核心文件结构 (Core Directory Structure)
- `backend/`
  - `src/entities/perfume.entity.ts` # 香水实体定义，包含 `_en` 和 `_zh` 字段
  - `src/admin/admin.controller.ts`  # Admin 接口，含香水 CRUD 和错误处理
  - `sync_perfume_names.ts`          # [工具脚本] 用于同步名称字段 (已验证可用)
  - `check_perfume_data.ts`          # [工具脚本] 用于排查特定香水数据
  - `perfume_translations_*.json`    # 翻译源文件 (目前发现不全)
- `frontend/`
  - `src/pages/admin/Perfumes.tsx`   # 香水管理页 (已汉化)
- `assets/`
  - `excel_files/`                   # 原始数据源 (Excel)，可能是缺失数据的藏身处

# ➡️ 下一步指令 (Next Action)
1. **定位缺失数据源**：
   - 优先检查 `assets/excel_files/` 目录下的 Excel 文件（如 `perfume.xlsx` 或类似），查找 "Oud Satin Mood" 的英文描述。
   - 如果 Excel 中也没有，需询问用户提供或使用翻译 API 生成。
2. **补充数据迁移脚本**：
   - 参考 `sync_perfume_names.ts`，编写新脚本读取找到的数据源，更新 `description_en`, `quote_en`, `notes_*_en` 字段。
   - **注意**：不要覆盖已有的正确数据，仅更新 NULL 或空值。
3. **验证修复**：
   - 运行脚本后，使用 `check_perfume_data.ts` 验证 ID 459 的数据。
   - 通知用户在 Admin 面板刷新查看。
4. **清理**：
   - 确认无误后，删除临时的 `check_*.ts` 和 `sync_*.ts` 脚本，保持项目整洁。
