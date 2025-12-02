# Draw 页面视觉优化自动化测试规范

## 测试目标
验证 P0 卡牌轮盘优化是否成功实施，包括光影效果、动态缩放、材质提升。

---

## 测试环境
- **URL**: `http://localhost:4173/draw`
- **浏览器**: Chrome/Edge (桌面模式)
- **视口**: 1920x1080
- **设备模拟**: 无需移动端模拟

---

## 测试用例

### TC01: 页面加载与基础渲染
**优先级**: P0

**步骤**:
1. 导航至 `/draw` 页面
2. 等待页面完全加载 (等待 2 秒)
3. 截图保存为 `draw_initial_load.png`

**验证点**:
- [ ] 页面标题 "DRAW" 可见
- [ ] 右侧出现卡牌轮盘
- [ ] 至少可见 7 张卡牌
- [ ] 进度指示器显示 3 个空心圆点

---

### TC02: 光影雕刻效果验证 (核心)
**优先级**: P0 - **最重要**

**步骤**:
1. 定位中心聚焦卡牌 (最靠近屏幕左侧中央的卡牌)
2. 定位边缘卡牌 (最顶部和最底部的可见卡牌)
3. 截图保存为 `light_sculpting_test.png`

**验证点**:
- [ ] **亮度对比**: 中心卡牌明显比边缘卡牌**更亮**
  - 工具检测: 中心卡牌平均 RGB 值应比边缘高 **30% 以上**
- [ ] **边缘模糊**: 顶部/底部边缘卡牌有轻微模糊效果
- [ ] **阴影深度**: 中心卡牌下方有明显投影 (深色区域)
  - 阴影模糊半径目测至少 15-20px

**失败标准**:
- 所有卡牌亮度几乎一致 → **FAIL**
- 中心卡牌没有明显阴影 → **FAIL**

---

### TC03: 动态尺寸渐变验证
**优先级**: P0

**步骤**:
1. 测量中心聚焦卡牌的宽度 (使用浏览器开发工具)
2. 测量顶部边缘卡牌的宽度
3. 计算尺寸比例

**验证点**:
- [ ] 中心卡牌宽度 **明显大于** 边缘卡牌
  - 预期比例: 中心/边缘 ≈ 1.6x (120% / 75%)
  - 最低标准: 比例至少 > 1.3x
- [ ] 尺寸变化平滑，无跳跃感

**测试方法**:
```javascript
// 在浏览器 Console 执行
const cards = document.querySelectorAll('.absolute.top-1\\/2');
const centerCard = cards[Math.floor(cards.length / 2)];
const edgeCard = cards[0];
const centerWidth = centerCard.getBoundingClientRect().width;
const edgeWidth = edgeCard.getBoundingClientRect().width;
console.log('Size ratio:', centerWidth / edgeWidth);
// 应输出 > 1.3
```

**失败标准**:
- 所有卡牌大小一致 (比例 < 1.1) → **FAIL**

---

### TC04: 金色边框可见性
**优先级**: P1

**步骤**:
1. 放大中心卡牌查看 (浏览器缩放 200%)
2. 检查金色边框是否清晰可见
3. 截图保存为 `border_detail.png`

