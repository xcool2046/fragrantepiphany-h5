
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function checkCastile() {
  await AppDataSource.initialize();
  const perfumeRepo = AppDataSource.getRepository(Perfume);
  
  const rawData = await perfumeRepo.query(`SELECT id, tags, tags_en, updated_at FROM perfumes WHERE brand_name = 'Penhaligon''s' AND product_name = 'Castile'`);
  
  console.log(`Found ${rawData.length} matches (Raw SQL).`);
  rawData.forEach((p: any, i: number) => {
    console.log(`Match ${i+1}: ID=${p.id}, Tags=${JSON.stringify(p.tags)}, TagsEN=${JSON.stringify(p.tags_en)}, UpdatedAt=${p.updated_at}`);
  });
  
  await AppDataSource.destroy();
}

checkCastile().catch(console.error);
