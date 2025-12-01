
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DATABASE_URL ? undefined : (process.env.DB_HOST || 'localhost'),
  port: process.env.DATABASE_URL ? undefined : parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DATABASE_URL ? undefined : (process.env.DB_USER || 'tarot'),
  password: process.env.DATABASE_URL ? undefined : (process.env.DB_PASSWORD || 'tarot'),
  database: process.env.DATABASE_URL ? undefined : (process.env.DB_NAME || 'tarot'),
  entities: [],
  synchronize: false,
});

function normalizeChineseName(name: string): string {
  if (!name) return '';
  let n = name.replace(/牌$/, ''); // Remove '牌' suffix first
  
  // Suits
  n = n.replace(/圣杯/g, '聖杯');
  n = n.replace(/宝剑/g, '寶劍');
  n = n.replace(/星币/g, '星幣');
  n = n.replace(/权杖/g, '權杖');
  
  // Court
  n = n.replace(/侍卫/g, '侍者');
  n = n.replace(/骑士/g, '騎士');
  n = n.replace(/女王/g, '皇后');
  n = n.replace(/国王/g, '國王');
  
  // Major Arcana (Simplified -> Traditional)
  n = n.replace(/魔术师/g, '魔術師');
  n = n.replace(/战车/g, '戰車');
  n = n.replace(/恋人/g, '戀人');
  n = n.replace(/隐士/g, '隱士');
  n = n.replace(/隐者/g, '隱士');
  n = n.replace(/命运之轮/g, '命運之輪');
  n = n.replace(/正义/g, '正義');
  n = n.replace(/挂人/g, '倒吊人');
  n = n.replace(/吊人/g, '倒吊人');
  n = n.replace(/节制/g, '節制');
  n = n.replace(/恶魔/g, '惡魔');
  n = n.replace(/审判/g, '審判');
  n = n.replace(/世界/g, '世界');
  n = n.replace(/太阳/g, '太陽');
  n = n.replace(/月亮/g, '月亮');
  n = n.replace(/星星/g, '星星');
  
  return n;
}

const manualMap: Record<string, string> = {
    '隐者': 'The Hermit',
    '隐士': 'The Hermit',
    '愚人': 'The Fool',
    '女皇': 'The Empress',
    '吊人': 'The Hanged Man',
    '倒吊人': 'The Hanged Man',
    '太阳': 'The Sun',
    '月亮': 'The Moon',
    '星星': 'The Star'
};

async function seed() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected.');

    // 1. Build Card Map from DB
    console.log('Building Card Map...');
    const cards = await AppDataSource.query('SELECT name_en, name_zh FROM cards');
    const cardMap = new Map<string, string>();
    cards.forEach((c: any) => {
        if (c.name_zh) {
            cardMap.set(c.name_zh, c.name_en);
            cardMap.set(c.name_zh + '牌', c.name_en);
        }
        cardMap.set(c.name_en, c.name_en);
    });

    const CARD_NAMES = [
      "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
      "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands", "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands", "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
      "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups", "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups", "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
      "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords", "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords", "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
      "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
    ];

    const files = [
      { name: '事业正式.xlsx', category: 'Career' },
      { name: '感情正式.xlsx', category: 'Love' },
      { name: '自我正式.xlsx', category: 'Self' },
    ];

    const baseDir =
      process.env.ASSETS_DIR ||
      (fs.existsSync('/home/code/h5-web/assets/excel_files')
        ? '/home/code/h5-web/assets/excel_files' // Local Dev specific
        : path.join(__dirname, '../../assets/excel_files')); // Production

    for (const fileInfo of files) {
      const filePath = path.join(baseDir, fileInfo.name);
      console.log(`\nProcessing file: ${fileInfo.name}`);
      
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping...`);
        continue;
      }

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const rows: any[] = XLSX.utils.sheet_to_json(sheet);

      let count = 0;
      for (const row of rows) {
          // Map Card Name
          let rawName = row['__EMPTY_1'] || row['name'] || row['card'] || row['name_en'];
          if (!rawName || rawName === 'name' || rawName === 'Name') continue;
          
          let cardName = cardMap.get(rawName);
          if (!cardName) {
              const cleanName = rawName.replace(/牌$/, '');
              if (manualMap[cleanName]) {
                  cardName = manualMap[cleanName];
              }
          }

          if (!cardName) {
              const normalized = normalizeChineseName(rawName);
              cardName = cardMap.get(normalized);
              if (!cardName) cardName = cardMap.get(normalized + '牌');
          }
          
          // Fallback: Case-insensitive match against hardcoded English names
          if (!cardName) {
              const lowerRaw = rawName.trim().toLowerCase();
              const match = CARD_NAMES.find(n => n.toLowerCase() === lowerRaw);
              if (match) {
                  cardName = match;
              }
          }

          if (!cardName) {
              console.warn(`Unknown card name: ${rawName}`);
              continue;
          }

          // Map Data
          const sentenceCn = row['sentence_cn'] || row['sentence'] || row['summary'];
          const sentenceEn = row['sentence_en_new'] || row['sentence_en'] || row['summary_en'];

          const positions = ['Past', 'Present', 'Future'];
          for (const pos of positions) {
              const posKey = pos.toLowerCase();
              const contentCn = row[posKey] || row[posKey + '_cn'];
              const contentEn = row[posKey + '_en_new'] || row[posKey + '_en'];

              // Check existing
              const existing = await AppDataSource.query(
                `SELECT id FROM "tarot_interpretations" WHERE "card_name" = $1 AND "category" = $2 AND "position" = $3`,
                [cardName, fileInfo.category, pos]
              );

              if (existing && existing.length > 0) {
                  await AppDataSource.query(
                    `UPDATE "tarot_interpretations" SET 
                      "recommendation_zh" = $1, "recommendation_en" = $2, 
                      "interpretation_zh" = $3, "interpretation_en" = $4
                     WHERE "id" = $5`,
                    [sentenceCn, sentenceEn, contentCn, contentEn, existing[0].id]
                  );
              } else {
                  await AppDataSource.query(
                    `INSERT INTO "tarot_interpretations" 
                      ("card_name", "category", "position", "recommendation_zh", "recommendation_en", "interpretation_zh", "interpretation_en")
                     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                    [cardName, fileInfo.category, pos, sentenceCn, sentenceEn, contentCn, contentEn]
                  );
              }
          }
          count++;
      }
      console.log(`\nFinished ${fileInfo.name}. Processed ${count} cards.`);
    }

    console.log('\nAll done!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('\nError:', err);
    process.exit(1);
  }
}

seed();
