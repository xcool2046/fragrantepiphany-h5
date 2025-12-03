
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume, Card],
  synchronize: false,
  logging: false,
});

async function verify() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);

    // 1. Count total
    const count = await perfumeRepo.count();
    console.log(`Total perfumes in DB: ${count}`);

    // 2. List first 5
    const firstFive = await perfumeRepo.find({ take: 5 });
    console.log('First 5 perfumes:', firstFive.map(p => `${p.id}: ${p.product_name}`));

    // 3. Check Card ID 78
    console.log('\nChecking Card ID 78:');
    const card78Perfumes = await perfumeRepo.find({ where: { card_id: 78 } });
    card78Perfumes.forEach(p => {
        console.log(`ID: ${p.id}, Name: "${p.product_name}", Card: ${p.card_name}`);
    });

    // 4. Verify updated IDs
    console.log('\nVerifying updated IDs:');
    const updatedPerfumes = await perfumeRepo.find({
      where: [
        { id: 175 },
        { id: 291 },
        { id: 299 },
        { id: 459 }
      ]
    });
    
    updatedPerfumes.forEach(p => {
        console.log(`ID: ${p.id}, Name: "${p.product_name}", Card: "${p.card_name}"`);
        console.log(`Desc EN: "${p.description_en}"`);
        console.log('---');
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

verify();
