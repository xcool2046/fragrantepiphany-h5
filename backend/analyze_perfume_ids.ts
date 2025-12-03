import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from './src/entities/perfume.entity';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
  logging: false,
});

async function analyzeIds() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Perfume);
    
    const count = await repo.count();
    const minMax = await repo.createQueryBuilder('perfume')
      .select('MIN(perfume.id)', 'min')
      .addSelect('MAX(perfume.id)', 'max')
      .getRawOne();

    console.log(`Total Count: ${count}`);
    console.log(`Min ID: ${minMax.min}`);
    console.log(`Max ID: ${minMax.max}`);

    const allIds = await repo.find({ select: ['id'], order: { id: 'ASC' } });
    const ids = allIds.map(p => p.id);

    console.log('Checking for gaps...');
    let gaps = 0;
    for (let i = 0; i < ids.length - 1; i++) {
        if (ids[i+1] !== ids[i] + 1) {
            // console.log(`Gap between ${ids[i]} and ${ids[i+1]}`);
            gaps++;
        }
    }
    console.log(`Total non-contiguous jumps: ${gaps}`);

  } catch (error) {
    console.error(error);
  } finally {
    await AppDataSource.destroy();
  }
}

analyzeIds();
