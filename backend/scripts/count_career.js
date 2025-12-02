"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const dotenv_1 = require("dotenv");
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
        const res = await AppDataSource.query("SELECT COUNT(*) as count FROM tarot_interpretations WHERE category = 'Career'");
        console.log('Career Records Count:', res[0].count);
        // Also check distinct cards
        const distinct = await AppDataSource.query("SELECT COUNT(DISTINCT card_name) as count FROM tarot_interpretations WHERE category = 'Career'");
        console.log('Distinct Cards Count:', distinct[0].count);
        await AppDataSource.destroy();
    }
    catch (err) {
        console.error(err);
    }
}
bootstrap();
