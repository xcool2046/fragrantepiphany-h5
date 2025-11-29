# 📋 Project Handover: Tarot H5 Web App

## 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**: 数据治理与项目清理 (Data Preparation & Cleanup)。
- **已完成功能**:
  1. **全量塔罗牌翻译**: 完成 "Self" (自我), "Love" (感情), "Career" (事业) 三大类别的塔罗牌解释翻译 (CN -> EN)。
  2. **Excel 数据更新**: 所有翻译已写入 `assets/excel_files/` 下的三个核心 Excel 文件，新增 `*_en_new` 列。
  3. **根目录清理**: 将根目录下散落的临时脚本、中间数据、旧配置全部归档至 `legacy/` 目录，根目录现仅保留核心工程文件。
- **验证方式**:
  - 翻译内容已通过 `legacy/scripts/verify_*.js` 脚本验证，确认 Excel 文件中包含完整的英文列。
  - 目录结构已通过 `ls -la` 确认整洁。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **Excel 处理**: 使用 `xlsx` (SheetJS) 库进行读写。
  - *策略*: 读取原文件 -> 内存中追加新列数据 -> 覆盖写入原文件。
  - *注意*: 保持原文件格式（`.xlsx`），避免破坏原有中文数据结构。
- **批量翻译工作流**:
  - 采用 "提取 -> 翻译 (LLM) -> 生成更新脚本 -> 执行更新" 的分步流程。
  - 所有一次性更新脚本已归档至 `legacy/scripts/`，以备查阅逻辑但不再直接运行。
- **目录规范 (Cleanup)**:
  - **核心数据**: 只有 `assets/excel_files/` 下的 `.xlsx` 是最新真理来源。
  - **历史归档**: 任何非核心、一次性的脚本/数据均移入 `legacy/`，并在 `.gitignore` 中忽略 `legacy/`。

## 🚧 遗留难点与待办 (Pending Issues)
- **数据库同步 (Critical)**
  - *状态*: 未开始。
  - *说明*: Excel 文件已更新，但数据库 (`tarot_interpretations` 表) 可能尚未同步最新的英文翻译数据。
  - *线索*: 检查 `backend/scripts/read_excel.ts` (或类似 import 脚本)，确保其读取路径已更新为 `assets/excel_files/`，并执行导入逻辑。
- **前端多语言适配**
  - *状态*: 待验证。
  - *说明*: 需确认前端在切换语言时，是否能正确读取并显示数据库中的新英文字段。
- **遗留代码清理**
  - *状态*: 进行中。
  - *说明*: `backend` 和 `frontend` 目录内可能仍有部分硬编码路径指向原根目录下的 Excel 文件，需全局搜索并修正。

## 📂 核心文件结构 (Core Directory Structure)
```text
/home/code/h5-web/
├── assets/
│   └── excel_files/       # [核心数据] 包含翻译后的 自我/感情/事业正式.xlsx
├── backend/               # NestJS 后端项目
│   ├── src/               # 源码
│   └── scripts/           # [待检查] 数据导入脚本 (如 read_excel.ts)
├── frontend/              # React 前端项目
│   └── src/               # 源码
├── legacy/                # [归档] 历史脚本、旧数据、旧 locales (已在 .gitignore 中)
│   ├── scripts/           # 之前的 update_*.js, verify_*.js 等
│   └── data/              # 中间 JSON 数据
├── docs/                  # 项目文档
├── docker-compose.yml     # 容器编排
└── README.md              # 项目说明
```

## ➡️ 下一步指令 (Next Action)
1. **数据导入**: 优先检查并运行后端数据导入脚本。
   - 目标: 将 `assets/excel_files/*.xlsx` 中的新翻译同步到数据库。
   - 动作: 查看 `backend/scripts/read_excel.ts`，修正文件路径指向 `../../assets/excel_files/`，然后运行导入。
2. **路径修正**: 全局搜索代码中的 `自我正式.xlsx` / `感情正式.xlsx` / `事业正式.xlsx` 引用。
   - 目标: 确保所有读取逻辑都指向 `assets/excel_files/` 新位置，而不是根目录。
3. **前端验证**: 启动项目，进入塔罗牌抽牌流程。
   - 目标: 切换到英文环境，验证解牌结果页是否正确显示英文翻译。
4. **清理检查**: 确认 `backend` 和 `frontend` 内部没有对 `legacy/` 目录的隐式依赖。
