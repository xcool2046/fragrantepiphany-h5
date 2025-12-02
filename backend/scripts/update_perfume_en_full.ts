
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from '../src/entities/perfume.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

const fs = require('fs');
const path = require('path');

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Perfume);
  
  const dataPath = path.join(__dirname, 'perfume_data_en.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
  }

  const updates = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`Found ${updates.length} updates.`);

  for (const item of updates) {
    if (!item.desc_en) continue;
    
    await repo.update(item.id, {
      description_en: item.desc_en,
      quote_en: item.quote_en,
      notes_top_en: item.notes_en
    });
    console.log(`Updated ID ${item.id}: ${item.product}`);
  }

  console.log('All updates completed.');
  await AppDataSource.destroy();
}

run();
