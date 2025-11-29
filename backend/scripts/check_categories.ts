
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'tarot',
  password: 'tarot',
  database: 'tarot',
  entities: [Interpretation],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const repo = AppDataSource.getRepository(Interpretation);
    
    // Get distinct categories
    const categories = await repo
      .createQueryBuilder('interp')
      .select('DISTINCT interp.category', 'category')
      .getRawMany();

    console.log('Found Categories:', categories.map(c => c.category));
    
    // Count per category
    for (const cat of categories) {
        const count = await repo.count({ where: { category: cat.category } });
        console.log(`Category "${cat.category}": ${count} records`);
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

run();
