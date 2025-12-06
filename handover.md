# 项目交接文档 (Handover Document)

## 📊 当前进度快照 (Progress Snapshot)

**阶段**：前端 UI/UX 桌面端优化，主要针对首页的响应式设计改进。

**已完成并验证（本地开发环境 localhost:5173）**：
- ✅ 首页桌面端布局改为垂直居中（`md:justify-center`），移动端保持底部对齐
- ✅ 黄道轮盘桌面端尺寸优化：从 60vw/1000px 减小到 55vw/800px，缩放从 1.2 降到 1.1
- ✅ 内容区域响应式最大宽度：`max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl`
- ✅ 标题、副标题、按钮间距的桌面端优化（`md:mb-6 lg:mb-8`, `md:mt-4`, `md:gap-4`）
- ✅ Onboarding 和 Result 页面桌面端宽度增加到 `md:max-w-2xl`

**当前卡点**：桌面端女神背景图几乎不可见，用户要求上移至顶部（保留少量空白）并放大，但多次尝试均失败或被要求回退。

---

## 💡 关键技术方案与技巧 (Key Solutions & Techniques)

### 问题 1：响应式布局垂直对齐差异
**症状**：移动端需要底部对齐，桌面端需要垂直居中。

**解决方案**：
- 文件：`/home/projects/h5/frontend/src/pages/Home.tsx:57`
- 使用 Tailwind 响应式类：`justify-end md:justify-center`
- 配合 `pb-[25vh] md:pb-0` 确保移动端底部留白

### 问题 2：女神背景图桌面端不可见 ⚠️ **未解决**
**症状**：桌面端女神像几乎看不见，移动端可见。

**根本原因（已确认）**：
1. **径向渐变遮罩限制**（`Home.tsx:42`）：
   ```tsx
   <div className="absolute inset-0 bg-[radial-gradient(circle_closest-side,transparent_25%,#F7F2ED_85%)] z-10" />
   ```
   - 只有中心 25% 半径透明，85% 以外被背景色覆盖
   - 遮罩在图片上层（z-10），严重限制可见范围

2. **桌面端宽度过窄**（`Home.tsx:40`）：
   - 移动端：`w-[150vw]`（超宽，效果明显）
   - 桌面端：`md:w-auto`（根据高度自适应，导致图片很窄）

3. **低透明度 + 混合模式**：
   - `opacity: 0.2` + `mix-blend-multiply` + `grayscale` + `contrast-110`
   - 四重弱化效果叠加

**已尝试但失败/回退的方案**：
- ❌ 修改宽度为 `md:w-[120vw]`：用户反馈"完全看不到女神像"，要求改回
- ❌ 双遮罩方案（移动端 25%，桌面端 60%）：用户要求"不要改不透明度，影响移动端"，回退
- ❌ 放大方案（`md:w-[140vw] md:h-[90vh]`）：用户直接要求"改回去"

**当前状态**（`Home.tsx:40`）：
```tsx
className="absolute top-[-15%] left-1/2 -translate-x-1/2 w-[150vw] h-[65vh] md:w-auto md:h-[82vh] xl:h-[80vh] md:top-[2vh] mix-blend-multiply pointer-events-none"
```

**用户明确需求**：
- "女神像应该上移，到顶部，保留一些空白，然后放大"
- "禁止猜测，根据客观事实"（强调先分析代码再行动）

---

## 🚧 遗留难点与待办 (Pending Issues)

### 1. 桌面端女神背景图显示问题 🔴 **高优先级**
**状态**：多次尝试失败，用户反复要求回退

**已尝试的思路**：
- 单独修改宽度 → 无效
- 调整遮罩参数 → 被拒绝（担心影响移动端）
- 同时修改宽度、高度、位置 → 被要求回退

**问题分析**：
- 径向渐变遮罩 (`transparent_25%`) 是核心限制因素
- `md:w-auto` 导致桌面端图片过窄
- 单独修改任一参数无法解决，需要**整体方案**

**下一步可查**：
- 文件：`/home/projects/h5/frontend/src/pages/Home.tsx:36-53`（女神像容器及遮罩）
- 关键类：`md:w-auto`, `md:h-[82vh]`, `md:top-[2vh]`, 径向渐变遮罩（Line 42）
- 建议：先用开发者工具检查实际渲染的宽度/遮罩效果，**向用户展示分析结果并确认方案**再修改

