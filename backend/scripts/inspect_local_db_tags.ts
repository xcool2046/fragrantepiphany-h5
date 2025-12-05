
import { DataSource } from 'typeorm';
import { Perfume } from '../src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL || 'postgres://tarot:tarot@localhost:5432/tarot',
  entities: [Perfume],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    // Fetch a few perfumes to check their tags
    const perfumes = await perfumeRepo.find({ take: 3 });
    
    if (perfumes.length === 0) {
        console.log('No perfumes found in DB.');
    } else {
        console.log('First 3 perfumes in DB:');
        perfumes.forEach(p => {
            console.log(`ID: ${p.id}, Name: ${p.product_name}`);
            console.log(`  Tags (JSON):`, JSON.stringify(p.tags));
        });
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
