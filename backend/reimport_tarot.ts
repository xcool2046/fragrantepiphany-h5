
import { DataSource } from 'typeorm';
import { Interpretation } from './src/entities/interpretation.entity';
import { Card } from './src/entities/card.entity';
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Interpretation, Card],
  synchronize: false,
});

const FILES = [
  { path: 'assets/excel_files/自我正式.xlsx', category: 'Self' },
  { path: 'assets/excel_files/事业正式.xlsx', category: 'Career' },
  { path: 'assets/excel_files/感情正式.xlsx', category: 'Love' },
];

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Interpretation);

  const cardRepo = AppDataSource.getRepository(Card);
  const allCards = await cardRepo.find();
  const cardMap = new Map<string, string>();
  
  allCards.forEach(c => {
    if (c.name_zh) {
      cardMap.set(c.name_zh, c.name_en);
      cardMap.set(c.name_zh + '牌', c.name_en); // Handle suffix
    }
    cardMap.set(c.name_en, c.name_en); // Handle English names if any
  });

  for (const file of FILES) {
    // ... (file reading logic)
    const fullPath = path.resolve(process.cwd(), file.path);
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${file.path}`);
      continue;
    }
    console.log(`Processing ${file.category} from ${file.path}...`);
    
    const wb = xlsx.readFile(fullPath);
    const sheet = wb.Sheets[wb.SheetNames[0]];
    const rows: any[] = xlsx.utils.sheet_to_json(sheet);
    if (rows.length > 0) {
        console.log('First row keys:', Object.keys(rows[0]));
        console.log('First row values:', rows[0]);
    }

    for (const row of rows) {
      // Map Card Name
      let rawName = row['__EMPTY_1'] || row['name'] || row['card'] || row['name_en'];
      if (!rawName || rawName === 'name' || rawName === 'Name') continue;
      
      const cardName = cardMap.get(rawName);
      if (!cardName) {
          console.warn(`Unknown card name: ${rawName}`);
          continue;
      }
      
      console.log(`Processing Card: ${rawName} -> ${cardName}`);

      // Map positions
      const positions = ['Past', 'Present', 'Future'];
      const posMapZh: Record<string, string> = {
        'Past': '過去',
        'Present': '現在',
        'Future': '未來'
      };
      
      for (const pos of positions) {
        const posKey = pos.toLowerCase(); // past, present, future

        // Chinese
        const contentZh = row[posMapZh[pos]];
        const sentenceZh = row['sentence_cn']; 
        
        // English
        const contentEn = row[`${posKey}_en_new`] || row[`${posKey}_en`];
        const sentenceEn = row['sentence_en_new'] || row['sentence_en'];

        // Upsert
        const criteria = {
          card_name: cardName,
          category: file.category,
          position: pos,
        };

        let entity = await repo.findOne({ where: criteria });
        if (!entity) {
          entity = repo.create(criteria);
        }

        // Update fields
        if (contentZh) entity.interpretation_zh = contentZh;
        if (contentEn) entity.interpretation_en = contentEn;
        
        // Map Sentence -> Recommendation
        if (sentenceZh) entity.recommendation_zh = sentenceZh;
        if (sentenceEn) entity.recommendation_en = sentenceEn;

        if (cardName === 'The Tower' && pos === 'Present') {
            console.log(`Saving The Tower Present (${file.category}): RecZH=${entity.recommendation_zh?.substring(0, 10)}, RecEN=${entity.recommendation_en?.substring(0, 10)}`);
        }
        
        await repo.save(entity);
      }
    }
    console.log(`Finished ${file.category}.`);
  }

  console.log('Done.');
  await AppDataSource.destroy();
}

run().catch(console.error);
