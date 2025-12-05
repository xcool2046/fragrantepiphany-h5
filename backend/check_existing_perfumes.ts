
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function checkExisting() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Perfume);
    const perfumes = await repo.find({ 
        select: ['id', 'brand_name', 'product_name'],
        order: { id: 'ASC' } 
    });

    console.log('--- Current Perfumes ---');
    perfumes.forEach(p => {
        console.log(`[${p.id}] ${p.brand_name} - ${p.product_name}`);
    });
    console.log(`Total: ${perfumes.length}`);

  } catch (error) {
    console.error(error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkExisting();
