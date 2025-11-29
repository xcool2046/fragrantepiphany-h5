
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

async function seed() {
  try {
    console.log('Connecting to database...');
    await AppDataSource.initialize();
    console.log('Connected.');

    const files = [
      { name: '事业正式.xlsx', category: 'Career' },
      { name: '感情正式.xlsx', category: 'Love' },
      { name: '自我正式.xlsx', category: 'Self' },
    ];

    const baseDir =
      process.env.ASSETS_DIR ||
      (fs.existsSync('/home/code/h5-web/assets/excel_files')
        ? '/home/code/h5-web/assets/excel_files' // Local Dev specific
        : path.join(__dirname, '../../assets/excel_files')); // Production: dist/scripts/ -> ../../assets

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
      const ref = sheet['!ref'];
      if (!ref) {
        console.warn(`Empty sheet in ${fileInfo.name}`);
        continue;
      }
      const range = XLSX.utils.decode_range(ref);
      console.log(`Sheet loaded. Rows: ${range.e.r}`);

      let count = 0;
      // Start from row 1 (skipping header at row 0)
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        const getCell = (C: number) => {
          const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
          return cell ? cell.v : null;
        };

        const cardNameEn = getCell(0); // Column 0: English Name
        const cardNameCn = getCell(1); // Column 1: Chinese Name

        if (!cardNameEn) continue;

        const summaryZh = getCell(5); // Column 5: Sentence CN
        const summaryEn = getCell(9); // Column 9: Sentence EN (Corrected index)

        // Data for Past
        const pastZh = getCell(2); // Column 2: Past CN
        const pastEn = getCell(6); // Column 6: Past EN

        // Data for Present
        const presentZh = getCell(3); // Column 3: Present CN
        const presentEn = getCell(7); // Column 7: Present EN

        // Data for Future
        const futureZh = getCell(4); // Column 4: Future CN
        const futureEn = getCell(8); // Column 8: Future EN

        const positions = [
          { name: 'Past', zh: pastZh, en: pastEn },
          { name: 'Present', zh: presentZh, en: presentEn },
          { name: 'Future', zh: futureZh, en: futureEn },
        ];

        for (const pos of positions) {
          // Check if entry exists
          const existing = await AppDataSource.query(
            `SELECT id FROM "tarot_interpretations" WHERE "card_name" = $1 AND "category" = $2 AND "position" = $3`,
            [cardNameEn, fileInfo.category, pos.name],
          );

          if (existing && existing.length > 0) {
            // Update
            await AppDataSource.query(
              `UPDATE "tarot_interpretations" SET 
                "summary_zh" = $1, "summary_en" = $2, 
                "interpretation_zh" = $3, "interpretation_en" = $4
               WHERE "id" = $5`,
              [summaryZh, summaryEn, pos.zh, pos.en, existing[0].id],
            );
          } else {
            // Insert
            await AppDataSource.query(
              `INSERT INTO "tarot_interpretations" 
                ("card_name", "category", "position", "summary_zh", "summary_en", "interpretation_zh", "interpretation_en")
               VALUES ($1, $2, $3, $4, $5, $6, $7)`,
              [
                cardNameEn,
                fileInfo.category,
                pos.name,
                summaryZh,
                summaryEn,
                pos.zh,
                pos.en,
              ],
            );
          }
        }
        count++;
        if (count % 10 === 0) process.stdout.write('.');
      }
      console.log(`\nFinished ${fileInfo.name}. Processed ${count} cards.`);
    }

    console.log('\nAll done!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error('\nError:', err);
  }
}

seed();
