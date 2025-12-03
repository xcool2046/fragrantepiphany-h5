"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImportModule = void 0;
const common_1 = require("@nestjs/common");
const import_controller_1 = require("./import.controller");
const typeorm_1 = require("@nestjs/typeorm");
const interpretation_entity_1 = require("../entities/interpretation.entity");
const platform_express_1 = require("@nestjs/platform-express");
let ImportModule = class ImportModule {
};
exports.ImportModule = ImportModule;
exports.ImportModule = ImportModule = __decorate([
    (0, common_1.Module)({
        imports: [
            platform_express_1.MulterModule.register({ limits: { fileSize: 10 * 1024 * 1024 } }),
            typeorm_1.TypeOrmModule.forFeature([interpretation_entity_1.Interpretation]),
        ],
        controllers: [import_controller_1.ImportController],
    })
], ImportModule);
