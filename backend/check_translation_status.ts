
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

async function checkStatus() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);

    const total = await perfumeRepo.count();
    const missingEn = await perfumeRepo.createQueryBuilder('perfume')
      .where('perfume.description_en IS NULL')
      .orWhere("perfume.description_en = ''")
      .getMany();

    console.log(`Total Perfumes: ${total}`);
    console.log(`Missing English Descriptions: ${missingEn.length}`);

    if (missingEn.length > 0) {
      console.log('\n--- Missing Translations List ---');
      // Group by product name to see how many unique perfumes are missing data
      const missingMap = new Map<string, number>();
      missingEn.forEach(p => {
        const current = missingMap.get(p.product_name) || 0;
        missingMap.set(p.product_name, current + 1);
      });

      /*
      missingMap.forEach((count, name) => {
        console.log(`- ${name}: ${count} records missing`);
      });
      */
      console.log(`\nTotal unique products missing data: ${missingMap.size}`);
      
      console.log('\n--- First 10 Missing IDs ---');
      missingEn.slice(0, 10).forEach(p => {
          console.log(`ID: ${p.id}, Name: ${p.product_name}, Card: ${p.card_name}`);
      });
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

checkStatus();
