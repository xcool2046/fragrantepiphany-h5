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
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
(0, dotenv_1.config)();
const AppDataSource = new typeorm_1.DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
    port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
    username: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'tarot'),
    password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || 'tarot'),
    database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'tarot'),
    entities: [],
    synchronize: false,
});
async function bootstrap() {
    try {
        await AppDataSource.initialize();
        console.log('Connected to database...');
        const jsonPath = path.join(__dirname, '../career_en_fixed.json');
        if (!fs.existsSync(jsonPath)) {
            console.error('JSON file not found:', jsonPath);
            process.exit(1);
        }
        const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
        console.log(`Loaded ${data.length} records from JSON.`);
        for (const item of data) {
            const cardName = item.card;
            const category = 'Career';
            // Update Past
            await AppDataSource.query(`UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Past'`, [item.past_en, item.sentence_en, cardName, category]);
            // Update Present
            await AppDataSource.query(`UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Present'`, [item.present_en, item.sentence_en, cardName, category]);
            // Update Future
            await AppDataSource.query(`UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Future'`, [item.future_en, item.sentence_en, cardName, category]);
        }
        console.log('Career English data updated successfully!');
        await AppDataSource.destroy();
    }
    catch (err) {
        console.error(err);
        process.exit(1);
    }
}
bootstrap();
