
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

async function checkPerfume() {
  try {
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    // Check for Oud Satin Mood with Card ID 78
    const perfumes = await perfumeRepo.find({
      where: {
        card_id: 78
      }
    });

    console.log('Found perfumes for Card ID 78:', perfumes.length);
    perfumes.forEach(p => {
      console.log(`ID: ${p.id}`);
      console.log(`Product Name: ${p.product_name}`);
      console.log(`Description (ZH): ${p.description?.substring(0, 20)}...`);
      console.log(`Description (EN): ${p.description_en}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkPerfume();
