
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

async function syncTagsEn() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const perfumeRepo = AppDataSource.getRepository(Perfume);
  const excelPath = path.resolve('/home/projects/h5/master (2).xlsx');

  try {
    const workbook = XLSX.readFile(excelPath);
    const sheet = workbook.Sheets['Perfume master'];
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

      const englishTags = [tag1, tag2, tag3].filter(t => t && t.length > 0);

      if (englishTags.length === 0) continue;

      // Find perfume by Brand and Name (case-insensitive)
      const perfumes = await perfumeRepo.createQueryBuilder('perfume')
        .where('LOWER(perfume.brand_name) = LOWER(:brand)', { brand })
        .andWhere('LOWER(perfume.product_name) = LOWER(:name)', { name })
        .getMany();

      if (perfumes.length > 0) {
        for (const perfume of perfumes) {
            if (name === 'Castile') {
                console.log(`DEBUG: Updating Castile (ID: ${perfume.id}). Setting tags_en to: ${JSON.stringify(englishTags)}`);
            }
            await perfumeRepo.query(
                'UPDATE perfumes SET tags_en = $1 WHERE id = $2',
                [JSON.stringify(englishTags), perfume.id]
            );
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

syncTagsEn().catch(console.error);
