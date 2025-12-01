import { DataSource } from 'typeorm';
import { Perfume } from '../src/entities/perfume.entity';
import { Card } from '../src/entities/card.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as xlsx from 'xlsx';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_NAME || 'tarot',
  entities: [Perfume, Card],
  synchronize: false,
});

// Mapping for suits
const SUIT_MAPPING: Record<string, string> = {
  '權杖': 'Wands',
  '寶劍': 'Swords',
  '聖杯': 'Cups',
  '星幣': 'Pentacles',
};

// Mapping for court cards
const COURT_MAPPING: Record<string, string> = {
  '侍者': 'Page',
  '騎士': 'Knight',
  '皇后': 'Queen',
  '國王': 'King',
};

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected');

  const perfumeRepo = AppDataSource.getRepository(Perfume);
  const cardRepo = AppDataSource.getRepository(Card);

  // Load Excel
  const excelPath = path.resolve(__dirname, '../../legacy/data/perfume.xlsx');
  console.log(`Loading Excel from ${excelPath}`);
  const workbook = xlsx.readFile(excelPath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json<any>(sheet);

  console.log(`Found ${rows.length} rows in Excel`);

  // Cache all cards
  const allCards = await cardRepo.find();
  const cardMap = new Map<string, Card>(); // name_en -> Card
  const cardZhMap = new Map<string, Card>(); // name_zh -> Card

  allCards.forEach(c => {
    cardMap.set(c.name_en.toLowerCase(), c);
    if (c.name_zh) cardZhMap.set(c.name_zh, c);
  });

  let processedCount = 0;

  for (const row of rows) {
    const rawName = (row['塔羅牌'] || '').trim();
    if (!rawName) continue;

    // Determine target card names (English)
    let targetCardNames: string[] = [];

    // Check for ranges like "權杖1-10"
    const rangeMatch = rawName.match(/^(.+?)(\d+)-(\d+)$/);
    if (rangeMatch) {
      const suitZh = rangeMatch[1];
      const start = parseInt(rangeMatch[2]);
      const end = parseInt(rangeMatch[3]);
      const suitEn = SUIT_MAPPING[suitZh];

      if (suitEn) {
        for (let i = start; i <= end; i++) {
          let rank = String(i);
          if (i === 1) rank = 'Ace';
          else if (i === 2) rank = 'Two';
          else if (i === 3) rank = 'Three';
          else if (i === 4) rank = 'Four';
          else if (i === 5) rank = 'Five';
          else if (i === 6) rank = 'Six';
          else if (i === 7) rank = 'Seven';
          else if (i === 8) rank = 'Eight';
          else if (i === 9) rank = 'Nine';
          else if (i === 10) rank = 'Ten';
          
          targetCardNames.push(`${rank} of ${suitEn}`);
        }
      }
    } else {
      // Check for Court cards like "權杖侍者"
      let isCourt = false;
      for (const [suffix, rankEn] of Object.entries(COURT_MAPPING)) {
        if (rawName.endsWith(suffix)) {
          const suitZh = rawName.replace(suffix, '');
          const suitEn = SUIT_MAPPING[suitZh];
          if (suitEn) {
            targetCardNames.push(`${rankEn} of ${suitEn}`);
            isCourt = true;
            break;
          }
        }
      }

      // Major Arcana or direct match
      if (!isCourt) {
        // Try to map Chinese name to English via DB
        const card = cardZhMap.get(rawName);
        if (card) {
          targetCardNames.push(card.name_en);
        } else {
           // Manual fallback for common mismatches if needed
           if (rawName === '愚者') targetCardNames.push('The Fool');
           else if (rawName === '魔術師') targetCardNames.push('The Magician');
           else if (rawName === '女祭司') targetCardNames.push('The High Priestess');
           else if (rawName === '皇后') targetCardNames.push('The Empress');
           else if (rawName === '皇帝') targetCardNames.push('The Emperor');
           else if (rawName === '教皇') targetCardNames.push('The Hierophant');
           else if (rawName === '戀人') targetCardNames.push('The Lovers');
           else if (rawName === '戰車') targetCardNames.push('The Chariot');
           else if (rawName === '力量') targetCardNames.push('Strength');
           else if (rawName === '隱者') targetCardNames.push('The Hermit');
           else if (rawName === '命運之輪') targetCardNames.push('Wheel of Fortune');
           else if (rawName === '正義') targetCardNames.push('Justice');
           else if (rawName === '倒吊人') targetCardNames.push('The Hanged Man');
           else if (rawName === '死神') targetCardNames.push('Death');
           else if (rawName === '節制') targetCardNames.push('Temperance');
           else if (rawName === '惡魔') targetCardNames.push('The Devil');
           else if (rawName === '高塔') targetCardNames.push('The Tower');
           else if (rawName === '星星') targetCardNames.push('The Star');
           else if (rawName === '月亮') targetCardNames.push('The Moon');
           else if (rawName === '太陽') targetCardNames.push('The Sun');
           else if (rawName === '審判') targetCardNames.push('Judgement');
           else if (rawName === '世界') targetCardNames.push('The World');
        }
      }
    }

    if (targetCardNames.length === 0) {
      console.warn(`Could not resolve card name: ${rawName}`);
      continue;
    }

    for (const targetName of targetCardNames) {
      const card = cardMap.get(targetName.toLowerCase());
      if (!card) {
        console.warn(`Card not found in DB: ${targetName}`);
        continue;
      }

      // Prepare Perfume Data
      const sceneChoice = (row['氣息選擇'] || '').trim();
      const brandName = (row['推薦香水'] || '').split(' ')[0]; // Simple guess
      const productName = (row['推薦香水'] || '').trim();
      const tags = (row['香調特點'] || '').trim();
      const description = (row['感情方向推薦理由'] || '').trim();
      
      // Determine sort order based on scene choice (A, B, C, D)
      let sortOrder = 0;
      if (sceneChoice.includes('A.')) sortOrder = 1;
      else if (sceneChoice.includes('午后')) sortOrder = 2;
      else if (sceneChoice.includes('夜晚')) sortOrder = 3;
      else if (sceneChoice.includes('海边')) sortOrder = 4;

      // Upsert Perfume
      // We identify by card_id and sort_order (or scene_choice) to avoid duplicates
      // But since we are "fixing", maybe we should delete existing for this card first?
      // For safety, let's just update if exists, or insert.
      
      const existing = await perfumeRepo.findOne({
        where: { card_id: card.id, scene_choice: sceneChoice }
      });

      if (existing) {
        existing.brand_name = brandName;
        existing.product_name = productName;
        existing.tags = [tags];
        existing.description = description;
        existing.notes_top = tags; // Fallback
        existing.card_name = rawName; // Keep original group name for reference
        await perfumeRepo.save(existing);
      } else {
        const p = perfumeRepo.create({
          card_id: card.id,
          card_name: rawName,
          scene_choice: sceneChoice,
          brand_name: brandName,
          product_name: productName,
          tags: [tags],
          description: description,
          notes_top: tags,
          image_url: '/assets/perfume/perfume_sample.png',
          sort_order: sortOrder,
          status: 'active'
        });
        await perfumeRepo.save(p);
      }
      processedCount++;
    }
  }

  console.log(`Seeding complete. Processed ${processedCount} perfume entries.`);
  await AppDataSource.destroy();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
