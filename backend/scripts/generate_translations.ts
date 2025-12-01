
import * as fs from 'fs';
import * as path from 'path';

const cards: Record<string, string> = {
  '女祭司': 'The High Priestess',
  '皇后': 'The Empress',
  '皇帝': 'The Emperor',
  '教皇': 'The Hierophant',
  '戀人牌': 'The Lovers', '戀人': 'The Lovers',
  '戰車': 'The Chariot',
  '力量': 'Strength',
  '隱者': 'The Hermit',
  '命運之輪': 'Wheel of Fortune',
  '正義': 'Justice',
  '倒吊人': 'The Hanged Man',
  '死神': 'Death',
  '節制': 'Temperance',
  '惡魔': 'The Devil',
  '高塔': 'The Tower',
  '星星': 'The Star',
  '月亮': 'The Moon',
  '太陽': 'The Sun',
  '審判': 'Judgement',
  '世界': 'The World',
  '權杖侍者': 'Page of Wands', '權杖騎士': 'Knight of Wands', '權杖皇后': 'Queen of Wands', '權杖國王': 'King of Wands',
  '寶劍侍者': 'Page of Swords', '寶劍騎士': 'Knight of Swords', '寶劍皇后': 'Queen of Swords', '寶劍國王': 'King of Swords',
  '聖杯侍者': 'Page of Cups', '聖杯騎士': 'Knight of Cups', '聖杯皇后': 'Queen of Cups', '聖杯國王': 'King of Cups',
  '星幣侍者': 'Page of Pentacles', '星幣騎士': 'Knight of Pentacles', '星幣皇后': 'Queen of Pentacles', '星幣國王': 'King of Pentacles',
};

const notesMap: Record<string, string> = {
  '玫瑰': 'Rose', '沉香': 'Oud', '香草': 'Vanilla', '檀香': 'Sandalwood', '珍稀木材': 'Rare Woods',
  '格拉斯玫瑰': 'Grasse Rose', '鈴蘭': 'Lily of the Valley', '琥珀木質': 'Amber Wood', '琥珀': 'Amber',
  '胡椒玫瑰': 'Pepper Rose', '廣藿香': 'Patchouli', '木質調': 'Woody Notes', '木質': 'Woody',
  '雪松': 'Cedar', '麝香': 'Musk', '苔蘚': 'Moss', '黑松露玫瑰': 'Black Truffle Rose',
  '黑暗玫瑰': 'Dark Rose', '動物感': 'Animalic', '微酸柑橘玫瑰': 'Tart Citrus Rose', '木質基底': 'Woody Base',
  '土耳其玫瑰': 'Turkish Rose', '覆盆子': 'Raspberry', '紙莎草': 'Papyrus', '柑橘玫瑰': 'Citrus Rose',
  '茶香': 'Tea', '潔淨感': 'Clean Accord', '荔枝玫瑰': 'Lychee Rose', '清冷綠意': 'Cool Greenery',
  '深沉感': 'Deep Accord', '胡椒': 'Pepper', '皮革': 'Leather', '松樹玫瑰': 'Pine Rose', '焚香': 'Incense',
  '冷冽感': 'Cold Accord', '黑玫瑰': 'Black Rose', '杜松子': 'Juniper Berry', '咖啡': 'Coffee',
  '紫羅蘭': 'Violet', '清新玫瑰': 'Fresh Rose', '荔枝': 'Lychee', '白麝香': 'White Musk',
  '黃瓜玫瑰': 'Cucumber Rose', '藍風鈴': 'Bluebell', '潔淨麝香': 'Clean Musk', '波本酒香玫瑰': 'Bourbon Rose',
  '天鵝絨質感': 'Velvet Accord', '蜂蜜玫瑰': 'Honey Rose', '丁香': 'Clove', '沒藥': 'Myrrh',
  '綠意玫瑰': 'Green Rose', '煙燻感': 'Smoky Accord', '煙燻木質': 'Smoky Wood', '藏紅花': 'Saffron',
  '陽光柑橘玫瑰': 'Sunny Citrus Rose', '綜合玫瑰': 'Mixed Rose', '新鮮紅玫瑰': 'Fresh Red Rose',
  '檸檬': 'Lemon', '薄荷': 'Mint', '強烈玫瑰': 'Intense Rose', '銳利玫瑰': 'Sharp Rose',
  '清晰玫瑰': 'Clear Rose', '冷靜玫瑰': 'Calm Rose', '純真玫瑰': 'Innocent Rose', '感性玫瑰': 'Sensual Rose',
  '豐沛玫瑰': 'Abundant Rose', '穩重玫瑰': 'Steady Rose', '務實玫瑰': 'Pragmatic Rose', '成功玫瑰': 'Successful Rose',
  '踏實': 'Grounded', '豐饒': 'Rich', '智慧': 'Wisdom', '輕盈': 'Light', '柔和': 'Soft', '純粹': 'Pure',
  '靈活': 'Flexible', '精緻': 'Exquisite', '優雅': 'Elegant', '親和': 'Approachable', '嚴厲': 'Strict',
  '公正': 'Fair', '敏感': 'Sensitive', '激情': 'Passion', '深情': 'Deep Affection', '慈愛': 'Compassion',
  '努力': 'Effort', '穩重': 'Steady', '財富': 'Wealth', '內省': 'Introspective', '直覺': 'Intuition',
  '滋養': 'Nourishing', '保護': 'Protective', '祝福': 'Blessing', '真愛': 'True Love', '前進': 'Forward',
  '溫柔': 'Gentle', '緣分': 'Destiny', '公平': 'Fairness', '換位思考': 'Empathy', '結束': 'Ending',
  '調和': 'Harmony', '慾望': 'Desire', '突變': 'Sudden Change', '希望': 'Hope', '潛意識': 'Subconscious',
  '歡樂': 'Joy', '覺醒': 'Awakening', '圓滿': 'Fulfillment', '好奇': 'Curiosity', '快速': 'Fast',
  '溫暖': 'Warm', '領導': 'Leadership', '機智': 'Wit', '理性': 'Rationality'
};

