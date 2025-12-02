# Handover Document

## 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**：生产环境数据修复与验证 (Production Data Fix & Verification)。
- **已完成**：
  - **Self & Love 数据修复**：发现 `自我正式.xlsx` 和 `感情正式.xlsx` 包含英文数据，通过 `import_self_love_en.ts` 成功导入生产环境。
  - **Career (事业) 数据修复**：解决了 `事业正式.xlsx` 中英文文本错位的问题。
  - **后端部署流程**：确立了 "Local Build + Static Docker" 的部署策略，`deploy.sh` 可靠可用。
  - **数据库重置**：`reset_tarot_data.ts` 可用于清空表并重置 ID，`seed_tarot_direct.ts` 用于基础数据灌入。
- **当前卡点**：无 (Self/Love 数据已修复)。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **Excel 数据错位修复 (Career)**：
  - **问题**：`事业正式.xlsx` 中英文文本列整体右移，导致 "The Fool" 对应了 "The Lovers" 的文本。
  - **方案**：不依赖列索引，而是通过正则匹配英文文本内容 (如 "The Fool in the past...") 来反向识别归属卡牌。
  - **脚本**：`backend/scripts/fix_career_scramble.ts` (生成修正 JSON), `backend/scripts/fix_career_en.ts` (应用到 DB)。
- **部署与脚本执行**：
  - **策略**：本地编译 TS -> JS，通过 `scp` 上传到服务器，`docker cp` 到容器，再 `docker compose exec` 执行。
  - **命令参考**：`deploy.sh` 中的 `run_remote_scripts` 函数。
- **数据库操作**：
  - **清空**：`TRUNCATE TABLE tarot_interpretations RESTART IDENTITY CASCADE` (在 `reset_tarot_data.ts` 中)。
  - **查询验证**：使用 `check_card_mapping.ts` 检查特定卡牌 (如 `Queen of Swords`) 的数据准确性。

## 🚧 遗留难点与待办 (Pending Issues)
- **Self & Love 数据缺失 (RESOLVED)**：
  - **状态**：已修复。确认 Excel 文件中包含数据，已通过 `import_self_love_en.ts` 导入。
- **前端兜底文案 (Fallback Text)**：
  - **状态**：已解决。数据补充后，兜底文案不再触发。

## 📂 核心文件结构 (Core Directory Structure)
- `backend/scripts/`
  - `seed_tarot_direct.ts`      # 主种子脚本 (注意：需确保 Excel 源文件正确)
  - `fix_career_scramble.ts`    # [关键] 修复 Career 数据错位的逻辑脚本
  - `fix_career_en.ts`          # [关键] 将修复后的 Career JSON 更新到 DB
  - `check_card_mapping.ts`     # 生产环境数据验证脚本
  - `analyze_career_shift.ts`   # Excel 内容分析工具
- `backend/assets/excel_files/` # Excel 数据源 (目前 Self/Love 文件内容不全)
- `deploy.sh`                   # 自动化部署脚本
- `frontend/src/pages/Result.tsx` # 结果页逻辑 (含兜底文案触发条件)

## ➡️ 下一步指令 (Next Action)
1.  **解决数据源问题 (最高优先级)**：
    -   **询问用户**：是否拥有包含英文内容的 `自我正式.xlsx` 和 `感情正式.xlsx`。
    -   **替代方案**：若无文件，需编写脚本导出这两份文件的中文内容 (参考 `dump_career_zh.ts`)，调用 LLM 翻译成英文，再生成 JSON 导入。
2.  **执行导入**：
    -   一旦有了数据 (Excel 或 JSON)，编写/复用脚本 (`seed_tarot_direct.ts` 或类似 `fix_career_en.ts` 的更新脚本) 将数据写入生产数据库。
3.  **验证修复**：
    -   运行 `backend/scripts/check_card_mapping.ts`，重点检查 `Self` 和 `Love` 分类的 `Queen of Swords` (或其他任意卡牌)，确认 `interpretation_en` 不为 NULL。
4.  **前端验证**：
    -   通知用户在 H5 页面重新抽牌 (确保清除缓存或使用新卡组)，验证 `Self` / `Love` 分类不再显示 "heavy burden" 等兜底文案。
