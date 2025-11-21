# V10 实施要点 - 非循环从中间开始

## 核心技术要点

### 1. 初始位置设置

**目标**: 页面加载时，第 39 张卡牌居中显示

**代码要点**:
```javascript
// 初始rotation值计算
const INITIAL_CARD_INDEX = 39  // 第40张卡（0-indexed）
const INITIAL_ROTATION = 180 - (INITIAL_CARD_INDEX * ANGLE_PER_CARD)

// 在 useEffect 中设置初始位置
useEffect(() => {
  rotation.set(INITIAL_ROTATION)
  snapToGrid()  // 确保对齐
}, [])
```

**注意**: 
- 不要使用 `rotation.set(180)`（那是第0张）
- 要使用 `rotation.set(180 - 39 * 2.8)` ≈ `70.8`

---

### 2. 边界限制（非循环）

**目标**: 
- 最多滑到第 0 张（最前）
- 最多滑到第 77 张（最后）
- 不能继续滑动

**代码要点**:
```javascript
const MAX_ROTATION = 180  // 第0张在中心
const MIN_ROTATION = 180 - (77 * ANGLE_PER_CARD)  // 第77张在中心

// 在拖动时应用边界
onDrag: ({ delta: [, dy] }) => {
  const newRotation = rotation.get() + (dy * -0.25)
  
  // 硬边界限制
  const constrained = Math.max(MIN_ROTATION, Math.min(MAX_ROTATION, newRotation))
  rotation.set(constrained)
}
```

**关键**: 删除之前的模运算 `% 78`，改用 `Math.max/min` 限制

---

### 3. 渐进式阻尼（柔和边界）

**目标**: 接近边界时，滑动变"重"

**代码要点**:
```javascript
// 计算距离边界的张数
const currentIndex = Math.round((180 - rotation.get()) / ANGLE_PER_CARD)
const distToStart = currentIndex  // 距离第0张
const distToEnd = 77 - currentIndex  // 距离第77张
const distToBoundary = Math.min(distToStart, distToEnd)

// 动态阻尼系数
let dampingFactor = 1.0
if (distToBoundary <= 10) dampingFactor = 1.2
if (distToBoundary <= 5) dampingFactor = 1.5
if (distToBoundary <= 1) dampingFactor = 2.0

// 应用到拖动
const effectiveDelta = dy * -0.25 / dampingFactor
rotation.set(rotation.get() + effectiveDelta)
```

**效果**: 越接近边界，拖动"阻力"越大

---

### 4. 边界震动提示（克制）

**目标**: 触碰边界时轻震，而非强弹回

**代码要点**:
```javascript
onDragEnd: () => {
  const currentRot = rotation.get()
  
  // 检测是否触边
  const hitBoundary = (currentRot >= MAX_ROTATION - 5) || 
                      (currentRot <= MIN_ROTATION + 5)
  
  if (hitBoundary && navigator.vibrate) {
    navigator.vibrate(50)  // 轻震50ms，而非100ms
  }
  
  snapToGrid()
}
```

**对比 V9**: 
- V9: 弹回 + 100ms 强震
- V10: 停住 + 50ms 轻震

---

### 5. 吸附逻辑调整

**目标**: 吸附时尊重边界

**代码要点**:
```javascript
const snapToGrid = (velocity = 0) => {
  const currentRotation = rotation.get()
  const rawIndex = (180 - currentRotation) / ANGLE_PER_CARD
  let targetIndex = Math.round(rawIndex)
  
  // 限制在 0-77 范围内
  targetIndex = Math.max(0, Math.min(77, targetIndex))
  
  const targetRotation = 180 - (targetIndex * ANGLE_PER_CARD)
  
  animate(rotation, targetRotation, {
    type: "spring",
    stiffness: 40,
    damping: 20,
    velocity
  })
}
```

**注意**: 删除了 `((targetIndex % 78) + 78) % 78` 的循环逻辑

---

### 6. 首尾卡牌视觉标记

**目标**: 第0张和第77张，边框颜色更深

**代码要点**:
```javascript
// 在 CardItem 组件中
const isFirst = card.id === 0
const isLast = card.id === 77

const borderColor = (isFirst || isLast) 
  ? 'border-[#B8936C]'  // 更深的金铜色
  : 'border-[#D4A373]'  // 正常金色
```

**效果**: 用户滑到头或尾时，潜意识感知"这是终点"

---

## 初始化流程

1. **页面加载**:
   - `rotation.set(70.8)`  // 第39张
   - `snapToGrid()`
   
2. **用户看到**: 第39张卡牌居中显示

3. **用户向上滑**: 
   - 可查看第38, 37, 36... 直到第0张
   - 到达第0张时，阻尼×2，轻震50ms
   
4. **用户向下滑**:
   - 可查看第40, 41, 42... 直到第77张
   - 到达第77张时，阻尼×2，轻震50ms

---

## 关键数值

| 参数 | 值 | 说明 |
|------|-----|------|
| 卡牌总数 | 78 | 0-77 |
| 初始卡牌 | 39 | 中间位置 |
| 初始rotation | ~70.8° | 180 - 39×2.8 |
| 最大rotation | 180° | 第0张 |
| 最小rotation | -35.6° | 第77张 |
| 边界震动 | 50ms | 轻震 |
| 渐进阻尼 | 1.0-2.0 | 距边界越近越重 |

---

## 与V9的关键区别

| 项目 | V9 | V10 |
|------|-----|-----|
| 初始位置 | 第0张 | **第39张** |
| 边界行为 | 橡皮筋回弹 | **渐进式阻尼** |
| 循环逻辑 | 取消（有边界） | **继续取消** |
| 边界震动 | 100ms | **50ms** |
| 模运算 | 已删除 | **继续删除** |

---

## 测试检查点

- [ ] 页面加载后，第39张卡牌居中
- [ ] 可以向上滑动到第0张
- [ ] 可以向下滑动到第77张
- [ ] 到达边界时无法继续滑动
- [ ] 接近边界时，滑动明显变"重"
- [ ] 触边时轻震50ms
- [ ] 第0张和第77张边框颜色更深
- [ ] 无橡皮筋回弹动画

---

**版本**: V10 (非循环从中间开始)  
**更新时间**: 2025-11-21