**验证点**:
- [ ] 可以看到 **两层金色边框** (外粗内细)
- [ ] 边框颜色为金色 (#D4A373 系)
- [ ] 边框不过于暗淡，肉眼可清晰辨认

**失败标准**:
- 完全看不到金色边框 → **FAIL**
- 只能看到一条极细的线 → **WARN**

---

### TC05: 卡牌间距与数量
**优先级**: P1

**步骤**:
1. 数一下轮盘上同时可见的卡牌数量
2. 观察卡牌之间的留白

**验证点**:
- [ ] 可见卡牌数量: **7-12 张** (不应该超过 15 张)
- [ ] 卡牌之间有明显间隙，不拥挤
- [ ] 轮盘呈优雅的 C 型弧线

**失败标准**:
- 可见卡牌 > 15 张，过于拥挤 → **FAIL**

---

### TC06: 材质感知 - 纹理与反光
**优先级**: P2

**步骤**:
1. 放大中心卡牌至 300%
2. 仔细观察卡牌表面

**验证点**:
- [ ] 可以看到微妙的噪点纹理 (不应该是纯色块)
- [ ] 顶部有轻微的白色高光 (镜面反射效果)
- [ ] 卡牌底色为深褐色 (不是纯黑)

---

### TC07: 交互测试 - 滑动响应
**优先级**: P1

**步骤**:
1. 在轮盘区域垂直向下拖动 (模拟手指滑动)
2. 观察卡牌旋转动画
3. 释放后观察吸附效果

**验证点**:
- [ ] 卡牌平滑旋转，无卡顿
- [ ] 释放后自动吸附到最近的卡牌
- [ ] 吸附时有轻微的缓动动画 (不是瞬移)
- [ ] 聚焦卡牌切换时，**亮度**和**尺寸**平滑过渡

---

### TC08: 点击选中测试
**优先级**: P1

**步骤**:
1. 点击中心聚焦卡牌
2. 观察是否添加到选中状态
3. 检查进度指示器

**验证点**:
- [ ] 选中的卡牌消失
- [ ] 进度指示器第 1 个点变为实心金色
- [ ] 页面无报错

---

## 关键视觉指标总结

| 指标 | 预期值 | 最低标准 | 检测方法 |
|------|--------|----------|----------|
| 中心卡牌亮度 | 100% | 相对边缘 +30% RGB | 截图像素分析 |
| 边缘卡牌亮度 | 40% | 相对中心 -30% RGB | 截图像素分析 |
| 尺寸比例 | 1.6x | > 1.3x | getBoundingClientRect() |
| 可见卡牌数 | 7-9张 | < 12 张 | 人工计数 |
| 阴影模糊半径 | 24px | 目测 > 15px | 视觉检查 |
| 金色边框可见性 | 清晰 | 可辨认 | 视觉检查 (200% 缩放) |

---

## 自动化测试脚本建议

### 使用 Playwright/Puppeteer 的示例:

```javascript
// test_draw_page.js
const { test, expect } = require('@playwright/test');

test('Draw page visual optimization', async ({ page }) => {
  // TC01: 加载页面
  await page.goto('http://localhost:4173/draw');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: 'draw_initial_load.png' });
  
  // TC02: 光影效果
  const cards = await page.$$('.absolute.top-1\\/2');
  expect(cards.length).toBeGreaterThan(5);
  
  // TC03: 尺寸对比
  const centerCard = cards[Math.floor(cards.length / 2)];
  const edgeCard = cards[0];
  const centerSize = await centerCard.boundingBox();
  const edgeSize = await edgeCard.boundingBox();
  const ratio = centerSize.width / edgeSize.width;
  
  console.log('Size ratio:', ratio);
  expect(ratio).toBeGreaterThan(1.3); // 最低标准
  
  // TC07: 拖动测试
  await page.mouse.move(800, 400);
  await page.mouse.down();
  await page.mouse.move(800, 600);
  await page.mouse.up();
  await page.waitForTimeout(1000);
  
  // TC08: 点击测试
  await centerCard.click();
  await page.waitForTimeout(500);
  
  // 验证进度指示器
  const dots = await page.$$('.rounded-full.transition-all');
  const firstDot = await dots[0].evaluate(el => 
    window.getComputedStyle(el).backgroundColor
  );
  expect(firstDot).toContain('212, 163, 115'); // #D4A373 RGB
});
```

---

## 失败案例参考

### 当前已知问题 (基于截图分析):
1. ❌ **光影效果不明显** - 所有卡牌亮度几乎一致
2. ❌ **尺寸无变化** - 所有卡牌大小看起来一样
3. ❌ **阴影缺失** - 看不到明显投影
4. ⚠️  **卡牌过多** - 可见 15+ 张，过于拥挤
5. ⚠️  **金色边框太细** - 几乎看不见

---

## 测试报告格式

### 通过标准:
- ✅ 所有 P0 测试用例通过
- ✅ 至少 80% 的 P1 用例通过
- ✅ 无阻塞性 BUG

### 报告模板:
```
测试时间: YYYY-MM-DD HH:MM
测试人员: [AI/人工]
浏览器版本: Chrome XXX

【P0 用例】
TC01: ✅ PASS
TC02: ❌ FAIL - 亮度对比不足 (实测仅 10% 差异)
TC03: ❌ FAIL - 尺寸比例 1.05x (低于标准 1.3x)

【P1 用例】
TC04: ⚠️ WARN - 金色边框勉强可见
TC05: ❌ FAIL - 可见 16 张卡牌 (超标)
TC07: ✅ PASS

【总体评分】
视觉优化完成度: 30% (2/6 核心指标达标)
建议: 需加大优化参数强度
```

---

## 测试完成后行动

### 如果测试失败:
1. 定位具体失败的 CSS 属性
2. 调整参数 (亮度、缩放、阴影)
3. 重新构建并部署
4. 再次运行测试

### 参数调优建议:
- 亮度范围: 从 `0.4-1.0` 调整为 `0.3-1.0`
- 尺寸范围: 从 `0.75-1.2` 调整为 `0.6-1.4`
- 阴影透明度: 从 `0.4` 提升至 `0.7`
- 可见角度: 从 `50°` 缩小至 `30°`
