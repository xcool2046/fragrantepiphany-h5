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
exports.PerfumeController = void 0;
const common_1 = require("@nestjs/common");
const perfume_service_1 = require("./perfume.service");
const typeorm_1 = require("@nestjs/typeorm");
const card_entity_1 = require("../entities/card.entity");
const typeorm_2 = require("typeorm");
let PerfumeController = class PerfumeController {
    constructor(perfumeService, cardRepo) {
        this.perfumeService = perfumeService;
        this.cardRepo = cardRepo;
    }
    /**
     * GET /api/perfume/chapters?card_indices=0,1,2
     * OR
     * GET /api/perfume/chapters?cardIds=1,2,3 (Legacy/Direct ID support)
     * scentAnswer (optional): 用户香气偏好答案（用于 Excel 映射）
     */
    async getChapters(cardIndices, cardIdsParam, language = 'zh', scentAnswer, categoryParam = 'Self', q4Answer) {
        let ids = [];
        // 1. Try resolving from indices (Frontend 0-77)
        if (cardIndices) {
            const indices = cardIndices
                .split(',')
                .map((v) => Number(v.trim()))
                .filter((v) => Number.isInteger(v));
            if (indices.length > 0) {
                // Map indices to codes (0->01, 77->78)
                const codes = indices.map((idx) => String((idx % 78) + 1).padStart(2, '0'));
                const cards = await this.cardRepo.find({ where: { code: (0, typeorm_2.In)(codes) } });
                // Map back to IDs, preserving order relative to input indices not strictly required but good practice
                // actually service sorts by card_id/order anyway.
                ids = cards.map((c) => c.id);
            }
        }
        // 2. Fallback to direct IDs if no indices resolved
        if (ids.length === 0 && cardIdsParam) {
            ids = cardIdsParam
                .split(',')
                .map((v) => Number(v.trim()))
                .filter((v) => Number.isInteger(v) && v > 0);
        }
        if (ids.length === 0) {
            // If we had input but resolved nothing, that's an issue.
            // But to avoid breaking errors, return empty.
            return { chapters: [] };
        }
        // Normalize language
        const lang = language.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        // Derive Category from Q4 or param
        let category = categoryParam;
        if (q4Answer) {
            const first = q4Answer.trim().charAt(0).toUpperCase();
            if (first === 'A')
                category = 'Self';
            else if (first === 'B')
                category = 'Career';
            else if (first === 'C')
                category = 'Love';
        }
        const result = await this.perfumeService.getChapters(ids, lang, scentAnswer, category); // Pass derived 'category'
        if (result.length > 0) {
            console.log('DEBUG: First Perfume Chapter:', JSON.stringify(result[0], null, 2));
        }
        return { chapters: result }; // Wrap result in an object with 'chapters' key
    }
};
exports.PerfumeController = PerfumeController;
__decorate([
    (0, common_1.Get)('chapters'),
    __param(0, (0, common_1.Query)('card_indices')),
    __param(1, (0, common_1.Query)('cardIds')),
    __param(2, (0, common_1.Query)('language')),
    __param(3, (0, common_1.Query)('scentAnswer')),
    __param(4, (0, common_1.Query)('category')),
    __param(5, (0, common_1.Query)('q4Answer')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], PerfumeController.prototype, "getChapters", null);
exports.PerfumeController = PerfumeController = __decorate([
    (0, common_1.Controller)('api/perfume'),
    __param(1, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [perfume_service_1.PerfumeService,
        typeorm_2.Repository])
], PerfumeController);
