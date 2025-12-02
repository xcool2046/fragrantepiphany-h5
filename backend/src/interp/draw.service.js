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
exports.DrawService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const interpretation_entity_1 = require("../entities/interpretation.entity");
let DrawService = class DrawService {
    constructor(repo) {
        this.repo = repo;
    }
    async draw(category, language = 'en') {
        const qb = this.repo.createQueryBuilder('i');
        if (category)
            qb.where('i.category = :category', { category });
        const past = await qb
            .clone()
            .andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Past' })
            .getMany();
        const now = await qb
            .clone()
            .andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Present' })
            .getMany();
        const future = await qb
            .clone()
            .andWhere('LOWER(i.position) = LOWER(:p)', { p: 'Future' })
            .getMany();
        if (past.length === 0 || now.length === 0 || future.length === 0) {
            return { past: null, now: null, future: null };
        }
        const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];
        return {
            past: pickOne(past),
            now: pickOne(now),
            future: pickOne(future),
        };
    }
};
exports.DrawService = DrawService;
exports.DrawService = DrawService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(interpretation_entity_1.Interpretation)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DrawService);
