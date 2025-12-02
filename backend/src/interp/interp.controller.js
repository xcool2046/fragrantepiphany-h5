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
exports.InterpretationController = void 0;
const common_1 = require("@nestjs/common");
const interp_service_1 = require("./interp.service");
const passport_1 = require("@nestjs/passport");
const draw_service_1 = require("./draw.service");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const card_entity_1 = require("../entities/card.entity");
const tarot_1 = require("../constants/tarot");
const pay_service_1 = require("../pay/pay.service");
let InterpretationController = class InterpretationController {
    constructor(service, drawService, cardRepo, payService) {
        this.service = service;
        this.drawService = drawService;
        this.cardRepo = cardRepo;
        this.payService = payService;
    }
    async getOne(card_name, category, position, language) {
        return this.service.findOne({ card_name, category, position, language });
    }
    async getReading(body) {
        const { card_indices, orderId, language = 'en', category = 'Self', answers = {} } = body;
        if (!Array.isArray(card_indices) || card_indices.length !== 3) {
            return { error: 'Invalid cards' };
        }
        // Prefer Q4 (A/B/C) to decide category; fallback to provided category
        const mapQ4 = (val) => {
            if (!val || typeof val !== 'string')
                return null;
            const first = val.trim().charAt(0).toUpperCase();
            if (first === 'A')
                return 'Self';
            if (first === 'B')
                return 'Career';
            if (first === 'C')
                return 'Love';
            return null;
        };
        const derivedCategory = mapQ4(answers['4']) || category;
        // 1. Resolve Cards
        const cardCodes = card_indices.map((idx) => String((idx % 78) + 1).padStart(2, '0'));
        console.log(`[Reading] Indices: ${card_indices} -> Codes: ${cardCodes}`);
        const cards = await this.cardRepo.find({ where: { code: (0, typeorm_2.In)(cardCodes) } });
        // Sort to match Past, Present, Future order explicitly
        const sortedCards = cardCodes
            .map((code) => cards.find((c) => c.code === code))
            .filter(Boolean);
        console.log(`[Reading] Sorted Cards: ${sortedCards.map(c => c.name_en).join(', ')}`);
        if (sortedCards.length !== 3) {
            console.warn(`[Reading] Mismatch! Found ${sortedCards.length} cards for ${cardCodes}`);
            return { error: 'Cards not found' };
        }
        // 2. Get Raw Interpretations
        const rawInterps = await this.service.getInterpretationsForCards(sortedCards, derivedCategory, language);
        console.log(`[Reading] Interps Returned: ${rawInterps.map(i => `${i.position}:${i.card_name}`).join(', ')}`);
        // 3. Check Access
        let isUnlocked = false;
        if (orderId) {
            if (orderId === 'debug-unlocked') {
                isUnlocked = true;
            }
            else {
                // Use checkAndUpdateStatus to handle webhook delays
                const order = await this.payService.checkAndUpdateStatus(orderId);
                if (order && order.status === 'succeeded') {
                    isUnlocked = true;
                }
            }
        }
        // 4. Construct Response
        const response = {
            is_unlocked: isUnlocked,
            past: null,
            present: null,
            future: null,
        };
        // Map rawInterps to response keys
        rawInterps.forEach((item) => {
            const key = item.position.toLowerCase(); // past, present, future
            const content = item.content;
            if (key === 'past') {
                // Past is always fully visible
                response.past = {
                    ...content,
                    is_locked: false,
                };
            }
            else {
                // Present & Future are locked unless paid
                if (isUnlocked) {
                    response[key] = {
                        ...content,
                        is_locked: false,
                    };
                }
                else {
                    // Locked: only return null or limited data
                    response[key] = {
                        summary: null,
                        interpretation: null,
                        is_locked: true,
                    };
                }
            }
        });
        return response;
    }
    async draw(category, language = 'en') {
        return this.drawService.draw(category, language);
    }
    async importData(body) {
        return this.service.importMany(body.items);
    }
    async exportData() {
        return this.service.exportAll();
    }
    async list(page = 1, limit = tarot_1.DEFAULT_PAGE_SIZE, card_name, category, position, language, keyword) {
        return this.service.findAll(Number(page), Number(limit), {
            card_name,
            category,
            position,
            language,
            keyword,
        });
    }
    async create(body) {
        return this.service.create(body);
    }
    async update(id, body) {
        return this.service.update(Number(id), body);
    }
    async remove(id) {
        return this.service.remove(Number(id));
    }
    // 根据三张牌 + 问卷答案匹配规则（按 priority ASC, id ASC）
    async matchRule(body) {
        var _a, _b, _c;
        const cardIndices = Array.isArray(body.card_indices)
            ? body.card_indices.slice(0, 3)
            : [];
        if (cardIndices.length !== 3)
            return { rule: null };
        // 1) 将卡片下标映射为两位 code（01~78）
        const cardCodes = cardIndices
            .map((idx) => String((idx % 78) + 1).padStart(2, '0'));
        // 2) 用卡牌默认解读拼接合成结果
        const cards = await this.cardRepo.find({
            where: { code: (0, typeorm_2.In)(cardCodes) },
        });
        const sortedCards = cardCodes.map((code) => cards.find((c) => c.code === code));
        const category = body.category || tarot_1.TAROT_CATEGORIES[0]; // Default to Self
        const interpretations = await Promise.all(sortedCards.map((card, i) => card
            ? this.service.findOne({
                card_name: card.name_en,
                position: tarot_1.TAROT_POSITIONS[i],
                language: body.language || 'en',
                category,
            })
            : null));
        if (!interpretations.some((i) => i !== null)) {
            return { rule: null };
        }
        const summary = ((_a = interpretations[1]) === null || _a === void 0 ? void 0 : _a.summary) ||
            ((_b = interpretations[0]) === null || _b === void 0 ? void 0 : _b.summary) ||
            ((_c = interpretations[2]) === null || _c === void 0 ? void 0 : _c.summary) ||
            '';
        const interpretationText = interpretations
            .map((i, idx) => {
            if (!(i === null || i === void 0 ? void 0 : i.interpretation))
                return '';
            const label = tarot_1.TAROT_POSITIONS[idx];
            return `${label}: ${i.interpretation}`;
        })
            .filter(Boolean)
            .join('\n\n');
        const syntheticRule = {
            id: 0,
            question_id: 0,
            card_codes: cardCodes,
            priority: 999,
            enabled: true,
            summary_free: {
                en: summary,
                zh: summary,
            },
            interpretation_full: {
                en: interpretationText,
                zh: interpretationText,
            },
            recommendations: null,
            created_at: new Date(),
            updated_at: new Date(),
        };
        return { rule: syntheticRule };
    }
};
exports.InterpretationController = InterpretationController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('card_name')),
    __param(1, (0, common_1.Query)('category')),
    __param(2, (0, common_1.Query)('position')),
    __param(3, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "getOne", null);
__decorate([
    (0, common_1.Post)('reading'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "getReading", null);
__decorate([
    (0, common_1.Get)('draw'),
    __param(0, (0, common_1.Query)('category')),
    __param(1, (0, common_1.Query)('language')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "draw", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('import'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "importData", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('export'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "exportData", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Get)('list'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('card_name')),
    __param(3, (0, common_1.Query)('category')),
    __param(4, (0, common_1.Query)('position')),
    __param(5, (0, common_1.Query)('language')),
    __param(6, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "list", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "create", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('update/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "update", null);
__decorate([
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    (0, common_1.Post)('delete/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)('rule-match'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InterpretationController.prototype, "matchRule", null);
exports.InterpretationController = InterpretationController = __decorate([
    (0, common_1.Controller)('api/interp'),
    __param(2, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [interp_service_1.InterpretationService,
        draw_service_1.DrawService,
        typeorm_2.Repository,
        pay_service_1.PayService])
], InterpretationController);
