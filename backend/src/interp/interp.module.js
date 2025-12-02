"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterpModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const interpretation_entity_1 = require("../entities/interpretation.entity");
const card_entity_1 = require("../entities/card.entity");
const interp_service_1 = require("./interp.service");
const interp_controller_1 = require("./interp.controller");
const draw_service_1 = require("./draw.service");
const pay_module_1 = require("../pay/pay.module");
let InterpModule = class InterpModule {
};
exports.InterpModule = InterpModule;
exports.InterpModule = InterpModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([interpretation_entity_1.Interpretation, card_entity_1.Card]), pay_module_1.PayModule],
        providers: [interp_service_1.InterpretationService, draw_service_1.DrawService],
        controllers: [interp_controller_1.InterpretationController],
        exports: [interp_service_1.InterpretationService],
    })
], InterpModule);
