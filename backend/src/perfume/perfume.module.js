"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PerfumeModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const perfume_entity_1 = require("../entities/perfume.entity");
const card_entity_1 = require("../entities/card.entity");
const perfume_service_1 = require("./perfume.service");
const perfume_controller_1 = require("./perfume.controller");
const interp_module_1 = require("../interp/interp.module");
let PerfumeModule = class PerfumeModule {
};
exports.PerfumeModule = PerfumeModule;
exports.PerfumeModule = PerfumeModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([perfume_entity_1.Perfume, card_entity_1.Card]), interp_module_1.InterpModule],
        controllers: [perfume_controller_1.PerfumeController],
        providers: [perfume_service_1.PerfumeService],
    })
], PerfumeModule);
