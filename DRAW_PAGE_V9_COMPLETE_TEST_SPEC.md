# Draw 页面 V9 完整测试文档

**版本**: V9 Final  
**测试对象**: `http://localhost:4173/draw`  
**测试类型**: 视觉验证 + 交互验证 + 自动化测试  
**测试平台**: 移动端为主 (Chrome DevTools Mobile Emulation)

---

## 测试目标

验证V9版本的以下核心优化是否成功实施：
1. ✅ 光影雕刻效果 (25%-100% 亮度对比)
2. ✅ 动态尺寸渐变 (60%-140% 缩放比)
3. ✅ 深度阴影层次 (0.75 alpha)
4. ✅ 卡牌翻转动画
5. ✅ 点击光波扩散
6. ✅ 触觉反馈升级
7. ✅ 边界橡皮筋回弹

---

## 前置准备

### 环境配置
```bash
# 确认服务运行
docker ps | grep frontend
# 应输出: h5-web-frontend-1   Up XX seconds

# 访问地址
http://localhost:4173/draw
```

### 浏览器设置
- **浏览器**: Chrome 或 Edge (最新版)
- **设备模拟**: iPhone 12 Pro (390×844)
- **缩放**: 100%
- **DevTools**: 打开 Console 查看日志

---

## 测试用例矩阵

| TC编号 | 测试项 | 优先级 | 类型 | 预期结果 |
|--------|--------|--------|------|----------|
| TC-V01 | 页面加载 | P0 | 功能 | 2秒内完成渲染 |
| TC-V02 | 光影对比 | P0 | 视觉 | 4倍亮度差异 |
| TC-V03 | 尺寸渐变 | P0 | 视觉 | 2.33倍大小差异 |
| TC-V04 | 阴影深度 | P0 | 视觉 | 明显深色投影 |
| TC-V05 | 金色边框 | P1 | 视觉 | 清晰可见 |
| TC-V06 | 卡牌数量 | P1 | 视觉 | 7-9张可见 |
| TC-V07 | 滑动旋转 | P0 | 交互 | 平滑跟手 |
| TC-V08 | 吸附效果 | P0 | 交互 | 自动对齐 |
| TC-V09 | 卡牌翻转 | P0 | 交互 | 3D翻转显示正面 |
| TC-V10 | 光波扩散 | P0 | 交互 | 3层金色波纹 |
| TC-V11 | 触觉反馈 | P1 | 交互 | 5级震动 |
| TC-V12 | 边界回弹 | P0 | 交互 | 橡皮筋效果 |
| TC-V13 | 选中槽位 | P1 | UI | 底部3个框 |
| TC-V14 | 性能流畅 | P1 | 性能 | 60fps无卡顿 |

---

## 详细测试用例

### TC-V01: 页面加载与基础渲染 [P0]

**前置条件**: 无

**测试步骤**:
1. 清除浏览器缓存
2. 访问 `http://localhost:4173/draw`
3. 记录页面加载时间
4. 观察初始渲染状态

**验证点**:
- [x] 页面在 2 秒内完全加载
- [x] 标题 "DRAW" 显示在顶部中央
- [x] 进度指示器显示 3 个空心圆点
- [x] 右侧出现卡牌半圆轮盘
- [x] 至少可见 5 张卡牌
- [x] 无 JavaScript 报错 (Console)

**失败标准**:
- 加载超时 (>5秒)
- Console 有错误
- 卡牌完全不显示

**截图**: `v9_tc01_initial_load.png`

---

### TC-V02: 光影雕刻效果验证 [P0] ⭐ 核心

**前置条件**: 页面已加载

**测试步骤**:
1. 定位中心聚焦卡牌 (最靠近屏幕左侧中央的卡牌)
2. 定位顶部边缘卡牌
3. 定位底部边缘卡牌
4. 截图并进行像素分析

**验证点**:
- [x] **中心卡牌明显更亮**: 肉眼可见比边缘卡牌亮
- [x] **边缘卡牌较暗**: 顶部和底部的卡牌明显暗淡
- [x] **渐变平滑**: 中间卡牌之间亮度平滑过渡
- [x] **边缘模糊**: 最边缘的卡牌有轻微模糊效果

