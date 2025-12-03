"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("../entities/order.entity");
const stripe_1 = __importDefault(require("stripe"));
const STRIPE_API_VERSION = '2024-06-20';
let PayService = class PayService {
    constructor(orders) {
        this.orders = orders;
        this.stripe = null;
        this.stripeReady = false;
        this.priceCache = new Map();
        const secret = process.env.STRIPE_SECRET_KEY;
        if (!secret) {
            console.warn('STRIPE_SECRET_KEY is missing, Stripe features are disabled');
            this.stripeReady = false;
            this.stripe = null;
        }
        if (secret) {
            this.stripe = new stripe_1.default(secret, { apiVersion: STRIPE_API_VERSION });
            this.stripeReady = true;
        }
        this.envPriceMap = this.loadEnvPriceMap();
    }
    getStripe() {
        return this.stripeReady ? this.stripe : null;
    }
    isStripeReady() {
        return this.stripeReady;
    }
    loadEnvPriceMap() {
        var _a;
        const raw = process.env.STRIPE_PRICE_IDS_JSON_TEST &&
            ((_a = process.env.STRIPE_SECRET_KEY) === null || _a === void 0 ? void 0 : _a.startsWith('sk_test_'))
            ? process.env.STRIPE_PRICE_IDS_JSON_TEST
            : process.env.STRIPE_PRICE_IDS_JSON;
        if (!raw)
            return null;
        let mapping;
        try {
            mapping = JSON.parse(raw);
        }
        catch (err) {
            throw new Error('Invalid STRIPE_PRICE_IDS_JSON, must be valid JSON object');
        }
        return mapping;
    }
    async resolvePriceIdByCurrency(currency) {
        var _a, _b;
        const key = currency.toLowerCase();
        // Prefer env mapping
        if ((_a = this.envPriceMap) === null || _a === void 0 ? void 0 : _a[key])
            return this.envPriceMap[key];
        const cached = this.priceCache.get(key);
        if (cached)
            return cached;
        // If Stripe is not configured, we cannot resolve dynamically
        if (!this.stripeReady) {
            throw new Error('Stripe is not configured and no price mapping provided');
        }
        try {
            const prices = await this.stripe.prices.list({
                active: true,
                currency: key,
                limit: 100,
            });
            const price = (_b = prices.data.find((p) => p.type === 'one_time')) !== null && _b !== void 0 ? _b : prices.data[0];
            if (price) {
                this.priceCache.set(key, price.id);
                return price.id;
            }
            console.warn(`No active Stripe price found for currency: ${currency}. Attempting to auto-create one.`);
            // Auto-create product and price
            const product = await this.stripe.products.create({
                name: 'Tarot Reading Unlock',
                metadata: { type: 'tarot_unlock' },
            });
            const newPrice = await this.stripe.prices.create({
                product: product.id,
                currency: key,
                unit_amount: 500, // 5.00
            });
            console.log(`Auto-created price ${newPrice.id} for currency ${currency}`);
            this.priceCache.set(key, newPrice.id);
            return newPrice.id;
        }
        catch (err) {
            console.error(`Error resolving/creating price for ${currency}:`, err);
            throw err;
        }
    }
    async createSession(input) {
        var _a, _b, _c;
        if (!this.stripeReady) {
            throw new Error('Stripe is not configured');
        }
        let publicBaseUrl = process.env.PUBLIC_BASE_URL || '';
        if (!publicBaseUrl) {
            console.error('Missing PUBLIC_BASE_URL env var');
            throw new Error('PUBLIC_BASE_URL is required for Stripe redirect');
        }
        // Remove trailing slash if present
        if (publicBaseUrl.endsWith('/')) {
            publicBaseUrl = publicBaseUrl.slice(0, -1);
        }
        console.log(`Creating Stripe session with callback URL base: ${publicBaseUrl}`);
        const priceId = await this.resolvePriceIdByCurrency(input.currency);
        let session;
        // Prepare metadata for Stripe: Flatten/Serialize nested objects
        const stripeMetadata = {};
        if (input.metadata) {
            for (const [k, v] of Object.entries(input.metadata)) {
                if (typeof v === 'object' && v !== null) {
                    stripeMetadata[k] = JSON.stringify(v);
                }
                else {
                    stripeMetadata[k] = String(v);
                }
            }
        }
        try {
            // 1. Create Order first to get the ID
            const order = this.orders.create({
                amount: 0, // Will update after session creation
                currency: input.currency,
                status: 'pending',
                metadata: input.metadata,
            });
            await this.orders.save(order);
            // 2. Prepare URLs with Order ID
            const successUrl = `${publicBaseUrl}/pay/callback?status=success&order_id=${order.id}&session_id={CHECKOUT_SESSION_ID}`;
            const cancelUrl = `${publicBaseUrl}/pay/callback?status=cancel&order_id=${order.id}`;
            // 3. Create Stripe Session
            stripeMetadata.order_id = order.id;
            session = await this.stripe.checkout.sessions.create({
                mode: 'payment',
                client_reference_id: order.id,
                line_items: [
                    {
                        price: priceId,
                        quantity: 1,
                    },
                ],
                success_url: successUrl,
                cancel_url: cancelUrl,
                metadata: stripeMetadata,
            });
            console.log(`Stripe session created: ${session.id}, URL: ${session.url}`);
            // 4. Update Order with Session details
            const amount = (_b = (_a = session.amount_total) !== null && _a !== void 0 ? _a : session.amount_subtotal) !== null && _b !== void 0 ? _b : 0;
            const currency = (_c = session.currency) !== null && _c !== void 0 ? _c : input.currency;
            await this.orders.update({ id: order.id }, {
                amount,
                currency,
                stripe_session_id: session.id,
            });
            return { orderId: order.id, sessionUrl: session.url };
        }
        catch (error) {
            console.error('Stripe Session Creation Failed:', error);
            throw error;
        }
    }
    constructEventFromWebhook(rawBody, sig) {
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        if (!secret) {
            throw new Error('STRIPE_WEBHOOK_SECRET is required');
        }
        if (!this.stripe) {
            throw new Error('Stripe is not initialized');
        }
        return this.stripe.webhooks.constructEvent(rawBody, sig, secret);
    }
    async handleWebhook(event) {
        var _a, _b;
        const allowed = new Set([
            'checkout.session.completed',
            'payment_intent.payment_failed',
        ]);
        if (!allowed.has(event.type)) {
            return { ignored: true };
        }
        if (event.type === 'checkout.session.completed') {
            const session = event.data.object;
            const metadata = (session.metadata || {});
            const orderId = metadata.order_id;
            if (!orderId)
                return { skipped: 'no order_id' };
            const order = await this.orders.findOne({ where: { id: orderId } });
            if (!order)
                return { skipped: 'order not found' };
            // 幂等处理：已成功则直接返回
            if (order.status === 'succeeded')
                return { ok: true, idempotent: true };
            // 校验金额与币种一致
            if (session.currency !== order.currency ||
                ((_b = (_a = session.amount_total) !== null && _a !== void 0 ? _a : session.amount_subtotal) !== null && _b !== void 0 ? _b : 0) !== order.amount) {
                return { skipped: 'amount or currency mismatch' };
            }
            await this.orders.update({ id: orderId }, {
                status: 'succeeded',
                stripe_session_id: session.id,
                payment_intent_id: session.payment_intent ||
                    order.payment_intent_id ||
                    undefined,
            });
            return { ok: true };
        }
        if (event.type === 'payment_intent.payment_failed') {
            const pi = event.data.object;
            const metadata = (pi.metadata || {});
            const orderId = metadata.order_id;
            if (!orderId)
                return { skipped: 'no order_id' };
            await this.orders.update({ id: orderId }, { status: 'failed', payment_intent_id: pi.id });
            return { ok: true };
        }
    }
    async getOrder(id) {
        return this.orders.findOne({ where: { id } });
    }
    async checkAndUpdateStatus(orderId) {
        const order = await this.getOrder(orderId);
        if (!order)
            return null;
        if (order.status === 'succeeded')
            return order;
        if (!order.stripe_session_id)
            return order;
        if (!this.stripe)
            return order;
        try {
            const session = await this.stripe.checkout.sessions.retrieve(order.stripe_session_id);
            if (session.payment_status === 'paid') {
                await this.orders.update({ id: orderId }, {
                    status: 'succeeded',
                    payment_intent_id: session.payment_intent,
                });
                // Refetch updated order
                return this.getOrder(orderId);
            }
        }
        catch (err) {
            console.error(`Failed to check stripe status for order ${orderId}:`, err);
        }
        return order;
    }
};
exports.PayService = PayService;
exports.PayService = PayService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], PayService);
