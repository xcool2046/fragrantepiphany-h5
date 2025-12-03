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
exports.PerfumeService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const perfume_entity_1 = require("../entities/perfume.entity");
const card_entity_1 = require("../entities/card.entity");
const interp_service_1 = require("../interp/interp.service");
let PerfumeService = class PerfumeService {
    constructor(perfumeRepo, cardRepo, interpService) {
        this.perfumeRepo = perfumeRepo;
        this.cardRepo = cardRepo;
        this.interpService = interpService;
    }
    async getChapters(ids, language = 'zh', scentAnswer, category = 'Self') {
        let items = await this.perfumeRepo.find({
            where: { card_id: (0, typeorm_2.In)(ids), status: 'active' },
            order: { card_id: 'ASC', sort_order: 'ASC', id: 'ASC' },
        });
        // Filter by scent answer if provided (e.g. 'A')
        if (scentAnswer) {
            const prefix = scentAnswer.toUpperCase();
            items = items.filter((item) => item.scene_choice.startsWith(prefix));
        }
        // Fallback: If no perfumes found (e.g. cards have no data), use a default one
        if (items.length === 0) {
            const defaultPerfume = await this.perfumeRepo.findOne({
                where: { id: 22 },
            }); // Diptyque Eau Capitale
            if (defaultPerfume) {
                items = [defaultPerfume];
                // Ensure we fetch the card for this perfume
                if (!ids.includes(defaultPerfume.card_id)) {
                    ids.push(defaultPerfume.card_id);
                }
            }
        }
        // Fetch cards to get localized names
        const cards = await this.cardRepo.find({ where: { id: (0, typeorm_2.In)(ids) } });
        const cardMap = new Map(cards.map((c) => [c.id, c]));
        const orderMap = new Map();
        ids.forEach((id, idx) => orderMap.set(id, idx));
        const sorted = items.sort((a, b) => {
            var _a, _b;
            const aOrder = (_a = orderMap.get(a.card_id)) !== null && _a !== void 0 ? _a : 999;
            const bOrder = (_b = orderMap.get(b.card_id)) !== null && _b !== void 0 ? _b : 999;
            if (aOrder !== bOrder)
                return aOrder - bOrder;
            if (a.sort_order !== b.sort_order)
                return a.sort_order - b.sort_order;
            return a.id - b.id;
        });
        const isEn = language === 'en';
        // Fetch dynamic quotes (recommendations) from InterpretationService
        // Logic: Quote = Interpretation(Card, Category, Position='Present').summary
        // We assume the perfume is associated with the "Present" card context as per requirements.
        const quotes = await Promise.all(sorted.map(async (item) => {
            const card = cardMap.get(item.card_id);
            if (!card)
                return null;
            const interp = await this.interpService.findOne({
                card_name: card.name_en,
                category, // Use the passed category (Self/Career/Love)
                position: 'Present',
                language: isEn ? 'en' : 'zh', // Fetch correct language based on request
            });
            return (interp === null || interp === void 0 ? void 0 : interp.sentence) || '';
        }));
        return sorted.map((item, idx) => {
            var _a, _b;
            const card = cardMap.get(item.card_id);
            const cardName = (isEn ? card === null || card === void 0 ? void 0 : card.name_en : item.card_name) || item.card_name;
            // Use tags from DB
            const tags = (_a = item.tags) !== null && _a !== void 0 ? _a : [];
            // Dynamic quote overrides static quote
            const dynamicQuote = quotes[idx];
            // Static quote is deprecated but kept as fallback if needed, though likely null
            const staticSentence = (isEn ? item.sentence_en : item.sentence) || '';
            // Priority: Dynamic Quote > Static Override (if exists) > Empty String
            // We prioritize dynamic because static is often just a placeholder or single-context string
            const finalSentence = dynamicQuote || staticSentence || '';
            return {
                id: item.id,
                order: idx + 1,
                cardName: cardName,
                sceneChoice: (isEn ? item.scene_choice_en : item.scene_choice) ||
                    item.scene_choice,
                sceneChoiceZh: item.scene_choice,
                sceneChoiceEn: item.scene_choice_en || '',
                brandName: (isEn ? item.brand_name_en : item.brand_name) || item.brand_name,
                productName: (isEn ? item.product_name_en : item.product_name) ||
                    item.product_name,
                tags: tags,
                notes: {
                    top: '',
                    heart: '',
                    base: '',
                },
                description: (isEn ? item.description_en : item.description) ||
                    item.description ||
                    '',
                sentence: finalSentence,
                imageUrl: (_b = item.image_url) !== null && _b !== void 0 ? _b : '',
            };
        });
    }
    async list(params) {
        const { page, pageSize, q, status } = params;
        const qb = this.perfumeRepo.createQueryBuilder('perfume');
        if (status) {
            qb.andWhere('perfume.status = :status', { status });
        }
        if (q) {
            qb.andWhere('(perfume.product_name ILIKE :q OR perfume.brand_name ILIKE :q OR perfume.card_name ILIKE :q OR perfume.scene_choice ILIKE :q)', { q: `%${q}%` });
        }
        qb.orderBy('perfume.updated_at', 'DESC').addOrderBy('perfume.id', 'DESC');
        qb.skip((page - 1) * pageSize).take(pageSize);
        const [items, total] = await qb.getManyAndCount();
        return { items, total, page, pageSize };
    }
    async findOne(id) {
        const item = await this.perfumeRepo.findOne({ where: { id } });
        if (!item)
            throw new common_1.NotFoundException('Perfume not found');
        return item;
    }
    async create(payload) {
        var _a;
        const entity = this.perfumeRepo.create({
            status: 'active',
            sort_order: 0,
            tags: (_a = payload.tags) !== null && _a !== void 0 ? _a : null,
            ...payload,
        });
        return this.perfumeRepo.save(entity);
    }
    async update(id, payload) {
        const item = await this.findOne(id);
        Object.assign(item, payload);
        return this.perfumeRepo.save(item);
    }
    async remove(id) {
        const item = await this.findOne(id);
        await this.perfumeRepo.remove(item);
        return { id };
    }
    async resolveCardId(cardName) {
        var _a;
        const card = await this.cardRepo.findOne({ where: { name_en: cardName } });
        return (_a = card === null || card === void 0 ? void 0 : card.id) !== null && _a !== void 0 ? _a : null;
    }
    mapIndexToId(index) {
        // Assuming 1-based IDs for now, or implement specific mapping logic if needed
        // The controller logic suggests (idx % 78) + 1 mapping happens there,
        // but if we need it here:
        return index + 1;
    }
};
exports.PerfumeService = PerfumeService;
exports.PerfumeService = PerfumeService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(perfume_entity_1.Perfume)),
    __param(1, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        interp_service_1.InterpretationService])
], PerfumeService);