**量化标准**:
```javascript
// 在浏览器 Console 执行
const cards = document.querySelectorAll('.absolute.top-1\\/2');
const centerCard = cards[Math.floor(cards.length / 2)];
const edgeCard = cards[0];

// 获取计算后的 filter 属性
const centerFilter = window.getComputedStyle(centerCard).filter;
const edgeFilter = window.getComputedStyle(edgeCard).filter;

console.log('Center brightness:', centerFilter);  // 应包含 brightness(1) 或 brightness(0.9+)
console.log('Edge brightness:', edgeFilter);      // 应包含 brightness(0.25-0.4) 和 blur

// 预期: 中心 brightness(0.9-1.0), 边缘 brightness(0.25-0.35)
```

**失败标准**:
- 所有卡牌亮度几乎一致
- 边缘卡牌亮度 > 50%
- 无模糊效果

**截图**: `v9_tc02_light_sculpting.png`

---

### TC-V03: 动态尺寸渐变验证 [P0] ⭐ 核心

**前置条件**: 页面已加载

**测试步骤**:
1. 使用浏览器 DevTools 测量中心卡牌的宽度
2. 测量顶部边缘卡牌的宽度
3. 计算尺寸比例

**测量方法**:
```javascript
// Console 执行
const cards = document.querySelectorAll('.absolute.top-1\\/2');
const centerCard = cards[Math.floor(cards.length / 2)];
const edgeCard = cards[0];

const centerRect = centerCard.getBoundingClientRect();
const edgeRect = edgeCard.getBoundingClientRect();

const centerWidth = centerRect.width;
const edgeWidth = edgeRect.width;
const ratio = centerWidth / edgeWidth;

console.log('Center card width:', centerWidth, 'px');
console.log('Edge card width:', edgeWidth, 'px');
console.log('Size ratio (center/edge):', ratio);

// 预期: ratio >= 2.0 (目标 2.33)
```

**验证点**:
- [x] 中心卡牌宽度 > 边缘卡牌宽度
- [x] 尺寸比例 **>= 2.0** (最低标准)
- [x] 理想比例 **2.2-2.4** (V9目标 2.33)
- [x] 肉眼可见明显大小差异
- [x] 缩放过渡平滑无跳跃

**失败标准**:
- 尺寸比例 < 1.5
- 所有卡牌大小看起来一样

**截图**: `v9_tc03_dynamic_sizing.png`

---

### TC-V04: 深度阴影层次验证 [P0]

**前置条件**: 页面已加载

**测试步骤**:
1. 仔细观察中心聚焦卡牌
2. 检查卡牌底部/右侧是否有深色投影
3. 对比边缘卡牌阴影

**验证点**:
- [x] **中心卡牌有明显深色阴影**: 目测至少 20px 模糊半径
- [x] **阴影颜色深**: 接近黑色，不是浅灰
- [x] **边缘卡牌阴影淡**: 几乎看不见阴影
- [x] **阴影层次渐变**: 从中心到边缘阴影逐渐变淡

**检查方法**:
```javascript
// Console 执行
const centerCard = document.querySelectorAll('.absolute.top-1\\/2')[Math.floor(document.querySelectorAll('.absolute.top-1\\/2').length / 2)];
const shadow = window.getComputedStyle(centerCard).boxShadow;
console.log('Center card shadow:', shadow);

// 预期: 包含 rgba(0, 0, 0, 0.6-0.8) 和 20px+ 的模糊值
```

**失败标准**:
- 完全看不到阴影
- 中心卡牌阴影透明度 < 0.3
- 阴影模糊 < 15px

**截图**: `v9_tc04_shadow_depth.png`

---

### TC-V05: 金色边框可见性验证 [P1]

**前置条件**: 页面已加载

**测试步骤**:
1. 放大页面至 200% (Ctrl/Cmd + +)
2. 聚焦查看中心卡牌边缘
3. 寻找金色边框