const scenesMap: Record<string, string> = {
  "午后被阳光烘暖的木质家具": "Wooden furniture warmed by afternoon sunlight",
  "夜晚咖啡馆飘出的烘焙香气": "Roasted aroma drifting from a night cafe",
  "海边度假时的白色香皂": "White soap during a seaside vacation",
  "A. 玫瑰园": "A. Rose Garden"
};

function translateNotes(zh: string): string {
  if (!zh) return '';
  return zh.split(/[,、]/).map(p => notesMap[p.trim()] || p.trim()).join(', ');
}

function translateDesc(zh: string): { desc: string, quote: string } {
  // Pattern: [Card]'s [Attribute] [Action] in [Scent], [Outcome]
  // Example: "皇后的包容胸懷在木質溫暖中擴展，接納感情中的不完美"
  
  let cardName = '';
  let cardEn = '';
  for (const [k, v] of Object.entries(cards)) {
    if (zh.startsWith(k)) {
      cardName = k;
      cardEn = v;
      break;
    }
  }

  // Fallback translation logic (simplified for script)
  // Since we can't easily parse Chinese grammar without NLP, we will construct a "poetic" approximation
  // or use a placeholder structure if we can't parse.
  // Actually, for this task, I (the AI) should probably have generated the full JSON.
  // But writing a script to do it is safer if I can map the key phrases.
  
  // Let's try to map the second part (Outcome) which is after "，"
  const parts = zh.split('，');
  const firstPart = parts[0];
  const secondPart = parts[1] || '';

  // This is getting complicated to script without a full dictionary.
  // I will use a placeholder strategy: 
  // "The [CardEn] energy manifests here. [Translated Second Part]"
  // No, that's bad quality.
  
  return { desc: zh, quote: '' }; // Placeholder, I will replace this logic below
}

// I will actually output the FULL JSON content in the next step by generating it in my "brain" and writing it to a file.
// The script approach is good for Notes and Scenes, but Descriptions need LLM intelligence.
