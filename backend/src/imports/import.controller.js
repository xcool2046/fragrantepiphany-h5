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
exports.ImportController = void 0;
const common_1 = require("@nestjs/common");
const passport_1 = require("@nestjs/passport");
const platform_express_1 = require("@nestjs/platform-express");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const interpretation_entity_1 = require("../entities/interpretation.entity");
const parse_1 = require("@fast-csv/parse");
const format_1 = require("@fast-csv/format");
let ImportController = class ImportController {
    constructor(repo) {
        this.repo = repo;
    }
    async uploadCsv(file) {
        if (!file)
            return { error: 'No file' };
        const rows = [];
        await new Promise((resolve, reject) => {
            (0, parse_1.parse)({ headers: true })
                .on('error', reject)
                .on('data', (row) => rows.push(row))
                .on('end', () => resolve())
                .write(file.buffer);
        });
        const entities = rows.map((r) => {
            const lang = (r.language || 'en').toLowerCase();
            const obj = {
                card_name: r.card_name,
                category: r.category,
                position: r.position,
            };
            const suffix = lang === 'zh' ? '_zh' : '_en';
            obj[`summary${suffix}`] = r.summary;
            obj[`interpretation${suffix}`] = r.interpretation;
            obj[`action${suffix}`] = r.action;
            obj[`future${suffix}`] = r.future;
            obj[`recommendation${suffix}`] = r.recommendation
                ? JSON.parse(r.recommendation)
                : null;
            return obj;
        });
        await this.repo.upsert(this.repo.create(entities), [
            'card_name',
            'category',
            'position',
        ]);
        return { count: entities.length };
    }
    async exportCsv(res) {
        const data = await this.repo.find();
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="interpretations.csv"');
        const csvStream = (0, format_1.format)({ headers: true });
        csvStream.pipe(res);
        data.forEach((item) => {
            csvStream.write({
                card_name: item.card_name,
                category: item.category,
                position: item.position,
                summary_en: item.summary_en || '',
                summary_zh: item.summary_zh || '',
                interpretation_en: item.interpretation_en || '',
                interpretation_zh: item.interpretation_zh || '',
                action_en: item.action_en || '',
                action_zh: item.action_zh || '',
                future_en: item.future_en || '',
                future_zh: item.future_zh || '',
                recommendation_en: item.recommendation_en
                    ? JSON.stringify(item.recommendation_en)
                    : '',
                recommendation_zh: item.recommendation_zh
                    ? JSON.stringify(item.recommendation_zh)
                    : '',
            });
        });
        csvStream.end();
    }
};
exports.ImportController = ImportController;
__decorate([
    (0, common_1.Post)('csv'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file')),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "uploadCsv", null);
__decorate([
    (0, common_1.Get)('csv'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImportController.prototype, "exportCsv", null);
exports.ImportController = ImportController = __decorate([
    (0, common_1.Controller)('api/import'),
    (0, common_1.UseGuards)((0, passport_1.AuthGuard)('jwt')),
    __param(0, (0, typeorm_1.InjectRepository)(interpretation_entity_1.Interpretation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ImportController);
