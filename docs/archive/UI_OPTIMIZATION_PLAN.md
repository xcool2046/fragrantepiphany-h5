# UI/UX 优化实施方案 (UI Optimization Plan)

**目标**: 提升 H5 移动端体验，优化视觉层级与交互流畅度。
**参考**: 用户反馈及自动化测试验收报告。

## 1. Quiz 页面 (问卷页)

> [!IMPORTANT]
> 针对用户提供的截图反馈进行重点调整。

*   **移除冗余元素**:
    *   删除底部的 "Language" 文本链接 (如图所示)。
*   **操作栏优化 (Sticky Footer)**:
    *   **文案修改**: 将 "Continue to explore" 简化为 **"Continue"**。
    *   **布局调整**: 按钮改为**屏幕底部悬浮居中 (Fixed/Sticky)**。
    *   **样式建议**:
        *   按钮宽度建议适配屏幕宽度 (e.g., `90%` or `calc(100% - 32px)`)。
        *   底部增加一层渐变遮罩或模糊背景，防止按钮与底部文字重叠，提升可读性。

## 2. Result 页面 (结果页)

*   **安全区适配 (Safe Area)**:
    *   给页面主容器 (`main` 或 `body`) 增加 `padding-bottom`。
    *   **数值建议**: `padding-bottom: calc(env(safe-area-inset-bottom) + 80px)` (假设支付栏高度约 60px)。
    *   **目的**: 确保页面滚动到底部时，内容（如 "Future" 卡牌、版权信息）不会被悬浮的支付栏遮挡。

## 3. Draw 页面 (抽牌页)

*   **按钮美化**:
    *   将当前的普通 "Draw Card" 按钮升级为**沉浸式设计**。
    *   **风格**: 拟物化水晶球 (Crystal Ball) 或 发光的魔法符文 (Glowing Rune)。
    *   **动效**: 增加轻微的呼吸 (Breathing) 动画，暗示其可交互性。
*   **交互引导**:
    *   保留轮盘视觉，在中心叠加按钮。

## 4. 通用视觉与交互 (General)

*   **付费墙 (Paywall)**:
    *   **视觉升级**: 采用 **磨砂玻璃 (Frosted Glass)** 效果 (`backdrop-filter: blur(10px)`) 替代单纯的模糊。
    *   **图标**: 在模糊区域中心增加精致的 **金色锁头 (Lock Icon)**，点击锁头亦可触发支付。
*   **触控反馈**:
    *   Quiz 选项点击时增加 `active` 态的轻微缩放 (Scale 0.98)，提供明确的触觉反馈。
*   **移动端适配**:
    *   确保所有可点击区域 (Touch Targets) 高度不小于 **44px**。

---
**参考截图**:
![Quiz Page Before](/brain/9c57090b-1394-4d56-8ce3-04fa0be11b3f/uploaded_image_1763550226200.png)
*图示: 待优化的 Quiz 底部布局 (移除 Language，悬浮 Continue)*
