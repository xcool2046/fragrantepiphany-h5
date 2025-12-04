
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [],
  synchronize: false,
});

const EXCEL_DIR = path.join(__dirname, '../../assets/excel_files');

interface FileConfig {
  filename: string;
  category: string;
  indices: {
    past: number;
    present: number;
    future: number;
    sentence: number;
  };
}

const FILES: FileConfig[] = [
  {
    filename: '自我正式.xlsx',
    category: 'Self',
    indices: { past: 8, present: 9, future: 10, sentence: 11 },
  },
  {
    filename: '感情正式.xlsx',
    category: 'Love',
    indices: { past: 6, present: 7, future: 8, sentence: 9 },
  },
];

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to database...');

    for (const fileConfig of FILES) {
      const filePath = path.join(EXCEL_DIR, fileConfig.filename);
      console.log(`\nProcessing ${fileConfig.filename} for category: ${fileConfig.category}...`);

      if (!fs.existsSync(filePath)) {
        console.error(`[MISSING] ${filePath}`);
        continue;
      }

      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const data: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

      let updatedCount = 0;
      let skippedCount = 0;

      // Start from row 1 (skip header)
      for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const cardNameRaw = row[0];
        
        if (!cardNameRaw) continue;

        const cardName = String(cardNameRaw).trim();
        const pastEn = row[fileConfig.indices.past];
        const presentEn = row[fileConfig.indices.present];
        const futureEn = row[fileConfig.indices.future];
        const sentenceEn = row[fileConfig.indices.sentence];

        if (!pastEn || !presentEn || !futureEn) {
          console.warn(`[SKIP] Row ${i + 1}: Missing English data for ${cardName}`);
          skippedCount++;
          continue;
        }

        // Update Past
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Past'`,
            [pastEn, sentenceEn, cardName, fileConfig.category]
        );

        // Update Present
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Present'`,
            [presentEn, sentenceEn, cardName, fileConfig.category]
        );

        // Update Future
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Future'`,
            [futureEn, sentenceEn, cardName, fileConfig.category]
        );

        updatedCount++;
        if (updatedCount % 10 === 0) {
            process.stdout.write('.');
        }
      }
      console.log(`\nFinished ${fileConfig.category}. Updated: ${updatedCount}, Skipped: ${skippedCount}`);
    }

    console.log('\nAll done!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bootstrap();
