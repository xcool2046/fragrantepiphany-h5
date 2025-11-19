# Stripe 支付方式配置说明 (Payment Methods Configuration)

## 📋 支持的支付方式

根据用户选择的货币，系统自动启用以下支付方式：

### CNY (¥15) - 中国用户
- ✅ **Card** (信用卡/借记卡) - 全球通用
- ✅ **Alipay** (支付宝) - 中国本地支付

### USD ($5) - 国际用户
- ✅ **Card** (信用卡/借记卡) - 全球通用
- ✅ **Apple Pay** - iOS 设备
- ✅ **Google Pay** - Android 设备

## 🔧 技术实现

### 代码位置
- **文件**: `backend/src/pay/pay.service.ts`
- **改动**: 在 `createSession()` 方法中添加了 `payment_method_types` 配置

### 逻辑
```typescript
const paymentMethodTypes = isCny
  ? ['card', 'alipay']
  : ['card', 'apple_pay', 'google_pay'];
```

## ⚠️ 注意事项

### 1. Apple Pay / Google Pay 要求
这两种支付方式需要满足以下条件才能正常工作：

- ✅ **HTTPS 域名**: 必须使用 HTTPS 协议（本地开发 `localhost` 可用）
- ✅ **域名验证**: 需要在 Stripe Dashboard 中验证域名
- ✅ **浏览器支持**: 
  - Apple Pay: Safari (iOS/macOS)
  - Google Pay: Chrome (Android/Desktop)

### 2. Alipay 要求
- ✅ **货币限制**: 仅支持 CNY 货币
- ✅ **账户开通**: Stripe 账户需要启用 Alipay 功能

### 3. Stripe Dashboard 配置

#### 步骤 1: 启用支付方式
1. 登录 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 前往 **Settings** → **Payment Methods**
3. 启用以下方式：
   - Card payments (默认已启用)
   - Alipay
   - Apple Pay
   - Google Pay

#### 步骤 2: 域名验证 (Apple Pay / Google Pay)
1. 前往 **Settings** → **Payment method domains**
2. 添加您的生产域名（例如 `fragrantepiphany.com`）
3. 按照指引完成验证

## 🧪 测试指南

### 本地测试 (localhost)

#### CNY 支付宝测试
1. 切换到中文界面
2. 点击 "解锁完整解读"
3. 在 Stripe Checkout 页面应该看到：
   - 💳 Card
   - 🟦 Alipay

#### USD 国际支付测试
1. 切换到英文界面
2. 点击 "Unlock"
3. 在 Stripe Checkout 页面应该看到：
   - 💳 Card
   - 🍎 Apple Pay (仅 Safari)
   - 🔵 Google Pay (仅 Chrome)

### Stripe 测试卡号

| 卡号 | 用途 |
|------|------|
| `4242 4242 4242 4242` | 通用成功卡 |
| `4000 0000 0000 0341` | 需要 3D Secure 验证 |
| `4000 0000 0000 0002` | 卡片被拒绝 |

- **CVV**: 任意 3 位数字
- **日期**: 任意未来日期
- **邮编**: 任意数字

### Alipay 测试
Stripe 测试模式下会模拟 Alipay 流程：
1. 选择 Alipay
2. 点击 "Authorize Test Payment" 模拟成功
3. 或点击 "Fail Test Payment" 模拟失败

## 📊 预期效果

| 用户语言 | 货币 | 可用支付方式 | 优势 |
|---------|------|-------------|------|
| 中文 | CNY | Card + Alipay | 本地化支付，转化率更高 |
| 英文 | USD | Card + Apple Pay + Google Pay | 一键支付，体验更快 |

## 🚀 部署步骤

此配置已部署到后端服务，无需额外操作。

**生产环境清单**:
- [ ] Stripe Dashboard 启用所有支付方式
- [ ] 添加并验证生产域名
- [ ] 测试所有支付方式在生产环境的可用性

## 🔗 相关文档

- [Stripe Payment Methods 文档](https://stripe.com/docs/payments/payment-methods)
- [Alipay 集成指南](https://stripe.com/docs/payments/alipay)
- [Apple Pay 集成指南](https://stripe.com/docs/apple-pay)
- [Google Pay 集成指南](https://stripe.com/docs/google-pay)
