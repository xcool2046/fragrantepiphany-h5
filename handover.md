# Handover Document

## 📊 当前进度快照 (Progress Snapshot)

- **当前阶段**：后端数据重构与清洗（Data Refactoring），核心处于 `perfumes` 表数据由于源文件变更导致的全面订正阶段。
- **已确认可用**：
  1. **核心导入逻辑**：`backend/scripts/refactor_perfume_data.ts` 已能正确解析 `master (3).xlsx` 的水平排布结构（Card + A/B/C/D）。
  2. **中文数据完整性**：312 条数据的中文文案、品牌、香水名、排序（Card ID 1-78 + Choice A-D）已验证无误。
  3. **环境同步**：本地数据库已重建，排序逻辑 `sort_order` 已修正。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)

- **Excel 解析策略**：
  - **问题**：`Perfume+卡 mapping` 表是水平展开结构（每行一张牌，列1-3是A，列4-6是B...），非标准数据库格式。
  - **方案**：在 `refactor_perfume_data.ts` 中实现了“一行裂变四行”的解析逻辑，并硬编码了 Column Index 以规避表头命名不规范问题。这部分逻辑稳定，**勿动**。

- **模糊匹配与清洗**：
  - **问题**：法语品牌名（如 Frédéric Malle）在不同源中拼写不一致（含/不含重音符）。
  - **方案**：使用 `s.normalize("NFD").replace(/[\u0300-\u036f]/g, "")` 去除变音符号后再进行 Key 匹配。

## 🚧 遗留难点与待办 (Pending Issues)

- **🚨 核心阻塞：中英文案逻辑彻底错位**
  - **状态**：**CRITICAL BLOCKER**（已暂停代码开发）。
  - **症状**：用户确认 `perfume` 表中恢复的英文文案（Description EN）与中文文案（Description ZH）意境完全不符。
    - *例子*：Card 78 "King of Cups" (Silver Mountain Water) 中文是“国王、成熟智慧”，英文却是“Knightly edge... fast as wind”（对应旧数据的宝剑骑士）。
  - **原因**：旧版英文数据（JSON）是基于旧的“香水-塔罗牌”对应关系编写的。新版 Excel (`master (3).xlsx`) 更改了香水与牌的映射，导致旧文案描述的是错误的牌义。
  - **结论**：**现有的所有旧 JSON 英文翻译文件（`perfume_translations_*.json`）已失效**，不可用于自动匹配。

## 📂 核心文件结构 (Core Directory Structure)

- `backend/`
  - `scripts/refactor_perfume_data.ts` # **主导入脚本**，目前除 Description EN 外逻辑均正确。
  - `scripts/check_refactor_result.ts` # **验证脚本**，用于检查覆盖率和特定 Case。
  - `master (3).xlsx`                # **单一真相来源 (Source of Truth)**，包含正确的中文文案与映射关系。
  - `*.json`                         # (deprecated) 旧翻译文件，已确认为污染源。

## ➡️ 下一步指令 (Next Action)

1. **🛑 停止代码修补**：不要再尝试修改 `refactor_perfume_data.ts` 的匹配逻辑，不管怎么匹配，旧数据源都是错的。
2. **获取新翻译**：
   - 需要基于 `master (3).xlsx` 中的 312 条**中文文案**，重新生成或翻译对应的**英文文案**。
   - 建议使用 LLM 批量处理这 312 条中文描述，生成新的 JSON 映射文件。
3. **注入新数据**：
   - 拿到新的翻译源后，修改 `refactor_perfume_data.ts`，替换掉原本读取旧 JSON 的逻辑，读取新的翻译源。
4. **重新执行导入**：
   - 运行 `npx ts-node scripts/refactor_perfume_data.ts`。
   - 运行 `npx ts-node scripts/check_refactor_result.ts` 验证文案一致性。
