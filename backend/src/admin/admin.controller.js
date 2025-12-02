"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const passport_1 = require("@nestjs/passport");
const question_entity_1 = require("../entities/question.entity");
const card_entity_1 = require("../entities/card.entity");
const perfume_entity_1 = require("../entities/perfume.entity");
const platform_express_1 = require("@nestjs/platform-express");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const parse_1 = require("@fast-csv/parse");
const format_1 = require("@fast-csv/format");
const common_2 = require("@nestjs/common");
const class_validator_1 = require("class-validator");
class CreateQuestionDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "title_en", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateQuestionDto.prototype, "title_zh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "options_en", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Array)
], CreateQuestionDto.prototype, "options_zh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateQuestionDto.prototype, "active", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    __metadata("design:type", Number)
], CreateQuestionDto.prototype, "weight", void 0);
const swagger_1 = require("@nestjs/swagger");
class UpdateQuestionDto extends (0, swagger_1.PartialType)(CreateQuestionDto) {
}
class CreateCardDto {
}
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "code", void 0);
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.IsNotEmpty)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "name_en", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "name_zh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "image_url", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "default_meaning_en", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateCardDto.prototype, "default_meaning_zh", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateCardDto.prototype, "enabled", void 0);
class UpdateCardDto extends CreateCardDto {
}
let AdminController = class AdminController {
    constructor(questionRepo, cardRepo, perfumeRepo) {
        this.questionRepo = questionRepo;
        this.cardRepo = cardRepo;
        this.perfumeRepo = perfumeRepo;
    }
    // ========== Questions ==========
    async listQuestions() {
        const items = await this.questionRepo.find({
            order: { weight: 'ASC', id: 'ASC' },
        });
        return { items };
    }
    async createQuestion(body) {
        var _a, _b, _c, _d, _e;
        if (!body.title_en)
            throw new common_1.BadRequestException('title_en is required');
        const entity = this.questionRepo.create({
            title_en: body.title_en,
            title_zh: (_a = body.title_zh) !== null && _a !== void 0 ? _a : null,
            options_en: (_b = body.options_en) !== null && _b !== void 0 ? _b : null,
            options_zh: (_c = body.options_zh) !== null && _c !== void 0 ? _c : null,
            active: (_d = body.active) !== null && _d !== void 0 ? _d : true,
            weight: (_e = body.weight) !== null && _e !== void 0 ? _e : 0,
        });
        return await this.questionRepo.save(entity);
    }
    async updateQuestion(id, body) {
        var _a, _b, _c, _d, _e, _f;
        const q = await this.questionRepo.findOne({ where: { id: Number(id) } });
        if (!q)
            throw new common_1.NotFoundException('Question not found');
        Object.assign(q, {
            title_en: (_a = body.title_en) !== null && _a !== void 0 ? _a : q.title_en,
            title_zh: (_b = body.title_zh) !== null && _b !== void 0 ? _b : q.title_zh,
            options_en: (_c = body.options_en) !== null && _c !== void 0 ? _c : q.options_en,
            options_zh: (_d = body.options_zh) !== null && _d !== void 0 ? _d : q.options_zh,
            active: (_e = body.active) !== null && _e !== void 0 ? _e : q.active,
            weight: (_f = body.weight) !== null && _f !== void 0 ? _f : q.weight,
        });
        return await this.questionRepo.save(q);
    }
    async deleteQuestion(id) {
        await this.questionRepo.delete({ id: Number(id) });
        return { ok: true };
    }
    // ========== Perfumes ==========
    async listPerfumes(page = '1', pageSize = '20', keyword) {
        console.log(`[Admin] listPerfumes called. Page: ${page}, Size: ${pageSize}, Keyword: ${keyword}`);
        const take = Math.min(100, Math.max(1, Number(pageSize) || 20));
        const skip = (Math.max(1, Number(page) || 1) - 1) * take;
        const qb = this.perfumeRepo.createQueryBuilder('p').orderBy('p.id', 'DESC');
        if (keyword) {
            const kw = `%${keyword.trim()}%`;
            qb.andWhere('(p.brand_name ILIKE :kw OR p.product_name ILIKE :kw OR p.card_name ILIKE :kw)', { kw });
        }
        const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
        console.log(`[Admin] listPerfumes found ${items.length} items, total: ${total}`);
        return { items, total, page: Number(page), pageSize: take };
    }
    async createPerfume(body) {
        // Basic validation
        if (!body.card_id || !body.brand_name || !body.product_name) {
            throw new common_1.BadRequestException('card_id, brand_name, product_name are required');
        }
        const entity = this.perfumeRepo.create(body);
        return await this.perfumeRepo.save(entity);
    }
    async updatePerfume(id, body) {
        const p = await this.perfumeRepo.findOne({ where: { id: Number(id) } });
        if (!p)
            throw new common_1.NotFoundException('Perfume not found');
        // Allow updating any field passed in body
        Object.assign(p, body);
        return await this.perfumeRepo.save(p);
    }
    async deletePerfume(id) {
        await this.perfumeRepo.delete({ id: Number(id) });
        return { ok: true };
    }
    // ========== Cards ==========
    async listCards(page = '1', pageSize = '20', keyword, onlyEnabled) {
        // 允许前端用较大 pageSize 一次取全量，但限制为 500 以防过载
        const take = Math.min(500, Math.max(1, Number(pageSize) || 20));
        const skip = (Math.max(1, Number(page) || 1) - 1) * take;
        const qb = this.cardRepo
            .createQueryBuilder('card')
            .orderBy('card.code', 'ASC');
        if (keyword) {
            const kw = `%${keyword.trim()}%`;
            qb.andWhere('(card.code ILIKE :kw OR card.name_en ILIKE :kw OR card.name_zh ILIKE :kw)', { kw });
        }
        if (onlyEnabled === 'true') {
            qb.andWhere('card.enabled = true');
        }
        const [items, total] = await qb.skip(skip).take(take).getManyAndCount();
        return { items, total, page: Number(page), pageSize: take };
    }
    async createCard(body) {
        var _a, _b, _c, _d, _e;
        if (!body.code || !body.name_en)
            throw new common_1.BadRequestException('code and name_en are required');
        const existing = await this.cardRepo.findOne({
            where: { code: body.code },
        });
        if (existing)
            throw new common_1.BadRequestException('code already exists');
        const entity = this.cardRepo.create({
            code: body.code,
            name_en: body.name_en,
            name_zh: (_a = body.name_zh) !== null && _a !== void 0 ? _a : null,
            image_url: (_b = body.image_url) !== null && _b !== void 0 ? _b : null,
            default_meaning_en: (_c = body.default_meaning_en) !== null && _c !== void 0 ? _c : null,
            default_meaning_zh: (_d = body.default_meaning_zh) !== null && _d !== void 0 ? _d : null,
            enabled: (_e = body.enabled) !== null && _e !== void 0 ? _e : true,
        });
        return await this.cardRepo.save(entity);
    }
    async updateCard(id, body) {
        var _a, _b, _c, _d, _e, _f;
        const card = await this.cardRepo.findOne({ where: { id: Number(id) } });
        if (!card)
            throw new common_1.NotFoundException('Card not found');
        Object.assign(card, {
            name_en: (_a = body.name_en) !== null && _a !== void 0 ? _a : card.name_en,
            name_zh: (_b = body.name_zh) !== null && _b !== void 0 ? _b : card.name_zh,
            image_url: (_c = body.image_url) !== null && _c !== void 0 ? _c : card.image_url,
            default_meaning_en: (_d = body.default_meaning_en) !== null && _d !== void 0 ? _d : card.default_meaning_en,
            default_meaning_zh: (_e = body.default_meaning_zh) !== null && _e !== void 0 ? _e : card.default_meaning_zh,
            enabled: (_f = body.enabled) !== null && _f !== void 0 ? _f : card.enabled,
        });
        return await this.cardRepo.save(card);
    }
    async deleteCard(id) {
        await this.cardRepo.delete({ id: Number(id) });
        return { ok: true };
    }
    async uploadCardImage(file) {
        if (!file)
            throw new common_1.BadRequestException('No file');
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowed.includes(file.mimetype)) {
            throw new common_1.BadRequestException('Unsupported file type');
        }
        if (file.size > 10 * 1024 * 1024) {
            throw new common_1.BadRequestException('File too large');
        }
        const uploadsDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(uploadsDir))
            fs.mkdirSync(uploadsDir, { recursive: true });
        const ext = path.extname(file.originalname) || '.bin';
        const filename = `${Date.now()}-${Math.random().toString(16).slice(2)}${ext}`;
        const filepath = path.join(uploadsDir, filename);
        await fs.promises.writeFile(filepath, file.buffer);
        const url = `/uploads/${filename}`;
        return { url };
    }
    async importCards(file) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!file)
            throw new common_1.BadRequestException('No file');
        const rows = [];
        await new Promise((resolve, reject) => {
            const stream = (0, parse_1.parse)({ headers: true })
                .on('error', reject)
                .on('data', (row) => rows.push(row))
                .on('end', () => resolve());
            stream.write(file.buffer);
            stream.end();
        });
        let created = 0;
        let updated = 0;
        for (const [idx, r] of rows.entries()) {
            const code = (r.code || '').trim();
            const name_en = (r.name_en || '').trim();
            const name_zh = ((_b = (_a = r.name_zh) === null || _a === void 0 ? void 0 : _a.trim) === null || _b === void 0 ? void 0 : _b.call(_a)) || null;
            if (!code || !name_en) {
                throw new common_1.BadRequestException(`Row ${idx + 2}: code and name_en are required`);
            }
            if (!/^[a-zA-Z0-9_-]+$/.test(code))
                throw new common_1.BadRequestException(`Row ${idx + 2}: invalid code`);
            const payload = {
                code,
                name_en,
                name_zh,
                image_url: ((_d = (_c = r.image_url) === null || _c === void 0 ? void 0 : _c.trim) === null || _d === void 0 ? void 0 : _d.call(_c)) || null,
                default_meaning_en: ((_f = (_e = r.default_meaning_en) === null || _e === void 0 ? void 0 : _e.trim) === null || _f === void 0 ? void 0 : _f.call(_e)) || null,
                default_meaning_zh: ((_h = (_g = r.default_meaning_zh) === null || _g === void 0 ? void 0 : _g.trim) === null || _h === void 0 ? void 0 : _h.call(_g)) || null,
            };
            const existing = await this.cardRepo.findOne({ where: { code } });
            if (existing) {
                Object.assign(existing, Object.fromEntries(Object.entries(payload).filter(([, v]) => v)));
                await this.cardRepo.save(existing);
                updated++;
            }
            else {
                const entity = this.cardRepo.create({ ...payload, enabled: true });
                await this.cardRepo.save(entity);
                created++;
            }
        }
        return { created, updated };
    }
    async exportCards(res) {
        const data = await this.cardRepo.find({ order: { code: 'ASC' } });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="cards.csv"');
        const csvStream = (0, format_1.format)({ headers: true });
        csvStream.pipe(res);
        data.forEach((item) => {
            var _a, _b, _c, _d;
            csvStream.write({
                code: item.code,
                name_en: item.name_en,
                name_zh: (_a = item.name_zh) !== null && _a !== void 0 ? _a : '',
                image_url: (_b = item.image_url) !== null && _b !== void 0 ? _b : '',
                default_meaning_en: (_c = item.default_meaning_en) !== null && _c !== void 0 ? _c : '',
                default_meaning_zh: (_d = item.default_meaning_zh) !== null && _d !== void 0 ? _d : '',
            });
        });
        csvStream.end();
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('questions'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listQuestions", null);
__decorate([
    (0, common_1.Post)('questions'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateQuestionDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createQuestion", null);
__decorate([
    (0, common_1.Patch)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateQuestionDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateQuestion", null);
__decorate([
    (0, common_1.Delete)('questions/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteQuestion", null);
__decorate([
    (0, common_1.Get)('perfumes'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('keyword')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listPerfumes", null);
__decorate([
    (0, common_1.Post)('perfumes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createPerfume", null);
__decorate([
    (0, common_1.Patch)('perfumes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updatePerfume", null);
__decorate([
    (0, common_1.Delete)('perfumes/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deletePerfume", null);
__decorate([
    (0, common_1.Get)('cards'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('pageSize')),
    __param(2, (0, common_1.Query)('keyword')),
    __param(3, (0, common_1.Query)('onlyEnabled')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listCards", null);
__decorate([
    (0, common_1.Post)('cards'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [CreateCardDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "createCard", null);
__decorate([
    (0, common_1.Patch)('cards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, UpdateCardDto]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateCard", null);
__decorate([
    (0, common_1.Delete)('cards/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "deleteCard", null);
__decorate([
    (0, common_1.Post)('cards/upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "uploadCardImage", null);
__decorate([
    (0, common_1.Post)('cards/import'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "importCards", null);
__decorate([
    (0, common_1.Get)('cards/export'),
    __param(0, (0, common_2.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "exportCards", null);
exports.AdminController = AdminController = __decorate([
    (0, common_1.Controller)('api/admin'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, typeorm_1.InjectRepository)(question_entity_1.Question)),
    __param(1, (0, typeorm_1.InjectRepository)(card_entity_1.Card)),
    __param(2, (0, typeorm_1.InjectRepository)(perfume_entity_1.Perfume)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], AdminController);
