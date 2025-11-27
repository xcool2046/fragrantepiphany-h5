# TEST_PAYMENT.md

## 1. 环境准备
- **前端入口**：`http://localhost:8080/`（Nginx 代理 Vite，参考 `docs/dev-guide.md`）。
- **后端 / API**：`http://localhost:3000`，`POST /api/pay/create-session`、`GET /api/pay/order/:id`、`POST /api/pay/webhook` 位于 `backend/src/pay/pay.service.ts` 与 `pay.controller.ts`。
- **Stripe 测试模式**：使用 `.env` 中的 `STRIPE_PUBLISHABLE_KEY` / `STRIPE_SECRET_KEY`（目前指向 test key），支持 `mock_pay=true` 查询参数快速模拟已支付状态（参见 `docs/dev-guide.md` Testing Guide）。
- **后台账户**：`.env` 提供 `ADMIN_USER=monicacjx`、`ADMIN_PASS=kittycjx88358985`，登录 URL `http://localhost:8080/admin/login`。

## 2. 前台全链路自动化脚本（桌面视角 1280×720）
### 2.1 商品选择（Home → Quiz）
1. `page.goto("http://localhost:8080/")`，等待 `.bg-card.rounded-card` 模块加载完毕。
2. `page.click('a.px-4.py-2.bg-primary.text-white.rounded-full[href="/quiz"]')` 进入问卷。
3. 对每道题循环执行：`page.click('button.text-left.px-3.py-3.rounded-card.border')` 任选一项（元素来自 `frontend/src/pages/Quiz.tsx`）。
4. 点击底部浮层按钮：`page.click('.fixed.bottom-0 button.w-[90%].max-w-md.py-4.rounded-full')` 进入抽牌页。

### 2.2 抽牌（/draw）
1. 等待 `div.absolute.top-1/2` 左侧槽位渲染，确认 `fetchDraw` 返回成功（可监听 `GET /api/interp/draw` XHR）。
2. 触发中心抽牌按钮三次：
   - `page.click('button.absolute.z-30.w-20.h-20.rounded-full.bg-[#D4A373]')`
   - 若移动端布局遮挡，可改触发兜底按钮：`page.click('button.fixed.bottom-8.right-8.w-20.h-20.rounded-full')`.
3. 监听 `navigate('/result')`，等待 `result` 页加载（URL 变为 `/result`，`location.state` 持有 `answers`/`cards`）。

### 2.3 结算页（/result）
1. 确认 Past 卡片可见：`.text-2xl.font-serif` + `.flex.flex-wrap`.
2. 点击支付解锁按钮：`page.click('button.mt-4.px-8.py-3.bg-[#D4A373].rounded-full')`（`Result.tsx` 中 `handlePay`）。
3. 断言路由跳至 `/pay`。

### 2.4 提交订单 & 模拟支付
1. `/pay` 页面加载即发起 `POST /api/pay/create-session`，在 Playwright/Chrome DevTools 中拦截响应，记录 `orderId` 与 `sessionUrl`。
2. `Pay.tsx` 自动 `window.location.href = sessionUrl`，等待跳转至 `https://checkout.stripe.com/c/pay/...`。
3. **Stripe 测试卡成功流**：
   - 切换到 `iframe[src*="checkout.stripe.com"]`.
   - `frame.fill('input[data-elements-stable-field-name="cardNumber"]', '4242 4242 4242 4242')`
   - `frame.fill('input[data-elements-stable-field-name="cardExpiry"]', '12 / 34')`
   - `frame.fill('input[data-elements-stable-field-name="cardCvc"]', '123')`
   - `frame.click('button#submitButton')`（确认 `cards`，Apple/Google Pay 按钮由 Stripe 自动控制）。
4. **失败流**：重复步骤 3，但卡号使用 `4000 0000 0000 0002`（Stripe 拒付卡，来自 `STRIPE_PAYMENT_METHODS.md`）。
5. **快速 Mock**：跳过 Stripe，直接 `page.goto("http://localhost:8080/result?mock_pay=true&order_id=" + orderId)`，用于 CI 或无法调用 Stripe 的环境。

### 2.5 成功 / 失败回调验证
1. 正常 Stripe 支付后会回跳 `http://localhost:8080/pay/callback?status=success&order_id=...`。
2. 在 `Callback.tsx`：
   - 成功：`page.click('a.px-4.py-2.bg-primary.text-white.rounded-full[href="/result"]')` 返回结果页，断言付费内容（Now/Future/推荐段落）不再模糊。
   - 失败：`page.click('a.px-4.py-2.bg-primary.text-white.rounded-full[href="/pay"]')` 重新拉起 `Pay`。
