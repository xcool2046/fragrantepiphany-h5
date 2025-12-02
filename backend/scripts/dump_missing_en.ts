
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from '../src/entities/perfume.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Perfume);
  
  const missing = await repo.createQueryBuilder('p')
    .where('p.description_en IS NULL OR p.description_en = \'\'')
    .orWhere('p.quote_en IS NULL OR p.quote_en = \'\'')
    .getMany();

  const fs = require('fs');
  fs.writeFileSync('missing_perfumes.json', JSON.stringify(missing.map(p => ({
    id: p.id,
    brand: p.brand_name,
    product: p.product_name,
    desc: p.description,
    quote: p.quote,
    notes_top: p.notes_top,
    notes_heart: p.notes_heart,
    notes_base: p.notes_base,
    scene: p.scene_choice
  })), null, 2));
  console.log('Dumped to missing_perfumes.json');

  await AppDataSource.destroy();
}

run();
