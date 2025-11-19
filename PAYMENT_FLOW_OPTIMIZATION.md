# 支付流程优化方案 (Payment Flow Optimization)

**目标**: 移除中间的币种选择页面，实现点击 "Unlock" 后直接跳转至 Stripe 支付页面。

## 1. 核心逻辑 (Core Logic)

目前用户需要在 `/pay` 页面手动选择 USD/CNY。优化后，我们将根据用户的**当前语言环境 (Language/Locale)** 自动决定币种。

*   **逻辑规则**:
    *   如果当前语言是 **中文 (zh/zh-CN)** -> 自动选择 **CNY (¥15)**。
    *   其他语言 (en, etc.) -> 自动选择 **USD ($5)**。

## 2. 实施步骤 (Implementation Steps)

### 2.1 前端改造 (`src/pages/Pay.tsx` 或 `src/pages/Result.tsx`)

我们有两种实现路径，建议采用 **路径 A** 以保持路由清晰，或者 **路径 B** 追求极致速度。

#### 路径 A: 保留 `/pay` 但自动跳转 (推荐)
*   **保留 `/pay` 路由**作为中转页。
*   **移除 UI**: 删除币种选择按钮和 "Proceed to payment" 按钮。
*   **自动执行**:
    1.  页面加载 (`useEffect`) 时，读取 `i18n.language`。
    2.  根据语言确定 `currency` (CNY/USD)。
    3.  立即调用后端 `create-checkout-session` 接口。
    4.  获取 URL 后自动 `window.location.href = url`。
*   **Loading 状态**: 在跳转期间，仅显示一个全屏 Loading 动画 (如 "Preparing your checkout...")。

#### 路径 B: 直接在 Result 页跳转
*   在 `Result.tsx` 点击 "Unlock" 按钮时，直接触发上述逻辑，不跳转到 `/pay` 页面，而是直接去 Stripe。

### 2.2 代码变更示例 (伪代码)

```typescript
// src/pages/Pay.tsx

useEffect(() => {
  const initPayment = async () => {
    // 1. Auto-detect currency
    const isChinese = i18n.language.startsWith('zh');
    const currency = isChinese ? 'cny' : 'usd';
    
    try {
      // 2. Create Session
      const { url } = await createCheckoutSession({ currency });
      
      // 3. Redirect
      if (url) window.location.href = url;
    } catch (err) {
      setError('Failed to initialize payment');
    }
  };

  initPayment();
}, [i18n.language]);

// Render
return (
  <div className="loading-screen">
    <Spinner />
    <p>Redirecting to secure checkout...</p>
  </div>
);
```

## 3. 预期效果

1.  用户在 Result 页点击 "Unlock"。
2.  (可选) 短暂看到 "Redirecting..." 提示。
3.  直接进入 Stripe 收银台。
    *   中文用户看到 ￥15。
    *   英文用户看到 $5。

---
**参考截图**:
![Current Payment Page](/brain/9c57090b-1394-4d56-8ce3-04fa0be11b3f/uploaded_image_1763551607296.png)
*图示: 当前需要移除的中间选择页*
