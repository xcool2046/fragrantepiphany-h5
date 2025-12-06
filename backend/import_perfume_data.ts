
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

    // Check if data exists
    const existingCount = await perfumeRepo.count();
    if (existingCount > 0 && process.env.FORCE_RESET !== 'true') {
        console.log(`Perfumes table has ${existingCount} records. Skipping import (FORCE_RESET not set).`);
        await AppDataSource.destroy();
        return;
    }

    // 1. Drop columns if they exist (Only if resetting)

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
    
    let translations: { id: number; description_en: string; quote_en?: string }[] = [];
    try {
        if (fs.existsSync(transPath)) {
            const transContent = fs.readFileSync(transPath, 'utf-8');
            translations = JSON.parse(transContent);
            console.log(`Loaded ${translations.length} translations.`);
        } else {
            console.warn(`Translation file not found at: ${transPath}. Skipping English descriptions.`);
        }
    } catch (err) {
        console.warn(`Failed to load translations from ${transPath}: ${err}. Skipping English descriptions.`);
    }

    const transMap = new Map<number, { desc: string; quote: string }>();
    translations.forEach(t => {
        if (t.id) {
            transMap.set(t.id, { desc: t.description_en || '', quote: t.quote_en || '' });
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
          tags: [row['Tag1(中)'], row['Tag2(中)'], row['Tag3(中)']].filter(t => t && t.trim() !== ''),
          tags_en: [row['Tag1'], row['Tag2'], row['Tag3']].filter(t => t && t.trim() !== ''),
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

    // Helper to normalize Traditional Chinese to Simplified Chinese matching DB
const normalizeCardName = (name: string): string => {
    let normalized = name.trim();
    
    // 1. Suits (Handle both single char and full suit names if necessary, though usually it's "Ace of Wands" -> "权杖一" logic in some systems, 
    // but here we map the Chinese text directly from Excel)
    normalized = normalized.replace(/權杖/g, '权杖');
    normalized = normalized.replace(/聖杯/g, '圣杯');
    normalized = normalized.replace(/寶劍/g, '宝剑');
    normalized = normalized.replace(/星幣/g, '星币');

    // 1.1 Court Ranks
    normalized = normalized.replace(/國王/g, '国王');
    normalized = normalized.replace(/騎士/g, '骑士');
    normalized = normalized.replace(/侍衛/g, '侍者'); // Map 侍衛 to 侍者 if present
    normalized = normalized.replace(/侍者/g, '侍者'); // Ensure 侍者 stays 侍者

    // 2. Major Arcana Mappings
    const map: Record<string, string> = {
        '魔術師': '魔术师',
        '女祭司': '女祭司', // Same
        '皇后': '皇后', // Same
        '皇帝': '皇帝', // Same
        '教皇': '教皇', // Same
        '戀人': '恋人',
        '戰車': '战车',
        '力量': '力量', // Same
        '隱者': '隐士', // Word change: 隱者 -> 隐士
        '命運之輪': '命运之轮',
        '正義': '正义',
        '吊人': '倒吊人', // Word change: 吊人 -> 倒吊人 (Common variation)
        '死神': '死神', // Same
        '節制': '节制',
        '惡魔': '恶魔',
        '塔': '高塔', // Word change: 塔 -> 高塔 (Common variation)
        '星星': '星星', // Same
        '月亮': '月亮', // Same
        '太陽': '太阳',
        '審判': '审判',
        '世界': '世界', // Same
        '愚者': '愚者', // Same
    };

    // Direct map check
    if (map[normalized]) {
        return map[normalized];
    }
    
    // Also check for "The Hanged Man" -> "倒吊人" if Excel has English? No, Excel has Chinese.
    // Handle "The Hanged Man" case specifically if it appears as "吊人" in Excel but "倒吊人" in DB.
    if (normalized === '吊人') return '倒吊人';
    if (normalized === '塔') return '高塔';

    return normalized;
};    

    let count = 0;
    // Skip header row
    for (let i = 1; i < mappingData.length; i++) {
      const row = mappingData[i];
      const cardNameZhRaw = row[idxCard];
      if (!cardNameZhRaw) continue;

      const cardNameZh = normalizeCardName(cardNameZhRaw);

      // Find Card
      const card = await cardRepo.findOne({ where: { name_zh: cardNameZh } });
      if (!card) {
        console.warn(`Card not found: ${cardNameZh} (Raw: ${cardNameZhRaw})`);
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
        const trans = transMap.get(uniqueId);
        const descEn = trans?.desc || '';
        const quoteEn = trans?.quote || '';
        
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
        
        // Populate English fields from Excel columns
        // Verified Mapping:
        // Name -> product_name_en
        // Brand -> brand_name_en
        // Tag1, Tag2, Tag3 -> tags_en
        perfume.product_name_en = master.name; 
        perfume.brand_name_en = master.brand; 
        perfume.tags_en = master.tags_en;

        // Description/Sentence EN still depends on translation file (currently missing/mismatched)
        perfume.description_en = descEn;
        perfume.sentence_en = quoteEn;

        if (uniqueId === 70) {
            console.log(`[DEBUG] Saving Perfume ID 70: BrandEN=${perfume.brand_name_en}, ProductEN=${perfume.product_name_en}, TagsEN=${perfume.tags_en}`);
        }

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
