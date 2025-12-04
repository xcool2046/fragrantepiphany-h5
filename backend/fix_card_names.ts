
import { DataSource } from 'typeorm';
import { Card } from './src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgres://tarot:tarot@localhost:5432/tarot',
  entities: [Card],
  synchronize: false,
});

const SUIT_MAP: Record<string, string> = {
  'Cups': '圣杯',
  'Pentacles': '星币',
  'Swords': '宝剑',
  'Wands': '权杖'
};

const RANK_MAP: Record<string, string> = {
  'Ace': '一',
  'Two': '二',
  'Three': '三',
  'Four': '四',
  'Five': '五',
  'Six': '六',
  'Seven': '七',
  'Eight': '八',
  'Nine': '九',
  'Ten': '十',
  'Page': '侍者',
  'Knight': '骑士',
  'Queen': '皇后',
  'King': '国王'
};

const MAJOR_ARCANA: Record<string, string> = {
  'The Fool': '愚者',
  'The Magician': '魔术师',
  'The High Priestess': '女祭司',
  'The Empress': '皇后',
  'The Emperor': '皇帝',
  'The Hierophant': '教皇',
  'The Lovers': '恋人',
  'The Chariot': '战车',
  'Strength': '力量',
  'The Hermit': '隐士',
  'Wheel of Fortune': '命运之轮',
  'Justice': '正义',
  'The Hanged Man': '倒吊人',
  'Death': '死神',
  'Temperance': '节制',
  'The Devil': '恶魔',
  'The Tower': '高塔',
  'The Star': '星星',
  'The Moon': '月亮',
  'The Sun': '太阳',
  'Judgement': '审判',
  'The World': '世界'
};

async function fixCardNames() {
  await AppDataSource.initialize();
  const cardRepo = AppDataSource.getRepository(Card);

  const cards = await cardRepo.find();
  console.log(`Found ${cards.length} cards.`);

  let updatedCount = 0;

  for (const card of cards) {
    const nameEn = card.name_en;
    let newNameZh = '';

    // Check Minor Arcana
    let isMinor = false;
    for (const suit of Object.keys(SUIT_MAP)) {
      if (nameEn.includes(suit)) {
        isMinor = true;
        const rank = nameEn.replace(' of ' + suit, '').trim();
        const zhSuit = SUIT_MAP[suit];
        const zhRank = RANK_MAP[rank];
        
        if (zhSuit && zhRank) {
          newNameZh = zhSuit + zhRank;
        } else {
          console.warn(`Could not parse rank for ${nameEn}`);
        }
        break;
      }
    }

    // Check Major Arcana
    if (!isMinor) {
      if (MAJOR_ARCANA[nameEn]) {
        newNameZh = MAJOR_ARCANA[nameEn];
      } else {
        console.warn(`Unknown Major Arcana: ${nameEn}`);
        // Try to keep existing but convert to Simplified if possible (simple heuristic)
        // Or just leave it if we don't know
      }
    }

    if (newNameZh && newNameZh !== card.name_zh) {
      console.log(`Updating [${card.code}] ${nameEn}: "${card.name_zh}" -> "${newNameZh}"`);
      // Use raw query to avoid any entity issues
      await cardRepo.query('UPDATE cards SET name_zh = $1 WHERE id = $2', [newNameZh, card.id]);
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} cards.`);
  await AppDataSource.destroy();
}

fixCardNames().catch(console.error);
