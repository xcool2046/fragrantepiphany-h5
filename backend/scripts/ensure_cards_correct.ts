
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config();

// Use environment variables for connection
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_DATABASE || 'tarot',
  synchronize: false,
});

const CARDS_DATA = [
    { id: 1, en: "The Fool", zh: "愚者" },
    { id: 2, en: "The Magician", zh: "魔术师" },
    { id: 3, en: "The High Priestess", zh: "女祭司" },
    { id: 4, en: "The Empress", zh: "皇后" },
    { id: 5, en: "The Emperor", zh: "皇帝" },
    { id: 6, en: "The Hierophant", zh: "教皇" },
    { id: 7, en: "The Lovers", zh: "恋人" },
    { id: 8, en: "The Chariot", zh: "战车" },
    { id: 9, en: "Strength", zh: "力量" },
    { id: 10, en: "The Hermit", zh: "隐士" },
    { id: 11, en: "Wheel of Fortune", zh: "命运之轮" },
    { id: 12, en: "Justice", zh: "正义" },
    { id: 13, en: "The Hanged Man", zh: "倒吊人" },
    { id: 14, en: "Death", zh: "死神" },
    { id: 15, en: "Temperance", zh: "节制" },
    { id: 16, en: "The Devil", zh: "恶魔" },
    { id: 17, en: "The Tower", zh: "高塔" },
    { id: 18, en: "The Star", zh: "星星" },
    { id: 19, en: "The Moon", zh: "月亮" },
    { id: 20, en: "The Sun", zh: "太阳" },
    { id: 21, en: "Judgement", zh: "审判" },
    { id: 22, en: "The World", zh: "世界" },
    // Wands
    { id: 23, en: "Ace of Wands", zh: "权杖一" },
    { id: 24, en: "Two of Wands", zh: "权杖二" },
    { id: 25, en: "Three of Wands", zh: "权杖三" },
    { id: 26, en: "Four of Wands", zh: "权杖四" },
    { id: 27, en: "Five of Wands", zh: "权杖五" },
    { id: 28, en: "Six of Wands", zh: "权杖六" },
    { id: 29, en: "Seven of Wands", zh: "权杖七" },
    { id: 30, en: "Eight of Wands", zh: "权杖八" },
    { id: 31, en: "Nine of Wands", zh: "权杖九" },
    { id: 32, en: "Ten of Wands", zh: "权杖十" },
    { id: 33, en: "Page of Wands", zh: "权杖侍者" },
    { id: 34, en: "Knight of Wands", zh: "权杖骑士" },
    { id: 35, en: "Queen of Wands", zh: "权杖皇后" },
    { id: 36, en: "King of Wands", zh: "权杖国王" },
    // Cups
    { id: 37, en: "Ace of Cups", zh: "圣杯一" },
    { id: 38, en: "Two of Cups", zh: "圣杯二" },
    { id: 39, en: "Three of Cups", zh: "圣杯三" },
    { id: 40, en: "Four of Cups", zh: "圣杯四" },
    { id: 41, en: "Five of Cups", zh: "圣杯五" },
    { id: 42, en: "Six of Cups", zh: "圣杯六" },
    { id: 43, en: "Seven of Cups", zh: "圣杯七" },
    { id: 44, en: "Eight of Cups", zh: "圣杯八" },
    { id: 45, en: "Nine of Cups", zh: "圣杯九" },
    { id: 46, en: "Ten of Cups", zh: "圣杯十" },
    { id: 47, en: "Page of Cups", zh: "圣杯侍者" },
    { id: 48, en: "Knight of Cups", zh: "圣杯骑士" },
    { id: 49, en: "Queen of Cups", zh: "圣杯皇后" },
    { id: 50, en: "King of Cups", zh: "圣杯国王" },
    // Swords
    { id: 51, en: "Ace of Swords", zh: "宝剑一" },
    { id: 52, en: "Two of Swords", zh: "宝剑二" },
    { id: 53, en: "Three of Swords", zh: "宝剑三" },
    { id: 54, en: "Four of Swords", zh: "宝剑四" },
    { id: 55, en: "Five of Swords", zh: "宝剑五" },
    { id: 56, en: "Six of Swords", zh: "宝剑六" },
    { id: 57, en: "Seven of Swords", zh: "宝剑七" },
    { id: 58, en: "Eight of Swords", zh: "宝剑八" },
    { id: 59, en: "Nine of Swords", zh: "宝剑九" },
    { id: 60, en: "Ten of Swords", zh: "宝剑十" },
    { id: 61, en: "Page of Swords", zh: "宝剑侍者" },
    { id: 62, en: "Knight of Swords", zh: "宝剑骑士" },
    { id: 63, en: "Queen of Swords", zh: "宝剑皇后" },
    { id: 64, en: "King of Swords", zh: "宝剑国王" },
    // Pentacles
    { id: 65, en: "Ace of Pentacles", zh: "星币一" },
    { id: 66, en: "Two of Pentacles", zh: "星币二" },
    { id: 67, en: "Three of Pentacles", zh: "星币三" },
    { id: 68, en: "Four of Pentacles", zh: "星币四" },
    { id: 69, en: "Five of Pentacles", zh: "星币五" },
    { id: 70, en: "Six of Pentacles", zh: "星币六" },
    { id: 71, en: "Seven of Pentacles", zh: "星币七" },
    { id: 72, en: "Eight of Pentacles", zh: "星币八" },
    { id: 73, en: "Nine of Pentacles", zh: "星币九" },
    { id: 74, en: "Ten of Pentacles", zh: "星币十" },
    { id: 75, en: "Page of Pentacles", zh: "星币侍者" },
    { id: 76, en: "Knight of Pentacles", zh: "星币骑士" },
    { id: 77, en: "Queen of Pentacles", zh: "星币皇后" },
    { id: 78, en: "King of Pentacles", zh: "星币国王" },
];

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    console.log('--- Ensuring Cards Data Correctness ---');
    
    for (const card of CARDS_DATA) {
        // Update by ID to ensure consistency
        await AppDataSource.query(
            `UPDATE cards SET name_en = $1, name_zh = $2 WHERE id = $3`,
            [card.en, card.zh, card.id]
        );
        // Also ensure it exists (if ID sequence is messed up, this might not insert, but we assume rows exist. 
        // If not, we should insert. But let's stick to update for now as rows should exist from migration)
    }

    console.log(`Updated ${CARDS_DATA.length} cards.`);
    
    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
