# Perfume View UI Guide 香水推荐页面 UI 指南

## 🎨 Design Highlights

### 高级翻页体验

这是一个**全屏沉浸式的书籍翻页体验**，结合了优雅的左右分割布局和流畅的动画过渡。

### 布局结构

```
┌─────────────────────────────────────────────────────┐
│                                                       │
│  左侧面板 (绿色)  │   右侧面板 (粉色)               │
│  ─────────────    │   ────────────                   │
│  • 品牌名         │   • 产品图片                      │
│  • 产品名         │   • 香调金字塔                    │
│  • 标签           │                                  │
│  • 描述文案       │                                  │
│  • 励志语录       │                                  │
│                   │                                  │
│           [←]         [→]  (导航按钮)                │
│                                                       │
└─────────────────────────────────────────────────────┘
```

## 📱 Components

### 1. PerfumeView.tsx (Main Page)
- **Path**: `/frontend/src/pages/PerfumeView.tsx`
- **功能**:
  - 全屏翻页容器
  - 获取香水数据
  - 管理当前页面索引
  - 处理键盘导航 (← / →)
  - 显示页码进度条

**Features:**
- ✅ 响应式布局 (Mobile & Desktop)
- ✅ 键盘快捷键支持 (← / →)
- ✅ 流畅的过渡动画 (Framer Motion)
- ✅ 加载状态处理
- ✅ 错误处理和后备方案

### 2. PerfumePage.tsx (Single Page)
- **Path**: `/frontend/src/components/PerfumePage.tsx`
- **功能**:
  - 单个香水页面的内容展示
  - 左右两栏布局
  - 动画进入/退出效果

**包含的元素:**
```
左侧 (绿色背景 #E8DCC5):
├─ 品牌名 (小金色字)
├─ 产品名 (大衬线体)
├─ 标签 (3个水平排列)
├─ 分隔线
├─ 描述文案
├─ 励志语录
└─ 卡牌+场景信息 (底部)

右侧 (粉色背景 #F5D5C8):
├─ 产品图片 (高清展示)
└─ 香调金字塔 (互动组件)
```

### 3. PerfumePyramid.tsx (Scent Pyramid)
- **Path**: `/frontend/src/components/PerfumePyramid.tsx`
- **功能**:
  - SVG 绘制的香调金字塔
  - 动画进入效果
  - 前、中、后调笔记展示

**特点:**
- ✅ 三层金字塔 (Top / Heart / Base)
- ✅ 每层不同深浅颜色
- ✅ 下方显示详细笔记文本
- ✅ Staggered 动画效果

## 🎬 Animation Details

### 页面转换
- **进入**: 从右侧 (x: 100) 滑入，0.6s 缓动
- **退出**: 向左 (x: -100) 滑出，0.4s 缓动

### 元素动画
- **内容**: 0.2s 淡入
- **图片**: 0.6s 缩放进入
- **金字塔**: Staggered 子元素，各 0.2s 间隔

### 导航按钮
- **样式**: 半透明黑色背景，悬停时加深
- **禁用状态**: 第一页禁用左键，最后一页禁用右键
- **位置**: 页面两侧，垂直居中

## 🎯 Navigation

### 按钮导航
```
[←] 上一页  ......  下一页 [→]
```
- 点击按钮切换页面
- disabled 状态在边界处

### 键盘导航
- `←` (Left Arrow): 上一页
- `→` (Right Arrow): 下一页

### 底部进度条
```
Chapter 1 / 3  ████████░░  [Back]
```
- 显示当前页码
- 动画进度条
- 返回按钮

## 📊 Data Flow

```
Result Page
    ↓ (点击 "Discover Your Fragrance")
    ↓ (传递 cardIds: [0, 24, 56])
    ↓
PerfumeView
    ↓ (调用 getPerfumeChapters)
    ↓
API / Mock Data
    ↓ (返回 3 个香水章节)
    ↓
PerfumePage (显示第一个)
    ↓
用户翻页 (← / → 键或按钮)
    ↓
更新 currentIndex
    ↓
PerfumePage (显示下一个，带动画)
```

## 🎨 Color Scheme

| Element | Color | Hex |
|---------|-------|-----|
| 背景 (绿) | Light Sage | #E8DCC5 |
| 背景 (粉) | Light Coral | #F5D5C8 |
| 文字主 | Dark Brown | #2B1F16 |
| 文字次 | Tan | #A87B51 |
| 强调 | Gold | #D4A373 |

## 🚀 Getting Started

### 1. 查看 UI 效果
```bash
cd frontend
npm run dev
```

访问 `/perfume` 路由 (需要从 Result 页面导航)

### 2. 使用模拟数据
目前 UI 使用模拟数据，位置：
```
/frontend/src/data/perfumeData.ts
```

编辑此文件以改变展示内容。

### 3. 集成真实 API
当后端 API 准备好后：
1. 修改 `/frontend/src/api.ts` 中的 `getPerfumeChapters` 函数
2. 移除 mock 数据的后备逻辑
3. 确保 API 返回正确的数据格式

## 📱 Responsive Design

### 桌面端 (Desktop)
- 全屏两栏布局
- 较大的字体和间距
- 宽敞的导航按钮

### 移动端 (Mobile)
- 仍然保持左右分割
- 自动调整字号和内边距
- 导航按钮位置相同

### 断点
- `md`: 768px (Tailwind md)

## ♿ Accessibility

- ✅ 键盘导航完全支持
- ✅ 语义化 HTML
- ✅ 对比度符合 WCAG 标准
- ✅ ARIA labels for buttons

## 🐛 Troubleshooting

### 问题: 页面不显示
**解决**: 确保从 Result 页面点击"Discover Your Fragrance"按钮并传递 cardIds

### 问题: 图片不加载
**解决**: 检查 perfumeData.ts 中的 imageUrl 路径是否正确

### 问题: 动画卡顿
**解决**: 确保使用了硬件加速（transform 和 opacity）

### 问题: 响应式布局错乱
**解决**: 检查 Tailwind 配置，确保 md: breakpoint 正确

## 🎓 Code Structure

```
frontend/src/
├── pages/
│   ├── PerfumeView.tsx        # 主页面逻辑
│   └── Result.tsx             # 修改：添加导航逻辑
├── components/
│   ├── PerfumePage.tsx        # 单页内容
│   └── PerfumePyramid.tsx     # 香调金字塔
├── data/
│   └── perfumeData.ts         # 模拟数据
└── api.ts                      # API 定义 + 后备数据
```

## 📝 Notes

- 所有动画使用 Framer Motion
- 样式使用 Tailwind CSS
- 支持 i18n (后续添加中文翻译)
- 当前使用 mock 数据，后端就绪后可直接切换
