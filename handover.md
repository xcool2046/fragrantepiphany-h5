## 📊 当前进度快照 (Progress Snapshot)
- **当前阶段**：UI 交互精细化打磨（重点优化抽卡动画体验）与 后端图片上传优化。
- **已确认可用功能**：
  - **抽卡页动画 (Draw.tsx)**：已实现“无缝、无震动、无缩放、无闪烁”的完美飞入效果（代码逻辑已修改，待浏览器最终肉眼验证）。
  - **结果页 (Result.tsx)**：已添加 API 错误处理 UI（重试按钮）。
  - **后台图片上传**：已集成 `sharp` 进行图片自动压缩与 WebP 转换（代码已合入）。

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)
### 1. 抽卡动画“绝对无缝”方案 (Draw.tsx)
- **场景**：卡牌从飞入状态切换到落位状态时，出现微小震动、尺寸收缩、阴影突变和闪烁。
- **解决方案**：
  - **消除震动 (Sub-pixel)**：`FlyingCard` 目标坐标强制使用 `Math.round()` 取整，对齐物理像素。
  - **消除缩放 (Box-sizing)**：卡槽容器尺寸设为 `w-[84px] h-[124px]`（含 2px 边框），确保内部内容区域精确为 `80x120px`，与飞行卡牌尺寸 1:1 匹配，避免 `border-box` 导致的 4px 挤压。
  - **消除突变 (Shadow)**：移除 `FlyingCard` 的 `shadow-2xl`，与落位后的扁平风格保持一致。
  - **消除闪烁 (Flash)**：**移除**落位卡牌 (`SlotCard`) 的 `AnimatePresence` 和 `motion.div` 包装，改用原生 `div`，确保状态切换时 DOM 瞬间渲染，无初始化延迟。
  - **消除消失感**：卡槽边框 (`border-[#D4A373]/40`) 设置为永久可见，不随卡牌进入而消失。

### 2. 图片上传优化 (Backend)
- **场景**：用户上传大图导致加载慢、存储浪费。
- **解决方案**：引入 `sharp` 库，在 `admin.controller.ts` 中拦截上传流，强制 Resize 到宽 800px 并转为 WebP 格式 (80% 质量) 后再保存。

## 🚧 遗留难点与待办 (Pending Issues)
- **[待验证] 抽卡动画最终效果**
  - **状态**：代码已修改，等待用户在浏览器中进行“肉眼验收”。
  - **关注点**：确认是否还有任何毫秒级的闪烁或 1px 的位移。
- **[已验证] 生产环境 Sharp 依赖**
  - **状态**：已通过本地 Docker 构建验证 (`node:20-alpine` + `npm ci`)，`sharp` 安装正常。

## 📂 核心文件结构 (Core Directory Structure)
- `frontend/src/pages/Draw.tsx` # 抽卡核心页面，包含 FlyingCard 动画与 Slot 逻辑（本次修改重点）
- `frontend/src/pages/Result.tsx` # 结果展示页，含翻牌动画与错误重试逻辑
- `frontend/src/components/CardFace.tsx` # 卡牌正反面渲染组件，控制卡牌尺寸与图片加载
- `backend/src/admin/admin.controller.ts` # 后台管理接口，包含图片上传优化逻辑
- `backend/package.json` # 后端依赖，新增了 sharp

## ➡️ 下一步指令 (Next Action)
1. **优先验证动画**：直接打开浏览器访问抽卡页，选择 3 张牌，仔细观察卡牌落入卡槽的瞬间。标准是“像物理物体一样移动过去，没有任何视觉突变”。
2. **检查构建状态**：运行后端构建或启动命令，确保 `sharp` 安装无误且能正常处理图片上传。
3. **不要回滚动画逻辑**：目前的 `Draw.tsx` 是经过多次微调（坐标取整、尺寸补偿、移除动画库包装）的最终版本，**切勿**为了“加特效”而重新引入 `layoutId` 或 `AnimatePresence`，这会带回震动和闪烁。
4. **推进部署**：确认前端无误后，执行 `deploy.sh` 进行部署。
