
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
  
  // Check a few known IDs that were updated
  const idsToCheck = [10, 50, 100]; 
  const perfumes = await repo.findByIds(idsToCheck);

  console.log('--- Verification Results ---');
  for (const p of perfumes) {
    console.log(`ID: ${p.id}`);
    console.log(`Product: ${p.product_name}`);
    console.log(`Desc EN: ${p.description_en}`);
    console.log(`Notes EN: ${p.notes_top_en}`);
    console.log('---------------------------');
  }
  
  const count = await repo.createQueryBuilder('p')
    .where('p.description_en IS NOT NULL')
    .andWhere("p.description_en != ''")
    .getCount();
    
  console.log(`Total records with English description: ${count}`);

  await AppDataSource.destroy();
}

run();
