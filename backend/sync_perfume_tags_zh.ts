
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

const TAG_TRANSLATIONS: Record<string, string> = {
  'Androgynous & Unisex': '中性',
  'Aquatic Breeze': '水生气息',
  'Aromatic Spices': '芳香辛料',
  'Blooming Rose': '盛放玫瑰',
  'Citrus Zest': '柑橘',
  'Clean & Soapy': '皂感洁净',
  'Coconut & Creamy': '椰香奶感',
  'Cool & Crisp': '清冷',
  'Dark Spices': '深邃辛香',
  'Deep Woods': '深邃木质',
  'Earthy Roots': '泥土根茎',
  'Ethereal & Airy': '空灵飘渺',
  'Fresh & Laundry': '清新洗护',
  'Gourmand Sweet': '美食调甜美',
  'Green Escape': '绿意',
  'Herbal Garden': '草本花园',
  'Juicy Fruit': '多汁果香',
  'Leather & Suede': '皮革麂皮',
  'Luxurious & Opulent': '奢华丰盈',
  'Mineral & Crisp': '矿物清冽',
  'Minimalist & Modern': '极简现代',
  'Musk & Skin': '麝香肌肤',
  'Powdery Veil': '脂粉面纱',
  'Resinous Amber': '树脂琥珀',
  'Smoky Embers': '烟熏余烬',
  'Soft Floral': '柔和花香',
  'Sunny & Vacation': '阳光度假',
  'Tart Berries': '酸甜浆果',
  'Vintage & Classic': '复古经典',
  'Warm & Cozy': '温暖舒适',
  'White Floral': '白花',
};

async function syncTags() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const perfumeRepo = AppDataSource.getRepository(Perfume);
  const excelPath = path.resolve('/home/projects/h5/master (1).xlsx');

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

      const chineseTags = englishTags.map(tag => TAG_TRANSLATIONS[tag] || tag);

      // Find perfume by Brand and Name (case-insensitive)
      const perfumes = await perfumeRepo.createQueryBuilder('perfume')
        .where('LOWER(perfume.brand_name) = LOWER(:brand)', { brand })
        .andWhere('LOWER(perfume.product_name) = LOWER(:name)', { name })
        .getMany();

      if (perfumes.length > 0) {
        for (const perfume of perfumes) {
            if (name === 'Castile') {
                console.log(`DEBUG: Found Castile (ID: ${perfume.id}). Original Tags: ${JSON.stringify(englishTags)}`);
            }
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
