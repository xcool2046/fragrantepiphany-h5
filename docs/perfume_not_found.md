# 香水页 “未找到香氛旅程” 问题总结

## 现象
- `/perfume` 页面出现 `perfume.notFound`，背景和香水内容未加载。

## 关键链路
- 前端 `frontend/src/pages/PerfumeView.tsx`：用 `card_indices` 调 `/api/perfume/chapters`。
- 后端控制器 `backend/src/perfume/perfume.controller.ts`：`card_indices -> cards.code (01..78) -> card_id`；**注意：若解析不到 ID，控制器直接返回 `{ chapters: [] }`，根本不会进入 Service 层触发兜底。**
- 后端服务 `backend/src/perfume/perfume.service.ts`：按 `card_id IN (ids) AND status='active'` 查香水；若无结果，尝试兜底逻辑。

## 2025-12-04 排查与尝试 (最新状态)

### 1. 诊断事实 (Diagnose Results)
- **Cards 表**：正常。78 条记录，Code 格式为 `01`..`78`，完全符合预期。
- **Perfumes 表**：正常。312 条记录，全部为 `active` 状态。
- **兜底 ID**：`.env` 配置了 `PERFUME_FALLBACK_ID=22`，但数据库中**不存在 ID=22** 的香水。

### 2. 已实施的代码修改
已修改 `backend/src/perfume/perfume.service.ts`，增强了兜底逻辑：
- **原逻辑**：硬编码 ID 22，找不到则空。
- **新逻辑**：
    1. 优先尝试 `ENV.PERFUME_FALLBACK_ID` (22)。
    2. 若失败（如 ID 不存在），**自动降级**查找数据库中**第一条** `status='active'` 的香水 (Order by ID ASC)。
    3. 只有当数据库全空时才返回空。

### 3. 依然存在的问题
- 尽管代码已加了“自动取第一条”的强力兜底，页面依然报错。
- **推测原因**：问题很可能出在 **Controller 层 (`perfume.controller.ts`)**。
    - 如果前端传递的参数导致 `ids` 数组为空，Controller 会直接返回 `{ chapters: [] }`。
    - **Service 层的 `getChapters` 方法根本没有被调用**，所以里面的兜底逻辑（无论写得多完美）都无法生效。

## 后续排查建议 (Handover)

1.  **检查 Controller 提前返回**：
    - 在 `backend/src/perfume/perfume.controller.ts` 中打日志，看 `card_indices` 解析出的 `ids` 是否为空。
    - 如果 `ids` 为空，检查前端传参格式，或数据库 `cards` 表查询是否因连接/权限问题失败（虽然诊断脚本能连，但 App 运行环境可能不同）。

2.  **检查部署状态**：
    - 确认 Docker 容器是否已重启并加载了最新的 `perfume.service.ts` 代码。如果运行的是旧镜像，修改自然无效。

3.  **临时规避**：
    - 如果确认是 Controller 问题，可以修改 Controller 逻辑：即使 `ids` 为空，也强制调用一次 Service（传空数组），让 Service 去处理纯兜底情况（Service 需要适配接收空数组的情况）。