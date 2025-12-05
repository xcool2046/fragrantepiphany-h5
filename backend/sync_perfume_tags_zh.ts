
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
  const excelPath = path.resolve('/home/projects/h5/master (3).xlsx');

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets['Perfume master'];
    // Use raw: false to ensure we get strings, but sheet_to_json usually handles it.
    const data = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${data.length} rows in Excel.`);

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const row of data as any[]) {
      const brand = row['Brand']?.trim();
      const name = row['Name']?.trim();
      
      if (!brand || !name) continue;

      // Read explicit Chinese tags
      const tag1 = row['Tag1(中)']?.trim();
      const tag2 = row['Tag2(中)']?.trim();
      const tag3 = row['Tag3(中)']?.trim();

      const chineseTags = [tag1, tag2, tag3].filter(t => t && t.length > 0);

      if (chineseTags.length === 0) continue;

      // Find perfume by Brand and Name (case-insensitive)
      const perfumes = await perfumeRepo.createQueryBuilder('perfume')
        .where('LOWER(perfume.brand_name) = LOWER(:brand)', { brand })
        .andWhere('LOWER(perfume.product_name) = LOWER(:name)', { name })
        .getMany();

      if (perfumes.length > 0) {
        for (const perfume of perfumes) {
            perfume.tags = chineseTags;
            await perfumeRepo.save(perfume);
            updatedCount++;
        }
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
