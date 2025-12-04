
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

async function checkMissingData() {
  await AppDataSource.initialize();
  const perfumeRepo = AppDataSource.getRepository(Perfume);

  // 1. Total Perfumes
  const total = await perfumeRepo.count();
  console.log(`Total Perfumes in DB: ${total}`);

  // 2. Perfumes with tags but NO tags_en
  // Note: We use raw query because TypeORM might not map tags_en if entity is old (though it should be fine now)
  const missingTagsEn = await perfumeRepo.query(`
    SELECT count(*) as count FROM perfumes 
    WHERE tags IS NOT NULL AND jsonb_array_length(tags) > 0 
    AND (tags_en IS NULL OR jsonb_array_length(tags_en) = 0)
  `);
  console.log(`Perfumes with ZH tags but MISSING EN tags: ${missingTagsEn[0].count}`);

  // 3. Check for the 6 specific missing perfumes from Excel
  const missingNames = [
    { brand: 'Jo Malone London', name: 'Red Roses' },
    { brand: 'CdG', name: 'Wonderwood' },
    { brand: 'Xerjoff', name: 'Italica' },
    { brand: 'Montale', name: 'Chocolate Greedy' },
    { brand: 'Tom Ford', name: 'Tobacco Vanille' },
    { brand: 'Jovan', name: 'White Musk' }
  ];

  console.log('\nChecking specific missing perfumes:');
  for (const item of missingNames) {
    const found = await perfumeRepo.createQueryBuilder('p')
      .where('LOWER(p.brand_name) LIKE LOWER(:brand)', { brand: `%${item.brand}%` })
      .andWhere('LOWER(p.product_name) LIKE LOWER(:name)', { name: `%${item.name}%` })
      .getOne();
    
    if (found) {
      console.log(`[FOUND] ${item.brand} - ${item.name} (ID: ${found.id}, Name: ${found.brand_name} - ${found.product_name})`);
    } else {
      console.log(`[MISSING] ${item.brand} - ${item.name}`);
    }
  }

  await AppDataSource.destroy();
}

checkMissingData().catch(console.error);
