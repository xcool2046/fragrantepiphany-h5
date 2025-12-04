
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Interpretation],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const repo = AppDataSource.getRepository(Interpretation);

    // 1. Clear existing data
    console.log('Clearing existing interpretations...');
    await repo.clear();
    console.log('Table cleared.');

    // 2. Define files and categories
    // Paths are relative to backend/scripts/ or absolute. Using absolute for safety based on project structure.
    const projectRoot = path.resolve(__dirname, '../../');
    const files = [
      { path: path.join(projectRoot, 'assets/excel_files/自我正式.xlsx'), category: 'Self' },
      { path: path.join(projectRoot, 'assets/excel_files/感情正式.xlsx'), category: 'Love' },
      { path: path.join(projectRoot, 'assets/excel_files/事业正式.xlsx'), category: 'Career' },
      // Perfume is handled by migration/Perfume entity, skipping here.
    ];

    for (const file of files) {
      if (!fs.existsSync(file.path)) {
        console.error(`File not found: ${file.path}`);
        continue;
      }

      console.log(`Processing ${file.category} from ${file.path}...`);
      const workbook = XLSX.readFile(file.path);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[] = XLSX.utils.sheet_to_json(sheet);

      console.log(`Found ${data.length} rows in ${file.category}`);
      
      let importedCount = 0;

      for (const row of data) {
        // __EMPTY is English Name, __EMPTY_1 is Chinese Name based on inspection
        const cardNameZh = row['__EMPTY_1']; 
        
        if (!cardNameZh || cardNameZh === '中文名称') continue; 

        const positions = [
            { key: '過去', val: 'past', enKey: 'past_en_new' },
            { key: '現在', val: 'present', enKey: 'present_en_new' },
            { key: '未來', val: 'future', enKey: 'future_en_new' }
        ];

        for (const pos of positions) {
            const contentZh = row[pos.key];
            const contentEn = row[pos.enKey];

            if (!contentZh) continue;

            const interp = new Interpretation();
            interp.category = file.category;
            interp.card_name = cardNameZh.trim();
            interp.position = pos.val;

            interp.interpretation_zh = contentZh;
            interp.interpretation_en = contentEn || '';
            
            // Summary is shared across positions for the card in the Excel structure (one row per card),
            // but DB stores it per interpretation row. We'll duplicate it.
            interp.summary_zh = row['sentence_cn'] || ''; 
            interp.summary_en = row['sentence_en_new'] || '';

            // Default others to empty string/null
            interp.action_zh = '';
            interp.action_en = '';
            interp.future_zh = '';
            interp.future_en = '';
            interp.recommendation_zh = '';
            interp.recommendation_en = '';

            try {
                await repo.save(interp);
                importedCount++;
            } catch (e) {
                console.error(`Failed to save ${cardNameZh} - ${pos.val}:`, e.message);
            }
        }
      }
      console.log(`Imported ${importedCount} records for ${file.category}`);
    }

    await AppDataSource.destroy();
    console.log('Done.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
