import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { InterpretationService } from './src/interp/interp.service';
import { Interpretation } from './src/entities/interpretation.entity';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get(DataSource).getRepository(Interpretation);
  const perfumeRepo = app.get(DataSource).getRepository(Perfume);

  const item = await repo.findOne({ where: {} });
  console.log('Interp JSON:', JSON.stringify(item, null, 2));

  const perfume = await perfumeRepo.findOne({ where: {} });
  console.log('Perfume JSON:', JSON.stringify(perfume, null, 2));

  await app.close();
}

bootstrap();
