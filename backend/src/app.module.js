"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const app_controller_1 = require("./app.controller");
const app_service_1 = require("./app.service");
const ormconfig_1 = __importDefault(require("../ormconfig"));
const interpretation_entity_1 = require("./entities/interpretation.entity");
const order_entity_1 = require("./entities/order.entity");
const question_entity_1 = require("./entities/question.entity");
const card_entity_1 = require("./entities/card.entity");
const perfume_entity_1 = require("./entities/perfume.entity");
const pay_module_1 = require("./pay/pay.module");
const auth_module_1 = require("./auth/auth.module");
const auth_controller_1 = require("./auth/auth.controller");
const interp_module_1 = require("./interp/interp.module");
const questionnaire_module_1 = require("./questionnaire/questionnaire.module");
const import_module_1 = require("./imports/import.module");
const admin_module_1 = require("./admin/admin.module");
const content_module_1 = require("./content/content.module");
const perfume_module_1 = require("./perfume/perfume.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            typeorm_1.TypeOrmModule.forRootAsync({
                useFactory: () => ({
                    ...ormconfig_1.default.options,
                    entities: [interpretation_entity_1.Interpretation, order_entity_1.Order, question_entity_1.Question, card_entity_1.Card, perfume_entity_1.Perfume],
                    migrations: [],
                }),
            }),
            pay_module_1.PayModule,
            auth_module_1.AuthModule,
            interp_module_1.InterpModule,
            questionnaire_module_1.QuestionnaireModule,
            import_module_1.ImportModule,
            admin_module_1.AdminModule,
            content_module_1.ContentModule,
            perfume_module_1.PerfumeModule,
        ],
        controllers: [app_controller_1.AppController, auth_controller_1.AuthController],
        providers: [app_service_1.AppService],
    })
], AppModule);
