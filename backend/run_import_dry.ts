
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config();

// Mock DataSource
const AppDataSource = {
    initialize: async () => {},
    getRepository: (entity: any) => ({
        clear: async () => {},
        findOne: async () => ({ id: 1, name_en: 'King of Pentacles', name_zh: '星币国王' }), // Mock Card
        save: async (obj: any) => {
            if (obj.product_name === 'Castile') {
                console.log('--- SAVING PERFUME (ID 70) ---');
                console.log('Brand (EN):', obj.brand_name_en);
                console.log('Product (EN):', obj.product_name_en);
                console.log('Tags (EN):', obj.tags_en);
                console.log('Desc (EN):', obj.description_en);
                console.log('Sentence (EN):', obj.sentence_en);
                console.log('Full Object:', JSON.stringify(obj, null, 2));
            }
        }
    }),
    getMetadata: () => ({ columns: [] }),
    query: async () => {},
    destroy: async () => {}
};

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
    console.log('Starting dry run...');
    
    // 3. Load Translations
    // Script is in backend/, assets are in ../assets/
    const assetsDir = path.join(process.cwd(), '../assets');
    let transPath = path.join(assetsDir, 'perfume_translations_final.json');
    if (!fs.existsSync(transPath)) {
        transPath = path.join(assetsDir, 'excel_files', 'perfume_translations_final.json');
    }
    
    console.log('Trans Path:', transPath);
    // Handle missing translation file gracefully for dry run
    let translations: any[] = [];
    if (fs.existsSync(transPath)) {
        translations = JSON.parse(fs.readFileSync(transPath, 'utf-8'));
    }
    
    const transMap = new Map<number, { desc: string; quote: string }>();
    translations.forEach((t: any) => {
        if (t.id) {
            transMap.set(t.id, { desc: t.description_en || '', quote: t.quote_en || '' });
        }
    });

    // 4. Load Excel
    let excelPath = path.join(assetsDir, 'perfume_master.xlsx');
    if (!fs.existsSync(excelPath)) {
        excelPath = path.join(assetsDir, 'excel_files', 'perfume_master.xlsx');
    }
    console.log('Excel Path:', excelPath);

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
    
    const idxCard = 0;
    const idxIdA = 1; const idxDescA = 3;
    const idxIdB = 4; const idxDescB = 6;
    const idxIdC = 7; const idxDescC = 9;
    const idxIdD = 10; const idxDescD = 12;

    // Skip header row
    for (let i = 1; i < mappingData.length; i++) {
      const row = mappingData[i];
      const cardNameZhRaw = row[idxCard];
      if (!cardNameZhRaw) continue;

      // Only process King of Pentacles for dry run
      if (!cardNameZhRaw.includes('星币国王') && !cardNameZhRaw.includes('星幣國王')) continue;

      const processOption = async (optionKey: string, idIdx: number, descIdx: number) => {
        const uniqueId = row[idIdx];
        const descZh = row[descIdx];

        if (!uniqueId) return;

        const master = masterMap.get(uniqueId);
        if (!master) {
          console.warn(`Perfume Master not found for ID: ${uniqueId}`);
          return;
        }

        const trans = transMap.get(uniqueId);
        const descEn = trans?.desc || '';
        const quoteEn = trans?.quote || '';
        
        const perfume = new Perfume();
        perfume.card_id = 78; // Mock ID
        perfume.card_name = 'King of Pentacles'; 
        perfume.scene_choice = SCENT_MAPPING[optionKey];
        perfume.scene_choice_en = SCENT_MAPPING_EN[optionKey];
        perfume.brand_name = master.brand;
        perfume.product_name = master.name;
        perfume.tags = master.tags;
        perfume.description = descZh;
        
        // Populate English fields
        perfume.description_en = descEn;
        perfume.sentence_en = quoteEn;
        perfume.product_name_en = master.name; 
        perfume.brand_name_en = master.brand; 
        perfume.tags_en = master.tags_en;

        perfume.sort_order = optionKey.charCodeAt(0) - 65 + 1; 
        perfume.status = 'active';
        
        // Call mock save
        await AppDataSource.getRepository(Perfume).save(perfume);
      };

      await processOption('A', idxIdA, idxDescA);
      await processOption('B', idxIdB, idxDescB);
      await processOption('C', idxIdC, idxDescC);
      await processOption('D', idxIdD, idxDescD);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

run();
