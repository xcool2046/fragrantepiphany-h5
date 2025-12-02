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
Object.defineProperty(exports, "__esModule", { value: true });
exports.PayController = void 0;
const common_1 = require("@nestjs/common");
const pay_service_1 = require("./pay.service");
let PayController = class PayController {
    constructor(payService) {
        this.payService = payService;
    }
    async createSession(body) {
        try {
            return await this.payService.createSession(body);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            if (message.includes('Stripe is not configured')) {
                return { error: 'Payment is temporarily unavailable (missing Stripe config)' };
            }
            throw err;
        }
    }
    async webhook(req, res) {
        const sig = req.headers['stripe-signature'];
        if (!sig) {
            return res.status(400).send('Missing signature');
        }
        let event;
        try {
            // rawBody is attached by express json verify hook
            const rawBodyContainer = req;
            const rawBodyCandidate = rawBodyContainer.rawBody;
            if (!rawBodyCandidate || !Buffer.isBuffer(rawBodyCandidate)) {
                return res.status(400).send('Invalid raw body');
            }
            event = this.payService.constructEventFromWebhook(rawBodyCandidate, sig);
        }
        catch (err) {
            const message = err instanceof Error ? err.message : 'unknown error';
            return res.status(400).send(`Webhook Error: ${message}`);
        }
        const result = await this.payService.handleWebhook(event);
        return res.json(result !== null && result !== void 0 ? result : { received: true });
    }
    getOrder(id) {
        return this.payService.getOrder(id);
    }
    async getConfig() {
        var _a;
        try {
            // Default to USD as per requirements
            const priceId = await this.payService.resolvePriceIdByCurrency('usd');
            const stripe = this.payService.getStripe();
            if (!stripe) {
                // Stripe not configured but mapping exists
                const fallbackAmount = 500;
                return {
                    priceDisplay: '$5.00',
                    currency: 'usd',
                    priceAmount: fallbackAmount,
                    priceId,
                    source: 'env-mapping'
                };
            }
            const price = await stripe.prices.retrieve(priceId);
            const amount = (_a = price.unit_amount) !== null && _a !== void 0 ? _a : 500;
            const currency = price.currency;
            // Format price display (e.g., $5.00)
            const formatter = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: currency.toUpperCase(),
            });
            return {
                priceDisplay: formatter.format(amount / 100),
                currency,
                priceAmount: amount,
                priceId,
                source: 'stripe'
            };
        }
        catch (err) {
            console.error('Failed to fetch price config', err);
            // Fallback safe default if Stripe fails
            return {
                priceDisplay: '$5.00',
                currency: 'usd',
                priceAmount: 500,
                source: 'fallback'
            };
        }
    }
};
exports.PayController = PayController;
__decorate([
    (0, common_1.Post)('create-session'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "createSession", null);
__decorate([
    (0, common_1.Post)('webhook'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], PayController.prototype, "webhook", null);
__decorate([
    (0, common_1.Get)('order/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], PayController.prototype, "getOrder", null);
__decorate([
    (0, common_1.Get)('config'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], PayController.prototype, "getConfig", null);
exports.PayController = PayController = __decorate([
    (0, common_1.Controller)('api/pay'),
    __metadata("design:paramtypes", [pay_service_1.PayService])
], PayController);