3. 轮询 `GET /api/pay/order/:id` 直至 `status` 为 `succeeded` 或 `failed`（`pay.service.ts` 在 webhook 中更新）。
4. 在 `/result` 校验：`document.querySelectorAll('.blur-sm').length === 0` 表示已解锁。

## 3. 后台订单校验（http://localhost:8080/admin）
1. 打开 `page.goto("http://localhost:8080/admin/login")`。
2. 输入凭证：
   - 用户名输入框：`input[type="text"].border`（第一个 `input`）。
   - 密码输入框：`input[type="password"].border`.
   - 登录：`page.click('button.w-full.flex.justify-center.py-2.px-4.bg-[#D4A373]')`。
3. 登录成功后跳至 `/admin`，点击侧边栏订单菜单：`page.click('a.block.px-4.py-2.rounded[href="/admin/orders"]')`。
4. 桌面视图：检查 `table.min-w-full.divide-y` 中最新行：
   - `td:nth-child(2)` 显示金额 `(amount/100) currency`，应与测试币种一致（当前 `PayService` 强制 USD）。
   - `td:nth-child(3) span.rounded-full` 颜色：`bg-green-50` => 成功；`bg-yellow-50` => 处理中/失败。
5. 移动视图：切换至 390px 宽度，断言 `.md:hidden .bg-white.p-4.rounded-xl` 卡片中 `order.status` 与 API 一致。
6. 失败用例：使用拒付卡支付后刷新订单列表，确认同一 `order.id` 状态从 `pending` 更新为 `failed`。

## 4. H5 移动端专项检查（390×844，触发软键盘）
### 4.1 Stripe 表单键盘遮挡
1. `context.newPage({ viewport: { width: 390, height: 844 }, isMobile: true })`。
2. 执行 2.1–2.3 步骤至 Stripe Checkout。
3. 聚焦卡号输入：`frame.focus('input[data-elements-stable-field-name="cardNumber"]')`。
4. 调用 `page.evaluate(() => window.visualViewport.height)` 前后比对；同时 `frame.evaluate(() => document.querySelector('input[data-elements-stable-field-name="cardNumber"]').getBoundingClientRect().bottom)`，确保底部坐标 < `visualViewport.height`，若被遮挡需记录缺陷。
5. 对有效期 / CVC 重复步骤。

### 4.2 “确认支付”按钮可见性
1. 在移动视图 Stripe 结算页执行 `frame.$eval('button#submitButton', el => el.getBoundingClientRect())`，确认 `bottom <= window.innerHeight`。
2. 在软键盘打开状态（CVC 输入后不手动关闭），再次取坐标，若 `bottom > innerHeight` 则记录。
3. 若 Apple Pay / Google Pay 按钮出现（`button[data-testid="wallet-button-APPLE_PAY"]` / `...GOOGLE_PAY`），需验证其 `getBoundingClientRect()` 在可视区域内。

## 5. 失败回路与重试
- **后端异常**：若 `/pay` 抛错，会显示错误卡片；可点击 `button.w-full.px-6.py-3.bg-[#D4A373]` 重试或 `button.w-full.px-6.py-3.bg-white.border` 退回上一页，脚本需断言提示文案。
- **Webhook 未触发**：利用 `mock_pay=true` 强制前端认定成功，但仍需执行 `GET /api/pay/order/:id` 确认状态，若长期 `pending` 需检查 Stripe Dashboard→Events。

## 6. 数据点复核
- **Order ID**：始终来自 `POST /api/pay/create-session` 响应，写入 `orders` 表后用于回调。自动化脚本需把 `orderId` 传递到后台校验与回调 URL。
- **币种**：`PayService` 目前硬编码 `currency: 'usd'`。测试脚本只需校验 USD 金额（`config.price_usd`）即可；若后续恢复 CNY，需要同时验证 `payment_method_types` 包含 `'alipay'`（参见 `backend/src/pay/pay.service.ts`）。
- **支付方式可见性**：在 Stripe Checkout DOM 内检测 `button[data-testid="wallet-button-APPLE_PAY"]`/`...GOOGLE_PAY`；对于支付宝，在 `payment_method_configurations` API 返回 `alipay.available === true` 时才会展示。

按照以上指引，可实现从前台下单、Stripe 测试支付、回调、后台订单同步的自动化闭环，并覆盖移动端视角的输入与按钮可见性检查。
