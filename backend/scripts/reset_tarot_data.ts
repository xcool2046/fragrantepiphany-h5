import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🗑️  Truncating tarot_interpretations table...');
  try {
    // RESTART IDENTITY resets the auto-increment ID to 1
    await dataSource.query('TRUNCATE TABLE tarot_interpretations RESTART IDENTITY CASCADE');
    console.log('✅ Table truncated successfully.');
  } catch (error) {
    console.error('❌ Error truncating table:', error);
  }

  await app.close();
}
bootstrap();
