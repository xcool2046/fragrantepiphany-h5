
import { MigrationInterface, QueryRunner } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

export class SeedTarotData1764402384646 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const files = [
      { name: '事业正式.xlsx', category: 'Career' },
      { name: '感情正式.xlsx', category: 'Love' },
      { name: '自我正式.xlsx', category: 'Self' },
    ];

    const baseDir = path.join(__dirname, '../../../assets/excel_files');

    const CARD_NAMES = [
      "The Fool", "The Magician", "The High Priestess", "The Empress", "The Emperor", "The Hierophant", "The Lovers", "The Chariot", "Strength", "The Hermit", "Wheel of Fortune", "Justice", "The Hanged Man", "Death", "Temperance", "The Devil", "The Tower", "The Star", "The Moon", "The Sun", "Judgement", "The World",
      "Ace of Wands", "Two of Wands", "Three of Wands", "Four of Wands", "Five of Wands", "Six of Wands", "Seven of Wands", "Eight of Wands", "Nine of Wands", "Ten of Wands", "Page of Wands", "Knight of Wands", "Queen of Wands", "King of Wands",
      "Ace of Cups", "Two of Cups", "Three of Cups", "Four of Cups", "Five of Cups", "Six of Cups", "Seven of Cups", "Eight of Cups", "Nine of Cups", "Ten of Cups", "Page of Cups", "Knight of Cups", "Queen of Cups", "King of Cups",
      "Ace of Swords", "Two of Swords", "Three of Swords", "Four of Swords", "Five of Swords", "Six of Swords", "Seven of Swords", "Eight of Swords", "Nine of Swords", "Ten of Swords", "Page of Swords", "Knight of Swords", "Queen of Swords", "King of Swords",
      "Ace of Pentacles", "Two of Pentacles", "Three of Pentacles", "Four of Pentacles", "Five of Pentacles", "Six of Pentacles", "Seven of Pentacles", "Eight of Pentacles", "Nine of Pentacles", "Ten of Pentacles", "Page of Pentacles", "Knight of Pentacles", "Queen of Pentacles", "King of Pentacles"
    ];

    for (const fileInfo of files) {
      const filePath = path.join(baseDir, fileInfo.name);
      if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}, skipping...`);
        continue;
      }

      console.log(`Processing ${fileInfo.name}...`);
      const workbook = XLSX.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      if (!sheet['!ref']) continue;
      const range = XLSX.utils.decode_range(sheet['!ref']);

      let cardIndex = 0;
      // Start from row 1 (skipping header at row 0)
      for (let R = range.s.r + 1; R <= range.e.r; ++R) {
        if (cardIndex >= CARD_NAMES.length) break;

        const getCell = (C: number) => {
          const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
          return cell ? cell.v : null;
        };

        // Ignore Column 0 (Name) as it is unreliable
        // Use our standard ordered list
        const cardNameEn = CARD_NAMES[cardIndex];
        cardIndex++;

        const summaryZh = getCell(5); // Column 5: Sentence CN
        const summaryEn = getCell(9); // Column 9: Sentence EN

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
          // Check if entry exists with English Name
          let existing = await queryRunner.query(
            `SELECT id FROM "tarot_interpretations" WHERE "card_name" = $1 AND "category" = $2 AND "position" = $3`,
            [cardNameEn, fileInfo.category, pos.name],
          );

          if (existing && existing.length > 0) {
            // Update
            await queryRunner.query(
              `UPDATE "tarot_interpretations" SET 
                "summary_zh" = $1, "summary_en" = $2, 
                "interpretation_zh" = $3, "interpretation_en" = $4
               WHERE "id" = $5`,
              [summaryZh, summaryEn, pos.zh, pos.en, existing[0].id],
            );
          } else {
            // Insert
            await queryRunner.query(
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
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Optional: Delete data seeded by this migration
    // await queryRunner.query(`DELETE FROM "tarot_interpretations" WHERE "category" IN ('Career', 'Love', 'Self')`);
  }
}
