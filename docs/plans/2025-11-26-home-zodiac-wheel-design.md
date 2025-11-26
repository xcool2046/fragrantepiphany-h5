# 首页占星轮盘设计方案

## 概述

在首页底部添加一个旋转的占星轮盘装饰元素，增强神秘学主题氛围。轮盘只露出上半部分，持续缓慢旋转。

## 设计决策

### 1. 轮盘旋转方式
- **选择**：慢速持续旋转（顺时针）
- **速度**：45秒完成一圈
- **理由**：与占星、神秘学主题契合，不分散用户注意力，视觉优雅

### 2. 露出比例
- **选择**：固定露出50%
- **实现**：轮盘中心线对齐屏幕底边，上半圆完整可见
- **效果**：营造"从地平线升起"的视觉意象

### 3. 轮盘尺寸
- **移动端**：85vw（保持正方形）
- **桌面端**：700px × 700px
- **理由**：两侧留白，避免拥挤，细节清晰可见

### 4. 内容上移幅度
- **移动端**：向上移动约20vh
- **桌面端**：向上移动约25vh
- **调整**：`pt-24` → `pt-16`（移动端），`pt-32` → `pt-20`（桌面端）

## 技术实现

### 组件结构

创建独立组件 `ZodiacWheel.tsx`：

```tsx
- 图片资源：/assets/image/未命名設計(2).png
- 定位：fixed/absolute bottom-0
- 变换：translateY(50%) translateX(-50%)
- 动画：framer-motion rotate 360deg
```

### 定位方案

```css
position: fixed;
bottom: 0;
left: 50%;
transform: translateX(-50%) translateY(50%);
```

### 旋转动画

使用 framer-motion：

```tsx
<motion.div
  animate={{ rotate: 360 }}
  transition={{
    duration: 45,
    repeat: Infinity,
    ease: "linear"
  }}
/>
```

### 尺寸响应式

- 移动端：`w-[85vw] h-[85vw]`
- 桌面端：`md:w-[700px] md:h-[700px]`

## 层级关系

Z-index 从底到顶：

1. **z-0**：背景层（女神像、星空）
2. **z-10**：轮盘层（新增）
3. **z-20**：内容层（标题、按钮）
4. **z-50**：顶层控件（语言切换）

## 视觉效果

### 透明度与混合
- `opacity: 0.85`
- `mix-blend-multiply`
- 与品牌色 #D4A373 保持一致

### 入场动画
- `initial`: opacity 0, scale 0.8
- `animate`: opacity 0.85, scale 1
- `delay`: 2.5秒（在按钮动画后）
- `duration`: 2秒

### 渐变遮罩
- 底部使用 mask-image 实现自然消失效果
- `linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%)`

## 交互设计

- 轮盘：`pointer-events: none`（纯装饰，不可交互）
- 按钮：保持原有悬停效果
- 滚动：不受轮盘影响

## 性能优化

1. 使用 `will-change: transform` 优化动画
2. 图片 `loading="eager"` 确保首屏加载
3. 考虑 WebP 格式（带降级方案）
4. 父容器 `overflow-hidden` 裁切底部

## 响应式适配

### 断点策略

- **< 375px**：轮盘 80vw，内容上移 15vh
- **375-768px**：轮盘 85vw，内容上移 20vh
- **> 768px**：轮盘 700px，内容上移 25vh

### 小屏优化

避免顶部拥挤，确保标题与语言切换按钮保持安全距离。

## 实施步骤

1. 创建 `ZodiacWheel.tsx` 组件
2. 调整 `Home.tsx` 布局（内容上移）
3. 集成轮盘组件到首页
4. 测试响应式效果
5. 性能优化验证

## 预期效果

- 增强首页神秘学氛围
- 视觉层次更丰富
- 动态元素提升页面活力
- 不干扰主要内容的可读性
