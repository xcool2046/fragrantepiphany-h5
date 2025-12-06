

import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as XLSX from 'xlsx';

// Load ormconfig.ts from current dir
import ormconfig from './ormconfig';

// Normalization helper
function normalizeChineseName(name: string): string {
  if (!name) return '';
  let n = name.replace(/牌$/, '');
  n = n.replace(/圣杯/g, '聖杯').replace(/宝剑/g, '寶劍').replace(/星币/g, '星幣').replace(/权杖/g, '權杖');
  n = n.replace(/侍卫/g, '侍者').replace(/骑士/g, '騎士').replace(/女王/g, '皇后').replace(/国王/g, '國王');
  n = n.replace(/魔术师/g, '魔術師').replace(/战车/g, '戰車').replace(/恋人/g, '戀人').replace(/隐士|隐者/g, '隱士');
  n = n.replace(/命运之轮/g, '命運之輪').replace(/正义/g, '正義').replace(/挂人|吊人|倒吊人/g, '倒吊人');
  n = n.replace(/节制/g, '節制').replace(/恶魔/g, '惡魔').replace(/审判/g, '審判').replace(/世界/g, '世界');
  n = n.replace(/太阳/g, '太陽').replace(/月亮/g, '月亮').replace(/星星/g, '星星');
  return n;
}

const manualMap: Record<string, string> = {
    '隐者': 'The Hermit', '隐士': 'The Hermit', '隱者': 'The Hermit', '隱士': 'The Hermit', // Added 隱士
    '愚人': 'The Fool', '愚者': 'The Fool',
    '女皇': 'The Empress',
    '女祭司': 'The High Priestess', // Added
    '教皇': 'The Hierophant', // Added
    '恋人': 'The Lovers', '戀人': 'The Lovers', // Added
    '战车': 'The Chariot', '戰車': 'The Chariot', // Added
    '力量': 'Strength', 
    '命运之轮': 'Wheel of Fortune', '命運之輪': 'Wheel of Fortune', // Added
    '吊人': 'The Hanged Man', '倒吊人': 'The Hanged Man',
    '死神': 'Death', // Added just in case
    '节制': 'Temperance', '節制': 'Temperance', // Added
    '恶魔': 'The Devil', '惡魔': 'The Devil', // Added
    '高塔': 'The Tower', 
    '星星': 'The Star', 
    '月亮': 'The Moon', 
    '太阳': 'The Sun', '太陽': 'The Sun', // Added
    '审判': 'Judgement', '審判': 'Judgement', // Added
    '世界': 'The World', 
    '正义': 'Justice', '正義': 'Justice'
};

