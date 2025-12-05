## 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**：生产环境部署与数据一致性修复阶段。重点在于解决本地与线上数据源不一致、标签语言错误及英文数据缺失问题。
- **已验证功能**：
  1. **自动化部署**：`deploy.sh` 可成功构建前后端、同步文件并重启服务（通过日志验证）。
  2. **卡牌名称同步**：`ensure_cards_correct.ts` 脚本能强制将生产库的 78 张卡牌名称修正为标准简体中文/英文，解决了因繁体字导致的导入失败问题（已验证导入数量从 268 恢复至 312）。
  3. **中文标签修复**：已将数据源替换为 `master (3).xlsx` 并修改导入脚本读取中文标签列，解决了线上标签显示英文的问题（通过部署日志验证）。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **数据一致性保障**：
  - **问题**：生产库卡牌名称可能被意外修改或存在繁体字，导致 Excel 导入时无法匹配卡牌 ID。
  - **方案**：在 `deploy.sh` 中增加前置步骤 `ensure_cards_correct.ts`，每次部署前强制刷新 `cards` 表的基础数据（中英文名），确保“本地对，线上一定对”。
  - **技巧**：在 `import_perfume_data.ts` 中增加 `normalizeCardName` 函数，自动处理 Excel 中的繁体宫廷称号（如“國王”->“国王”）。

- **数据源管理**：
  - **约定**：根目录下的 `master (3).xlsx` 是唯一正确的数据源（包含中文标签）。
  - **操作**：部署时将其复制到 `assets/excel_files/perfume_master.xlsx`，供后端脚本读取。**切勿使用旧版 `perfume_master.xlsx`**。

- **部署流程**：
  - 使用 `deploy.sh` 一键部署。它包含：本地构建 -> rsync 同步 -> Docker 远程执行命令（包括数据修复和导入脚本）。

## 🚧 遗留难点与待办 (Pending Issues)
- **英文数据缺失与不匹配** (High Priority)
  - **状态**：用户反馈“英文缺失，数据对不上”。初步排查发现 `import_perfume_data.ts` 可能未正确映射 Excel 中的英文列，或依赖的翻译文件 `perfume_translations_final.json` 不完整。
  - **卡点**：需要确认 `master (3).xlsx` 中的 "English Name" 列应映射到哪个字段（`product_name_en`?），以及 `description_en` 的来源是否可靠。
  - **线索**：检查 `backend/import_perfume_data.ts` 第 240-260 行的映射逻辑；检查 `backend/perfume_translations_final.json` 内容。

- **本地与线上数据源差异**
  - **说明**：本地数据是通过 Migration (`1764238000000-seed-perfumes.ts`) 硬编码写入的，而线上是通过 Excel 导入的。这导致本地测试通过但线上可能挂。
  - **建议**：长期来看应统一使用 Excel 导入作为唯一数据来源，废弃硬编码 Migration。

## 📂 核心文件结构 (Core Directory Structure)
- `backend/import_perfume_data.ts`      # 核心数据导入脚本，负责解析 Excel 并写入 DB
- `backend/scripts/ensure_cards_correct.ts` # 卡牌名称强制同步脚本，修复数据基线
- `deploy.sh`                           # 自动化部署脚本，包含构建、同步和远程命令执行
- `master (3).xlsx`                     # **唯一真理**数据源，包含正确的中文标签和卡牌映射
- `backend/src/migrations/1764238000000-seed-perfumes.ts` # 本地开发用的种子数据（注意：含硬编码数据）
- `frontend/src/api.ts`                 # 前端 API 接口定义，已重构为使用配置化路径

## ➡️ 下一步指令 (Next Action)
1. **紧急修复英文数据**：
   - 立即检查 `backend/import_perfume_data.ts`。
   - 确认 `master (3).xlsx` 中的 "English Name" 列是否应该写入 `product_name_en`。
   - 检查 `description_en` 是否正确从 JSON 文件加载，若缺失需寻找补充源。
2. **验证数据完整性**：
   - 编写脚本对比 Excel 源数据与数据库中的实际数据（特别是英文特定字段）。
3. **清理旧数据文件**：
   - 确认 `assets/excel_files/` 下的旧文件已被清理，避免误用。
4. **统一数据流**：
   - 考虑在本地开发环境也运行 `import_perfume_data.ts` 来替代 Migration，确保开发与生产环境行为一致。
