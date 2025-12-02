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
exports.InterpretationService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const interpretation_entity_1 = require("../entities/interpretation.entity");
const tarot_1 = require("../constants/tarot");
let InterpretationService = class InterpretationService {
    constructor(repo) {
        this.repo = repo;
    }
    async findOne(query) {
        let lang = (query.language || 'en').toLowerCase();
        if (lang.startsWith('zh'))
            lang = 'zh';
        const alt = lang === 'en' ? 'zh' : 'en';
        const record = await this.repo.findOne({
            where: {
                card_name: query.card_name,
                category: query.category,
                position: query.position,
            },
        });
        if (!record)
            return null;
        const pick = (field) => {
            var _a, _b;
            return (_b = (_a = record[`${field}_${lang}`]) !== null && _a !== void 0 ? _a : record[`${field}_${alt}`]) !== null && _b !== void 0 ? _b : null;
        };
        return {
            card_name: record.card_name,
            category: record.category,
            position: record.position,
            language: lang,
            summary: pick('summary'),
            interpretation: pick('interpretation'),
            action: pick('action'),
            future: pick('future'),
            recommendation: pick('recommendation'),
        };
    }
    async drawThree() {
        // placeholder: random 3 distinct rows
        const all = await this.repo.find({ take: 100 });
        const shuffled = all.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3);
    }
    async importMany(items) {
        // 1. Group items by language to ensure consistent keys in each batch upsert
        const groups = {};
        for (const item of items) {
            const lang = (item.language || 'en').toLowerCase();
            const normLang = lang.startsWith('zh') ? 'zh' : 'en';
            if (!groups[normLang])
                groups[normLang] = [];
            const base = {
                card_name: item.card_name,
                category: item.category,
                position: item.position,
            };
            const prefix = normLang === 'zh' ? '_zh' : '_en';
            // Only set fields for the specific language. 
            // Do NOT set other language fields to null to avoid overwriting them in DB.
            if (item.summary !== undefined)
                base[`summary${prefix}`] = item.summary;
            if (item.interpretation !== undefined)
                base[`interpretation${prefix}`] = item.interpretation;
            if (item.action !== undefined)
                base[`action${prefix}`] = item.action;
            if (item.future !== undefined)
                base[`future${prefix}`] = item.future;
            if (item.recommendation !== undefined)
                base[`recommendation${prefix}`] = item.recommendation;
            groups[normLang].push(base);
        }
        const results = [];
        // 2. Execute upsert for each language group
        for (const lang of Object.keys(groups)) {
            const batch = groups[lang];
            if (batch.length > 0) {
                // Upsert will only update the columns present in 'batch' objects.
                // Since we separated by language, this batch only touches columns for 'lang'.
                await this.repo.upsert(batch, ['card_name', 'category', 'position']);
                results.push(...batch);
            }
        }
        return results;
    }
    async findAll(page = 1, limit = tarot_1.DEFAULT_PAGE_SIZE, filters = {}) {
        const take = Math.min(500, Math.max(1, Number(limit) || tarot_1.DEFAULT_PAGE_SIZE));
        const qb = this.repo.createQueryBuilder('i');
        if (filters.card_name)
            qb.andWhere('i.card_name = :card', { card: filters.card_name });
        if (filters.category)
            qb.andWhere('i.category = :cat', { cat: filters.category });
        if (filters.position)
            qb.andWhere('i.position = :pos', { pos: filters.position });
        if (filters.language) {
            const lang = filters.language.toLowerCase();
            qb.andWhere(`(i.summary_${lang} IS NOT NULL OR i.interpretation_${lang} IS NOT NULL)`);
        }
        if (filters.keyword) {
            const kw = `%${filters.keyword.trim()}%`;
            qb.andWhere(`(i.card_name ILIKE :kw OR i.summary_en ILIKE :kw OR i.summary_zh ILIKE :kw OR i.interpretation_en ILIKE :kw OR i.interpretation_zh ILIKE :kw OR i.action_en ILIKE :kw OR i.action_zh ILIKE :kw OR i.future_en ILIKE :kw OR i.future_zh ILIKE :kw)`, { kw });
        }
        const [items, total] = await qb
            .skip((page - 1) * take)
            .take(take)
            .orderBy('i.id', 'DESC')
            .getManyAndCount();
        return { items, total, page, limit: take };
    }
    async create(data) {
        const entity = this.repo.create(data);
        return this.repo.save(entity);
    }
    async update(id, data) {
        await this.repo.update(id, data);
        return this.repo.findOne({ where: { id } });
    }
    async remove(id) {
        return this.repo.delete(id);
    }
    async getInterpretationsForCards(cards, category, language) {
        const positions = ['Past', 'Present', 'Future'];
        const results = [];
        for (let i = 0; i < Math.min(cards.length, 3); i++) {
            const card = cards[i];
            const position = positions[i];
            const interp = await this.findOne({
                card_name: card.name_en,
                category,
                position,
                language,
            });
            results.push({
                position,
                card_name: card.name_en,
                content: interp,
            });
        }
        return results;
    }
    exportAll() {
        return this.repo.find();
    }
};
exports.InterpretationService = InterpretationService;
exports.InterpretationService = InterpretationService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(interpretation_entity_1.Interpretation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], InterpretationService);
