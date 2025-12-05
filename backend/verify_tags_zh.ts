
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

async function verify() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Perfume);

  // Check Diptyque - L'Ombre dans L'Eau (ID 1 in Excel, but ID might differ in DB, so search by name)
  const perfume = await repo.findOne({
    where: { brand_name: 'Diptyque', product_name: "L'Ombre dans L'Eau" }
  });

  if (perfume) {
    console.log(`Perfume: ${perfume.brand_name} - ${perfume.product_name}`);
    console.log('Tags (Chinese):', JSON.stringify(perfume.tags));
    
    const expected = ["青绿植感", "酸甜莓果", "玫瑰盛放"];
    const actual = perfume.tags || [];
    
    // Check if all expected tags are present
    const allMatch = expected.every(t => actual.includes(t));
    
    if (allMatch && actual.length === expected.length) {
      console.log('PASS: Tags match expected values.');
    } else {
      console.error(`FAIL: Tags do NOT match. Expected: ${JSON.stringify(expected)}`);
    }
  } else {
    console.error('Perfume not found.');
  }

  await AppDataSource.destroy();
}

verify().catch(console.error);