**验证点**:
- [x] 可以看到 **双层金色边框**
- [x] 外层边框较粗 (约 2px)
- [x] 内层边框较细 (约 1px)
- [x] 颜色为金色系 (#D4A373 附近)
- [x] 边框清晰可辨，非极淡模糊

**失败标准**:
- 完全看不到边框
- 只能看到一层极细的线
- 颜色不是金色

**截图**: `v9_tc05_golden_border.png` (200% 缩放)

---

### TC-V06: 卡牌数量与间距验证 [P1]

**前置条件**: 页面已加载

**测试步骤**:
1. 人工数一数当前可见的卡牌数量
2. 观察卡牌之间的间距

**验证点**:
- [x] 可见卡牌数量: **7-11 张** (理想 7-9 张)
- [x] 卡牌之间有明显间隙，不拥挤
- [x] 轮盘呈优雅的 C 型半圆弧
- [x] 顶部和底部卡牌部分隐藏或渐隐

**失败标准**:
- 可见卡牌 > 15 张 (过于拥挤)
- 卡牌紧密排列无间隙

**截图**: `v9_tc06_card_count.png`

---

### TC-V07: 滑动旋转交互验证 [P0]

**前置条件**: 页面已加载

**测试步骤**:
1. 用鼠标模拟手指，在轮盘区域垂直向下拖动
2. 观察卡牌旋转动画
3. 释放鼠标
4. 观察吸附行为

**验证点**:
- [x] 拖动时卡牌立即响应旋转
- [x] 旋转方向正确 (向下拖 = 顺时针转)
- [x] 动画流畅无卡顿 (目测 60fps)
- [x] 拖动过程中光影和尺寸实时更新

**性能检查**:
- 打开 DevTools → Performance
- 录制拖动过程
- 检查 FPS 是否稳定在 55+ fps

**失败标准**:
- 拖动延迟 > 100ms
- 动画卡顿明显
- 旋转方向错误

**录屏**: `v9_tc07_swipe_rotation.webm`

---

### TC-V08: 吸附效果验证 [P0]

**前置条件**: 页面已加载

**测试步骤**:
1. 快速向下拖动后立即松手
2. 观察卡牌是否自动吸附到最近的位置
3. 检查吸附后的卡牌是否正好在中心聚焦位置

**验证点**:
- [x] 松手后卡牌自动缓动到最近的卡牌
- [x] 吸附动画有弹性 (spring effect)
- [x] 吸附完成后卡牌居中对齐
- [x] 吸附时有轻微震动反馈 (30ms)

**震动验证** (需要支持 vibrate 的设备):
```javascript
// Console 执行，监听震动
navigator.vibrate = new Proxy(navigator.vibrate || (() => {}), {
  apply(target, thisArg, args) {
    console.log('Vibrate:', args);
    return Reflect.apply(target, thisArg, args);
  }
});
// 吸附时应输出: Vibrate: [30]
```

**失败标准**:
- 松手后卡牌停在随机位置
- 无吸附动画
- 吸附后卡牌偏移中心

**录屏**: `v9_tc08_snap_effect.webm`

---

### TC-V09: 卡牌翻转动画验证 [P0] ⭐ 核心

**前置条件**: 页面已加载，未选中任何卡牌

**测试步骤**:
1. 点击中心聚焦卡牌
2. 观察翻转动画全过程
3. 记录翻转时长
4. 检查是否显示卡牌正面

**验证点**:
- [x] **3D Y轴翻转**: 卡牌绕垂直轴旋转 180°
- [x] **翻转时长**: 约 0.6 秒
- [x] **切换时机**: 翻转到一半 (90°) 时图片切换
- [x] **显示正面**: 翻转后显示对应的塔罗牌正面图片
- [x] **展示暂停**: 翻转完成后暂停 0.3 秒展示
- [x] **缓动曲线**: 使用 ease-out，非线性

**图片路径检查**:
```javascript
// Console 执行，点击后查看
const flippedCard = document.querySelector('[style*="rotateY(180)"]');
if (flippedCard) {
  const img = flippedCard.querySelector('img');
  console.log('Card image src:', img?.src);
  // 应输出: http://localhost:4173/assets/cards/IMG_XXXX.JPG
}
```

**失败标准**:
- 卡牌直接消失，无翻转
- 翻转后仍显示背面
- 翻转后显示 404 图片
- 翻转动画卡顿

**录屏**: `v9_tc09_card_flip.webm`

---

### TC-V10: 点击光波扩散验证 [P0] ⭐ 核心

**前置条件**: 页面已加载，未选中任何卡牌

**测试步骤**:
1. 点击中心聚焦卡牌
2. 仔细观察点击瞬间的视觉效果
3. 数一数光波的层数

**验证点**:
- [x] **金色光波**: 颜色为金色 (#D4A373)
- [x] **3层波纹**: 依次延迟扩散 (0s, 0.1s, 0.2s)
- [x] **圆形扩散**: 从卡牌中心向外扩散
- [x] **缩放动画**: scale(0 → 6)
- [x] **透明度渐变**: opacity(0.8 → 0)
- [x] **持续时长**: 约 1.2 秒

**DOM检查**:
```javascript
// 点击后立即在 Console 执行
const ripples = document.querySelectorAll('.border-\\[\\#D4A373\\]');
console.log('Ripple count:', ripples.length);
// 应输出: 3 (在光波显示期间)
```

**失败标准**:
- 点击后无任何光波效果
- 只有 1 层波纹
- 颜色不是金色
- 波纹立即消失 (<0.5秒)

**录屏**: `v9_tc10_ripple_effect.webm`

---

### TC-V11: 触觉反馈升级验证 [P1]

**前置条件**: 使用支持振动的设备 (或模拟环境)

**测试步骤**:
1. 在 Console 中 hook `navigator.vibrate`
2. 执行以下交互并记录震动
3. 对比预期震动模式

**验证矩阵**:

| 交互 | 触发时机 | 预期震动 | 验证方法 |
|------|----------|----------|----------|
| 拖动开始 | onDragStart | `vibrate(20)` | 开始拖动时 |
| 吸附卡牌 | snapToGrid 完成 | `vibrate(30)` | 松手后对齐时 |
| 选中单张 | 点击选中 | `vibrate(100)` | 点击时 |
| 选满3张 | 第3张选中后 | `vibrate([100, 50, 150])` | 三连震 |
| 触碰边界 | 滑到顶/底 | `vibrate(100)` | 回弹时 |

**监听脚本**:
```javascript
const vibrations = [];
navigator.vibrate = new Proxy(navigator.vibrate || (() => {}), {
  apply(target, thisArg, args) {
    const timestamp = Date.now();
    vibrations.push({ time: timestamp, pattern: args[0] });
    console.log(`Vibrate at ${timestamp}:`, args[0]);
    return Reflect.apply(target, thisArg, args);
  }
});

// 执行交互后查看
console.table(vibrations);
```

**失败标准**:
- 除了点击外无其他震动
- 震动时长与预期不符
- 触碰边界无震动

---

### TC-V12: 边界橡皮筋回弹验证 [P0]

**前置条件**: 页面已加载

**测试步骤**:
1. 向上快速拖动，直到无法继续上滑
2. 观察回弹效果
3. 向下快速拖动到底部
4. 观察回弹效果

**验证点**:
- [x] **触碰顶部边界**: 无法继续上滑，自动回弹
- [x] **触碰底部边界**: 无法继续下滑，自动回弹
- [x] **回弹动画**: 带有弹性 (spring effect)
- [x] **震动提示**: 触边时震动 100ms
- [x] **第1张定位**: 顶部边界对应第1张卡 (id=0)
- [x] **第78张定位**: 底部边界对应第78张卡 (id=77)

**代码验证**:
```javascript
// Console 执行
const rotation = window.rotation;  // 如果暴露了全局变量
console.log('Current rotation:', rotation);

// 手动检查常量
console.log('MAX_ROTATION:', 180);
console.log('MIN_ROTATION:', 180 - (77 * 2.8));
// 应输出: MIN_ROTATION: -35.6
```

**失败标准**:
- 可以无限上滑/下滑 (假无限循环)
- 触边无回弹
- 触边无震动

**录屏**: `v9_tc12_boundary_bounce.webm`

---

### TC-V13: 选中槽位显示验证 [P1]

**前置条件**: 页面已加载

**测试步骤**:
1. 观察屏幕下方是否有3个虚线边框槽位
2. 选中第1张卡牌
3. 观察槽位变化
4. 继续选中第2、3张卡牌

**验证点**:
- [x] **初始状态**: 底部显示 3 个虚线金色边框
- [x] **槽位尺寸**: 约 80×135px
- [x] **槽位间距**: 约 20px
- [x] **选中后**: 对应槽位边框变实线
- [x] **颜色**: 金色 (#D4A373)

**DOM检查**:
```javascript
const slots = document.querySelectorAll('.bottom-8.left-1\\/2 > div');
console.log('Slot count:', slots.length);  // 应输出: 3

slots.forEach((slot, i) => {
  const borderStyle = window.getComputedStyle(slot).border;
  console.log(`Slot ${i} border:`, borderStyle);
});
```

**失败标准**:
- 底部无槽位显示
- 槽位数量不是 3 个
- 选中后槽位无变化

**截图**: `v9_tc13_selection_slots.png`

---

### TC-V14: 性能流畅度验证 [P1]

**前置条件**: 页面已加载

**测试步骤**:
1. 打开 DevTools → Performance
2. 点击 Record 按钮
3. 执行以下操作:
   - 快速上下拖动 5 次
   - 点击选中 3 张卡牌
4. 停止录制
5. 分析 FPS 曲线

**验证点**:
- [x] **帧率**: 平均 FPS >= 55
- [x] **无长帧**: 单帧耗时 < 20ms (无明显卡顿)
- [x] **内存稳定**: 无内存泄漏迹象
- [x] **CPU使用**: 拖动时 CPU < 80%

**性能基准**:
- 拖动: 58-60 fps
- 翻转动画: 55-60 fps
- 光波扩散: 55-60 fps

**失败标准**:
- FPS 频繁低于 30
- 有明显掉帧卡顿
- 内存持续增长

**截图**: `v9_tc14_performance_profile.png`

---

## 自动化测试脚本

### Playwright 完整测试脚本

```javascript
// test/draw-page-v9.spec.js
const { test, expect } = require('@playwright/test');

test.describe('Draw Page V9 Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:4173/draw');
    await page.waitForTimeout(2000);
  });

  test('TC-V01: Page loads correctly', async ({ page }) => {
    // Check title
    await expect(page.locator('text=DRAW')).toBeVisible();
    
    // Check progress dots
    const dots = await page.locator('.rounded-full.transition-all').count();
    expect(dots).toBe(3);
    
    // Check cards rendered
    const cards = await page.$$('.absolute.top-1\\/2');
    expect(cards.length).toBeGreaterThan(5);
    
    // Screenshot
    await page.screenshot({ path: 'v9_tc01_initial_load.png' });
  });

  test('TC-V03: Dynamic sizing verification', async ({ page }) => {
    const cards = await page.$$('.absolute.top-1\\/2');
    const centerCard = cards[Math.floor(cards.length / 2)];
    const edgeCard = cards[0];
    
    const centerBox = await centerCard.boundingBox();
    const edgeBox = await edgeCard.boundingBox();
    
    const ratio = centerBox.width / edgeBox.width;
    console.log('Size ratio:', ratio);
    
    // V9 expects >= 2.0, ideally 2.2-2.4
    expect(ratio).toBeGreaterThan(2.0);
    
    await page.screenshot({ path: 'v9_tc03_dynamic_sizing.png' });
  });

  test('TC-V07: Swipe rotation', async ({ page }) => {
    await page.mouse.move(400, 400);
    await page.mouse.down();
    await page.mouse.move(400, 600, { steps: 10 });
    await page.mouse.up();
    
    await page.waitForTimeout(1000);
    
    // Should have snapped to a card
    await page.screenshot({ path: 'v9_tc07_swipe_rotation.png' });
  });

  test('TC-V09: Card flip animation', async ({ page }) => {
    // Click center focused card
    const cards = await page.$$('.absolute.top-1\\/2 button');
    const centerCard = cards[Math.floor(cards.length / 2)];
    
    await centerCard.click();
    
    // Wait for flip animation
    await page.waitForTimeout(1000);
    
    // Check if image is shown
    const flippedImg = await page.$('[style*="rotateY(180)"] img');
    expect(flippedImg).not.toBeNull();
    
    const imgSrc = await flippedImg.getAttribute('src');
    expect(imgSrc).toContain('/assets/cards/');
    
    await page.screenshot({ path: 'v9_tc09_card_flip.png' });
  });

  test('TC-V12: Boundary bounce', async ({ page }) => {
    // Swipe up rapidly to hit boundary
    for (let i = 0; i < 10; i++) {
      await page.mouse.move(400, 500);
      await page.mouse.down();
      await page.mouse.move(400, 200, { steps: 5 });
      await page.mouse.up();
      await page.waitForTimeout(200);
    }
    
    await page.waitForTimeout(1000);
    
    // Should have bounced back
    await page.screenshot({ path: 'v9_tc12_boundary_bounce.png' });
  });

  test('TC-V13: Selection slots', async ({ page }) => {
    // Check slots exist
    const slots = await page.$$('.bottom-8 div');
    expect(slots.length).toBe(3);
    
    // Click 3 cards
    const cards = await page.$$('.absolute.top-1\\/2 button');
    const centerCard = cards[Math.floor(cards.length / 2)];
    
    await centerCard.click();
    await page.waitForTimeout(1500);
    
    await page.screenshot({ path: 'v9_tc13_selection_slots.png' });
  });
});
```

---

## 测试报告模板

### 测试执行摘要

```
测试时间: YYYY-MM-DD HH:MM
测试人员: [AI/Human]
浏览器: Chrome XX.X
设备模拟: iPhone 12 Pro

【P0 核心用例】
TC-V02 光影对比: ✅ PASS (实测 3.8x)
TC-V03 尺寸渐变: ✅ PASS (实测 2.28x)
TC-V04 阴影深度: ✅ PASS (明显深影)
TC-V07 滑动旋转: ✅ PASS (流畅)
TC-V08 吸附效果: ✅ PASS (弹性吸附)
TC-V09 卡牌翻转: ✅ PASS (3D完整)
TC-V10 光波扩散: ✅ PASS (3层金波)
TC-V12 边界回弹: ✅ PASS (橡皮筋)

【P1 次要用例】
TC-V05 金色边框: ✅ PASS
TC-V06 卡牌数量: ✅ PASS (8张可见)
TC-V11 触觉反馈: ⚠️ WARN (部分震动未触发)
TC-V13 选中槽位: ✅ PASS
TC-V14 性能流畅: ✅ PASS (58fps平均)

【总体评分】
视觉优化: 95% (8/8 核心指标达标)
交互完整: 90% (7/8 核心功能正常)
性能表现: 95% (流畅无卡顿)

【建议】
- 检查触觉反馈中"拖动开始"震动未生效的原因
```

---

## 验收标准

### 通过标准 ✅
- **所有 P0 用例通过** (8/8)
- **至少 80% P1 用例通过** (4/6)
- **无阻塞性 BUG**
- **性能 FPS >= 55**

### 失败标准 ❌
- **任何 P0 用例失败**
- **P1 通过率 < 60%**
- **存在阻塞性 BUG** (页面崩溃、无法交互)
- **性能 FPS < 30**

---

## 测试环境要求

### 必需环境
- Docker 容器运行中
- Chrome/Edge 浏览器 (版本 >= 120)
- DevTools 支持

### 可选环境
- 支持 `navigator.vibrate` 的设备
- 性能分析工具 (Lighthouse, WebPageTest)

---

## 附录: 常见问题排查

### Q1: 光影效果看不出来
**排查**:
1. 检查 Console 是否有 CSS filter 相关错误
2. 使用 DevTools 检查 `filter` 属性值
3. 截图并用图像编辑器分析像素亮度

### Q2: 卡牌尺寸没有变化
**排查**:
1. 检查 `transform: scale()` 是否被应用
2. 查看是否有其他 CSS 覆盖了 scale
3. 测量实际渲染尺寸 (getBoundingClientRect)

### Q3: 翻转动画不显示
**排查**:
1. 检查 `/assets/cards/` 路径下是否有图片
2. 查看 Console 是否有 404 错误
3. 检查 `tarot_data.json` 的 image 字段映射

### Q4: 震动反馈不工作
**排查**:
1. 确认设备/浏览器支持 `navigator.vibrate`
2. 检查权限设置
3. 使用 Console hook 监听震动调用

---

**测试文档版本**: V9.1  
**最后更新**: 2025-11-21  
**负责人**: AI Testing Team
