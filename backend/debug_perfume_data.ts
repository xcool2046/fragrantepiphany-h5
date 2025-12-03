
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { Perfume } from './src/entities/perfume.entity';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const repo = dataSource.getRepository(Perfume);

  const targetCardId = 77;
  const perfumes = await repo.find({ where: { card_id: targetCardId } });

  console.log(`Found ${perfumes.length} perfumes for Card ID ${targetCardId}:`);
  perfumes.forEach(p => {
    console.log(`- ID: ${p.id}, Scene: ${p.scene_choice}, Brand: ${p.brand_name}, Product: ${p.product_name}`);
  });

  await app.close();
}

bootstrap();
