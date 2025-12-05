
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Use environment variables for connection, falling back to defaults if needed (though env is preferred)
// In production, DATABASE_URL is usually provided.
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // If DATABASE_URL is not set, fall back to individual params (useful for local dev without full url)
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_DATABASE || 'tarot',
  entities: [Perfume, Card],
  synchronize: false, // We will do manual schema updates
});

const SCENT_MAPPING: Record<string, string> = {
  'A': 'A. 玫瑰园',
  'B': 'B. 暖木',
  'C': 'C. 咖啡馆',
  'D': 'D. 白皂',
};

const SCENT_MAPPING_EN: Record<string, string> = {
  'A': 'A. Rose Garden',
  'B': 'B. Warm Wood',
  'C': 'C. Cafe',
  'D': 'D. White Soap',
};

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);
    const cardRepo = AppDataSource.getRepository(Card);

    const metadata = AppDataSource.getMetadata(Perfume);
    console.log('TypeORM Columns:', metadata.columns.map(c => c.propertyName));

    // 1. Drop columns if they exist
    console.log('Dropping deprecated columns...');
    await AppDataSource.query(`
      ALTER TABLE perfumes 
      DROP COLUMN IF EXISTS notes_top,
      DROP COLUMN IF EXISTS notes_heart,
      DROP COLUMN IF EXISTS notes_base,
      DROP COLUMN IF EXISTS notes_top_en,
      DROP COLUMN IF EXISTS notes_heart_en,
      DROP COLUMN IF EXISTS notes_base_en;
    `);

    // 1.1 Ensure required columns exist (TypeORM entity has them, so DB must have them)
    console.log('Ensuring columns exist...');
    await AppDataSource.query(`
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS tags_en jsonb;
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS quote text;
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS quote_en text;
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS scene_choice_en varchar(255);
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS product_name_en varchar(255);
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS brand_name_en varchar(255);
      ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS description_en text;
    `);

    // 2. Clear table
    console.log('Clearing perfumes table...');
    await perfumeRepo.clear();

    // 3. Load Translations
    // In production (docker), assets are copied to ./assets relative to the working directory (/app)
    // The deploy script copies excel_files into assets, so the path is assets/excel_files/...
    const assetsDir = path.join(process.cwd(), 'assets');
    // Check both locations just in case
    let transPath = path.join(assetsDir, 'perfume_translations_final.json');
    if (!fs.existsSync(transPath)) {
        transPath = path.join(assetsDir, 'excel_files', 'perfume_translations_final.json');
    }
    
    if (!fs.existsSync(transPath)) {
        throw new Error(`Translation file not found at: ${transPath}`);
    }

    // The reconstructed file has format: { id: number, description_en: string, quote_en: string }[]
    const translations: { id: number; description_en: string }[] = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
    const transMap = new Map<number, string>();
    translations.forEach(t => {
        if (t.id && t.description_en) {
            transMap.set(t.id, t.description_en);
        }
    });

    // 4. Load Excel
    let excelPath = path.join(assetsDir, 'perfume_master.xlsx');
    if (!fs.existsSync(excelPath)) {
        excelPath = path.join(assetsDir, 'excel_files', 'perfume_master.xlsx');
    }

    if (!fs.existsSync(excelPath)) {
        throw new Error(`Excel file not found at: ${excelPath}`);
    }

    const workbook = XLSX.readFile(excelPath);
    
    // Load Perfume Master
    const masterSheet = workbook.Sheets['Perfume master'];
    const masterData = XLSX.utils.sheet_to_json<any>(masterSheet);
    const masterMap = new Map<number, any>();
    
    masterData.forEach(row => {
      if (row['UNIQUE ID']) {
        masterMap.set(row['UNIQUE ID'], {
          brand: row['Brand'],
          name: row['Name'],
          tags: [row['Tag1'], row['Tag2'], row['Tag3']].filter(t => t && t.trim() !== ''),
        });
      }
    });

    // Load Mapping
    const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
    
    const mappingData = XLSX.utils.sheet_to_json<any[]>(mappingSheet, { header: 1 });
    const headers = mappingData[0];
    console.log('Actual Headers:', headers);
    if (mappingData.length > 1) {
        console.log('First Data Row:', mappingData[1]);
    }
    
    // Fixed indices based on inspection
    const idxCard = 0;
    
    // Option A
    const idxIdA = 1;
    const idxDescA = 3;
    
    // Option B
    const idxIdB = 4;
    const idxDescB = 6;
    
    // Option C
    const idxIdC = 7;
    const idxDescC = 9;
    
    // Option D
    const idxIdD = 10;
    const idxDescD = 12;

    console.log(`Using fixed indices: Card=${idxCard}, A=[${idxIdA},${idxDescA}], B=[${idxIdB},${idxDescB}], C=[${idxIdC},${idxDescC}], D=[${idxIdD},${idxDescD}]`);

    let count = 0;
    // Skip header row
    for (let i = 1; i < mappingData.length; i++) {
      const row = mappingData[i];
      const cardNameZh = row[idxCard];
      if (!cardNameZh) continue;

      // Find Card
      const card = await cardRepo.findOne({ where: { name_zh: cardNameZh } });
      if (!card) {
        console.warn(`Card not found: ${cardNameZh}`);
        continue;
      }

      const processOption = async (optionKey: string, idIdx: number, descIdx: number) => {
        const uniqueId = row[idIdx];
        const descZh = row[descIdx];

        if (!uniqueId) return;

        const master = masterMap.get(uniqueId);
        if (!master) {
          console.warn(`Perfume Master not found for ID: ${uniqueId} (Card: ${cardNameZh}, Option: ${optionKey})`);
          return;
        }

        // Lookup translation by ID
        const descEn = transMap.get(uniqueId) || '';
        if (!descEn && descZh) {
            // console.warn(`Translation not found for ID: ${uniqueId}`);
        }

        const perfume = new Perfume();
        perfume.card_id = card.id;
        perfume.card_name = card.name_en; 
        perfume.scene_choice = SCENT_MAPPING[optionKey];
        perfume.scene_choice_en = SCENT_MAPPING_EN[optionKey];
        perfume.brand_name = master.brand;
        perfume.product_name = master.name;
        perfume.tags = master.tags;
        perfume.description = descZh;
        perfume.description_en = descEn;
        perfume.sort_order = optionKey.charCodeAt(0) - 65 + 1; 
        perfume.status = 'active';
        
        await perfumeRepo.save(perfume);
        count++;
      };

      await processOption('A', idxIdA, idxDescA);
      await processOption('B', idxIdB, idxDescB);
      await processOption('C', idxIdC, idxDescC);
      await processOption('D', idxIdD, idxDescD);
    }

    console.log(`Imported ${count} perfumes.`);
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
