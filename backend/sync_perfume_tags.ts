
import * as XLSX from 'xlsx';
import * as path from 'path';
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

async function syncTags() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const perfumeRepo = AppDataSource.getRepository(Perfume);
  const excelPath = path.resolve('/home/projects/h5/master.xlsx');

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows in Excel.`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const row of data as any[]) {
      const brand = row['Brand']?.trim();
      const name = row['Name']?.trim();
      
      if (!brand || !name) continue;

      const tag1 = row['Tag1']?.trim();
      const tag2 = row['Tag2']?.trim();
      const tag3 = row['Tag3']?.trim();

      const tags = [tag1, tag2, tag3].filter(t => t && t.length > 0);

      if (tags.length === 0) continue;

      // Find perfume by Brand and Name (case-insensitive)
      const perfume = await perfumeRepo.createQueryBuilder('perfume')
        .where('LOWER(perfume.brand_name) = LOWER(:brand)', { brand })
        .andWhere('LOWER(perfume.product_name) = LOWER(:name)', { name })
        .getOne();

      if (perfume) {
        perfume.tags = tags;
        await perfumeRepo.save(perfume);
        updatedCount++;
        // console.log(`Updated tags for ${brand} - ${name}: ${tags.join(', ')}`);
      } else {
        console.warn(`Perfume not found in DB: ${brand} - ${name}`);
        notFoundCount++;
      }
    }

    console.log('------------------------------------------------');
    console.log(`Sync Complete.`);
    console.log(`Updated: ${updatedCount}`);
    console.log(`Not Found: ${notFoundCount}`);

  } catch (error) {
    console.error('Error syncing tags:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

syncTags().catch(console.error);
