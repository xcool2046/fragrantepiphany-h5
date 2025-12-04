
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function checkFuzzyMatches() {
  await AppDataSource.initialize();
  const perfumeRepo = AppDataSource.getRepository(Perfume);

  const keywords = ['Jo Malone', 'Comme', 'CdG', 'Ford', 'Montale', 'Xerjoff', 'Jovan', 'Musk', 'Roses', 'Wonderwood', 'Italica', 'Chocolate', 'Tobacco'];

  console.log('Checking for fuzzy matches in DB...');
  
  for (const kw of keywords) {
    const matches = await perfumeRepo.createQueryBuilder('p')
      .where('p.brand_name ILIKE :kw OR p.product_name ILIKE :kw', { kw: `%${kw}%` })
      .select(['p.id', 'p.brand_name', 'p.product_name'])
      .getMany();
      
    if (matches.length > 0) {
      console.log(`\nMatches for "${kw}":`);
      matches.forEach(p => console.log(`  - [${p.id}] ${p.brand_name} - ${p.product_name}`));
    }
  }

  await AppDataSource.destroy();
}

checkFuzzyMatches().catch(console.error);
