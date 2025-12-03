
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config({ path: __dirname + '/.env' });

console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PASSWORD type:', typeof process.env.DB_PASSWORD);
console.log('DB_PASSWORD length:', process.env.DB_PASSWORD?.length);


const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function syncNames() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const perfumeRepo = AppDataSource.getRepository(Perfume);
    const perfumes = await perfumeRepo.find();

    let updatedCount = 0;

    for (const p of perfumes) {
      let changed = false;

      if (!p.brand_name_en && p.brand_name) {
        p.brand_name_en = p.brand_name;
        changed = true;
      }

      if (!p.product_name_en && p.product_name) {
        p.product_name_en = p.product_name;
        changed = true;
      }

      if (changed) {
        await perfumeRepo.save(p);
        updatedCount++;
        console.log(`Updated ID ${p.id}: ${p.brand_name} - ${p.product_name}`);
      }
    }

    console.log(`\nSync complete. Updated ${updatedCount} perfumes.`);

  } catch (error) {
    console.error('Error syncing names:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

syncNames();
