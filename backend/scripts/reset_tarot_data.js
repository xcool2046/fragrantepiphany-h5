"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("../src/app.module");
const typeorm_1 = require("typeorm");
async function bootstrap() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const dataSource = app.get(typeorm_1.DataSource);
    console.log('🗑️  Truncating tarot_interpretations table...');
    try {
        // RESTART IDENTITY resets the auto-increment ID to 1
        await dataSource.query('TRUNCATE TABLE tarot_interpretations RESTART IDENTITY CASCADE');
        console.log('✅ Table truncated successfully.');
    }
    catch (error) {
        console.error('❌ Error truncating table:', error);
    }
    await app.close();
}
bootstrap();
