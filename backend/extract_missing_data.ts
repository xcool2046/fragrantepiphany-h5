
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from './src/entities/perfume.entity';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
  logging: false,
});

async function extractData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);

    const missingEn = await perfumeRepo.createQueryBuilder('perfume')
      .where('perfume.description_en IS NULL')
      .orWhere("perfume.description_en = ''")
      .orderBy('perfume.id', 'ASC')
      .getMany();

    console.log(`Found ${missingEn.length} records missing English data.`);

    const outputData = missingEn.map(p => ({
      id: p.id,
      product_name: p.product_name,
      card_name: p.card_name,
      description_zh: p.description,
      description_en: "",
      quote_en: ""
    }));

    const outputPath = path.join(__dirname, 'missing_perfume_data.json');
    fs.writeFileSync(outputPath, JSON.stringify(outputData, null, 2));
    console.log(`Data exported to ${outputPath}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

extractData();