### 2. 其他页面桌面端优化（次要）
**状态**：基础优化已完成，后续可根据需要微调

**待优化项**：
- Onboarding 页面列表样式（已改为左对齐 + 居中容器）
- Result 页面文案间距（已添加 `md:px-8 md:max-w-xl md:mx-auto`）

---

## 📂 核心文件结构 (Core Directory Structure)

```
/home/projects/h5/
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Home.tsx              # ⚠️ 主页，女神像问题在此（Line 36-53）
│   │   │   ├── Onboarding.tsx        # 引导页，已优化桌面端宽度和列表样式
│   │   │   └── Result.tsx            # 结果页，已优化桌面端文案间距
│   │   ├── components/
│   │   │   ├── ZodiacWheel.tsx       # 黄道轮盘，已优化桌面端尺寸
│   │   │   ├── LanguageToggle.tsx    # 语言切换
│   │   │   └── StarryBackground.tsx  # 星空背景效果
│   │   └── assets/
│   │       ├── home-bg-decoration.webp/jpg  # 女神像图片
│   │       └── zodiac-wheel.png             # 黄道轮盘图
│   ├── tailwind.config.cjs           # Tailwind 配置，字体顺序已调整
│   └── package.json
├── backend/                           # 后端相关（本次未涉及）
├── docs/03-bugs/                      # Bug 文档目录
└── handover.md                        # 本文档
```

**特殊约定**：
- 响应式断点：`md:` = 768px, `lg:` = 1024px, `xl:` = 1280px, `2xl:` = 1536px
- 移动优先设计：基础样式为移动端，桌面端用 `md:` 等前缀覆盖
- **不要修改移动端样式**：所有优化仅针对桌面端（`md:` 及以上）

---

## ➡️ 下一步指令 (Next Action)

### 启动与验证
1. **启动开发服务器**（若未启动）：
   ```bash
   cd /home/projects/h5/frontend && npm run dev
   ```
   访问 `localhost:5173` 查看效果

2. **必读文件**（按优先级）：
   - `/home/projects/h5/frontend/src/pages/Home.tsx`（重点：Line 36-53）
   - 本文档 `handover.md`

### 核心任务
3. **解决女神像桌面端不可见问题**：
   - **先分析，后行动**：使用浏览器开发者工具检查桌面端（>768px）实际渲染的：
     - 女神像容器的实际宽度（`md:w-auto` 导致的真实 px 值）
     - 径向渐变遮罩的可见范围（25% 半径对应的实际尺寸）
     - 图片是否被 `object-cover` + `object-top` 裁切
   - **向用户汇报分析结果**，提供**完整方案**（可能需要同时调整：宽度、遮罩、位置），**等待用户确认**后再修改
   - **禁止**：直接修改代码后让用户刷新查看（已失败多次）

4. **方案参考方向**（需验证后与用户确认）：
   - 方向 A：保持遮罩不变，只调整 `md:w-[Nvw]`（N 需计算）+ `md:top-[1vh]`
   - 方向 B：桌面端使用更大的遮罩透明区域（如 `md:` 单独遮罩，60% 透明）
   - 方向 C：调整 `object-fit` 从 `cover` 改为 `contain` 或去掉遮罩

### 禁止操作
5. **不要**：
   - 修改移动端样式（无 `md:` 前缀的基础类）
   - 修改女神像的不透明度（`opacity: 0.2`）
   - 删除或禁用 `mix-blend-multiply`（设计要求）
   - 在未与用户确认方案前直接修改代码

6. **工作方式要求**：
   - 用户强调"禁止猜测，根据客观事实"
   - 遇到问题先**检查代码和实际渲染效果**，向用户**展示客观数据**（如：实际宽度 XXpx，遮罩覆盖 YY%），**提出方案并确认**再执行

7. **优先级**：
   - 🔴 **P0**：解决女神像桌面端显示问题
   - 🟡 **P1**：其他页面细节调整（如需要）
   - 🟢 **P2**：移动端验证（确保优化未影响移动端）

---

**最后提醒**：用户已多次要求回退，说明当前方案思路可能不对。下一步务必先**深入分析根本原因**，向用户展示**数据和完整方案**，**确认后再动手**。
