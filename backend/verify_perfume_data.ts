
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'tarot',
  password: 'tarot',
  database: 'tarot',
  entities: [Perfume],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Perfume);
    
    const count = await repo.count();
    console.log(`Total Perfumes: ${count}`);

    const sample = await repo.findOne({ where: { brand_name: 'Gucci' } });
    if (sample) {
      console.log('Sample Perfume:', JSON.stringify(sample, null, 2));
    } else {
      console.log('Sample Perfume (Gucci) not found.');
    }

    // Check for A, B, C, D distribution
    const countA = await repo.count({ where: { scene_choice: 'A. 玫瑰园' } });
    const countB = await repo.count({ where: { scene_choice: 'B. 暖木' } });
    const countC = await repo.count({ where: { scene_choice: 'C. 咖啡馆' } });
    const countD = await repo.count({ where: { scene_choice: 'D. 白皂' } });
    console.log(`Counts: A=${countA}, B=${countB}, C=${countC}, D=${countD}`);

    await AppDataSource.destroy();
  } catch (error) {
    console.error(error);
  }
}

run();