async function main() {
  console.log('Connecting to database...');
  const AppDataSource = new DataSource({
    ...(ormconfig.options as any),
    entities: [Perfume, Card],
  });

  await AppDataSource.initialize();
  console.log('Database connected.');

  const perfumeRepo = AppDataSource.getRepository(Perfume);
  const cardRepo = AppDataSource.getRepository(Card);

  // 1. Load Translations (Keyed by Excel ID)
  const jsonPath = path.join(__dirname, 'perfume_translations_consolidated.json');
  if (!fs.existsSync(jsonPath)) {
    console.error(`File not found: ${jsonPath}`);
    process.exit(1);
  }
  const translations = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  console.log(`Loaded ${translations.length} translations from JSON.`);

  // 2. Load Excel Mapping to resolving Excel ID -> Card + Choice
  const workbook = XLSX.readFile('/home/projects/h5/master (3).xlsx');
  const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
  const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1 });
  
  // ExcelID -> { cardNameZh, choice }
  const idToContext = new Map<number, { cardNameZh: string, choice: string }>();

  // Helper to resolve card name to standard ZH/EN
  // Actually, in DB we store `card_name` which might be ZH or EN depending on logic.
  // In `refactor_perfume_data.ts`: `newPerfume.card_name = card.name_zh || card.name_en`
  // And it normalizes aliases.
  
  // Mapping Headers: [CardName, Choice, ID, Ref, Link]
  // 1-3=A, 4-6=B...
  const choices = ['A', 'B', 'C', 'D'];
  
  for (let i = 1; i < mappingData.length; i++) {
      const row: any = mappingData[i];
      if (!row[0]) continue;
      const cardNameRaw = row[0].toString().trim();
      
      for (let cIdx = 0; cIdx < choices.length; cIdx++) {
          const choiceLabel = choices[cIdx];
          const baseIdx = 1 + (cIdx * 3);
          const rawId = row[baseIdx];
          if (rawId) {
              const eid = parseInt(rawId);
              idToContext.set(eid, { cardNameZh: cardNameRaw, choice: choiceLabel });
          }
      }
  }
  console.log(`Mapped ${idToContext.size} Excel IDs to Card Context.`);

  // 3. Load All DB Perfumes and create Map: CardName(Standard) + Choice -> Perfume
  const dbPerfumes = await perfumeRepo.find();
  
  // We need to match loose card names.
  // Best strategy: 
  //   For each Translation (Excel ID):
  //     Get Context (CardRaw, Choice)
  //     Resolve CardRaw to DB Card (Standard ZH/EN)
  //     Find Perfume with (DB Card Name, Choice)
  
  // Pre-load Cards for resolution
  const allCards = await cardRepo.find();
  const cardMap = new Map<string, Card>();
  allCards.forEach(c => {
      if (c.name_en) cardMap.set(c.name_en.trim().toLowerCase(), c);
      if (c.name_zh) {
          cardMap.set(c.name_zh.trim(), c);
          cardMap.set(normalizeChineseName(c.name_zh).trim(), c);
      }
  });

  const getCard = (raw: string): Card | undefined => {
      let c = cardMap.get(raw.toLowerCase());
      if (!c) {
          const alias = manualMap[raw] || manualMap[normalizeChineseName(raw)];
          if (alias) c = cardMap.get(alias.toLowerCase());
      }
      if (!c) c = cardMap.get(normalizeChineseName(raw));
      return c;
  };
  
  // Map: CardID + Choice -> Perfume (Primary Key for lookup)
  const dbLookup = new Map<string, Perfume>();
  dbPerfumes.forEach(p => {
      dbLookup.set(`${p.card_id}_${p.scene_choice}`, p);
  });
  
  console.log(`Loaded ${dbPerfumes.length} perfumes from DB.`);

  let updatedCount = 0;
  let notFoundCount = 0;
  let skippedCount = 0;

  for (const item of translations) {
      if (!item.id) {
          console.warn(`Item missing ID:`, item);
          continue;
      }
      
      const context = idToContext.get(item.id);
      if (!context) {
          console.warn(`Excel ID ${item.id} not found in mapping sheet.`);
          notFoundCount++;
          continue;
      }
      
      const card = getCard(context.cardNameZh);
      if (!card) {
          console.warn(`Could not resolve card: ${context.cardNameZh} (ID ${item.id})`);
          notFoundCount++;
          continue;
      }
      
      const key = `${card.id}_${context.choice}`;
      const perfume = dbLookup.get(key);
      
      if (!perfume) {
          console.warn(`Perfume not found in DB for Card: ${card.name_zh} (${card.id}), Choice: ${context.choice} (ID ${item.id})`);
          notFoundCount++;
          continue;
      }
      
      if (item.description_en) {
          perfume.description_en = item.description_en;
          await perfumeRepo.save(perfume);
          updatedCount++;
      } else {
          skippedCount++;
      }
  }

  console.log(`Import complete.`);
  console.log(`Updated: ${updatedCount}`);
  console.log(`Not Found/Error: ${notFoundCount}`);
  console.log(`Skipped (No Desc): ${skippedCount}`);
  
  await AppDataSource.destroy();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});

