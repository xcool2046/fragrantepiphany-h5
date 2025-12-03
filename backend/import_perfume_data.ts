
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'tarot',
  password: 'tarot',
  database: 'tarot',
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

    // 2. Clear table
    console.log('Clearing perfumes table...');
    await perfumeRepo.clear();

    // 3. Load Translations
    const transPath = path.join(__dirname, 'perfume_translations_final.json');
    const translations: { zh: string; en: string }[] = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
    const transMap = new Map<string, string>();
    translations.forEach(t => transMap.set(t.zh.trim(), t.en));

    // 4. Load Excel
    const excelPath = '/home/projects/h5/master (1).xlsx';
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
    // Use header: 1 to get array of arrays to handle duplicate headers or complex structure
    // Actually, sheet_to_json is fine if headers are unique. 
    // The headers are likely: Card, Q1A, 文案, Q1B, 文案, ...
    // Wait, duplicate '文案' headers might be an issue.
    // Let's inspect headers first or use array of arrays.
    // Inspecting previously: headers were Card, Q1A, Q1B, Q1C, Q1D. 
    // But where is '文案'?
    // Let's look at `inspect_excel.ts` output from previous session context.
    // It said: "Headers: [ 'Card', 'Q1A', '文案', 'Q1B', '文案', 'Q1C', '文案', 'Q1D', '文案' ]"
    // Yes, duplicate headers. XLSX handles this by appending _1, _2 usually.
    // Let's verify by reading as array of arrays (header: 1) and processing manually.
    
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

        const descEn = transMap.get(descZh?.trim()) || '';
        if (!descEn && descZh) {
            // console.warn(`Translation not found for: ${descZh.substring(0, 20)}...`);
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
  }
}

run();
