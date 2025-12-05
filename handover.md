# Handover Document

## 📊 当前进度快照 (Progress Snapshot)
- **阶段**: 生产环境调试与修复 (Production Debugging & Fixes)。
- **状态**: 代码修复已完成，但部署到生产环境失败 (Rsync Error)，导致无法验证修复效果。
- **已完成代码 (待验证)**:
    1. **香水数据导入**: `backend/import_perfume_data.ts` 增加了完整的繁简中文映射（权杖/圣杯/宝剑/星币及大阿卡纳），旨在解决 40 条数据导入失败的问题。
    2. **后台搜索**: `backend/src/admin/admin.controller.ts` 实现了双向模糊搜索（同时匹配简体和繁体输入），解决用户搜不到卡牌的问题。
    3. **UI 优化**: `frontend/src/pages/admin/Interpretations.tsx` 列表页增加了 ZH/EN 语言切换开关。
    4. **上传日志**: `backend/src/main.ts` 增加了大文件上传的日志记录，用于排查上传失败原因。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
- **双向模糊搜索 (Robust Search)**:
    - **问题**: 数据库中卡牌名称可能混杂繁体/简体，用户输入简体时搜不到繁体记录。
    - **方案**: 在 `AdminController.listCards` 中，将用户输入的关键词同时转换为简体 (`kwSimp`) 和繁体 (`kwTrad`)，并使用 `OR` 条件查询 `name_zh`。
    - **代码**: 见 `backend/src/admin/admin.controller.ts` 中的 `toSimp` / `toTrad` 映射函数。
- **数据标准化 (Data Normalization)**:
    - **问题**: Excel 源数据使用繁体中文（如“權杖”），数据库需匹配简体（如“权杖”）。
    - **方案**: 在 `import_perfume_data.ts` 中使用 `normalizeCardName` 函数进行正则替换和映射表匹配。
- **部署脚本 (Deployment)**:
    - **方案**: 使用 `./deploy.sh` 自动化构建前端、后端，编译脚本，并通过 `rsync` 上传到服务器，最后通过 SSH 执行 Docker 重启和数据脚本。
    - **注意**: 脚本中包含了编译 TS 脚本到 JS 的步骤 (`npx tsc ...`)，以便在生产环境的精简 Node 容器中运行。

## 🚧 遗留难点与待办 (Pending Issues)
- **部署失败 (Deployment Failure)**:
    - **症状**: 运行 `./deploy.sh` 时，`rsync` 报错 `connection unexpectedly closed (code 255)`。
    - **原因**: 可能是服务器网络波动、SSH 连接限制或密钥问题。
    - **待办**: 需要重试部署，或联系用户检查服务器状态。
- **远程路径确认 (Remote Path)**:
    - **症状**: 尝试手动 SSH 执行脚本时报错 `cd: /www/wwwroot/h5/backend: No such file or directory`。
    - **原因**: `deploy.sh` 中定义的远程目录是 `REMOTE_DIR=${REMOTE_DIR:-/root/fragrantepiphany-h5}`，而手动命令用了错误的路径。
    - **待办**: 后续操作请使用 `/root/fragrantepiphany-h5` 作为基准目录。
- **生产环境验证 (Verification)**:
    - **状态**: 未开始（因部署阻塞）。
    - **待办**: 部署成功后，需运行 `inspect_cards.js` 确认 DB 中卡牌名称的实际存储格式，并验证香水总数是否达到 312。

## 📂 核心文件结构 (Core Directory Structure)
- `backend/`
    - `src/admin/admin.controller.ts` # 后台管理接口，含卡牌搜索逻辑 (已修改)
    - `src/main.ts` # 应用入口，含 Body Parser 配置和上传日志 (已修改)
    - `import_perfume_data.ts` # 香水数据导入脚本，含繁简映射逻辑 (已修改)
    - `inspect_cards.ts` # [新增] 用于列出生产库所有卡牌名称的诊断脚本
    - `check_magician_prod.ts` # [新增] 用于检查特定卡牌数据的诊断脚本
- `frontend/`
    - `src/pages/admin/Interpretations.tsx` # 解读管理页，含新增的语言切换逻辑 (已修改)
- `deploy.sh` # 自动化部署脚本，负责构建、上传和远程命令执行

## ➡️ 下一步指令 (Next Action)
1. **解决部署问题**: 优先尝试重新运行 `./deploy.sh`。如果 `rsync` 持续失败，建议让用户检查服务器 SSH 连接或手动上传 `dist` 目录。
2. **验证远程路径**: 登录服务器确认部署目录是 `/root/fragrantepiphany-h5` 还是其他位置，确保后续 SSH 命令路径正确。
3. **执行验证脚本**: 部署成功后，通过 SSH 运行：
   ```bash
   ssh -p 22 root@47.243.157.75 "cd /root/fragrantepiphany-h5/backend && node dist/scripts/inspect_cards.js"
   ```
   检查输出的卡牌名称是否为简体中文。
4. **验证业务修复**:
   - 检查香水数量是否恢复为 312 条。
   - 在后台搜索“魔术师”（简体），确认能否搜到结果。
   - 检查 Interpretations 列表页是否有 ZH/EN 切换按钮。
