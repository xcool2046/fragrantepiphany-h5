import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Interpretation>>(getRepositoryToken(Interpretation));

  const baseDir = path.join(__dirname, '../../assets/excel_files');
  const files = [
    { name: '事业正式.xlsx', category: 'Career' },
    { name: '感情正式.xlsx', category: 'Love' },
    { name: '自我正式.xlsx', category: 'Self' },
  ];

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
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    console.log(`Fixing ${fileInfo.category} data from ${fileInfo.name}...`);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    if (!sheet['!ref']) continue;
    const range = XLSX.utils.decode_range(sheet['!ref']);

    let cardIndex = 0;
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      if (cardIndex >= CARD_NAMES.length) break;

      const getCell = (C: number) => {
        const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
        return cell ? cell.v : null;
      };

      // Use standard ordered list
      const cardNameEn = CARD_NAMES[cardIndex];
      cardIndex++;

      const summaryZh = getCell(5);
      const summaryEn = getCell(9);

      const positions = [
        { name: 'Past', zh: getCell(2), en: getCell(6) },
        { name: 'Present', zh: getCell(3), en: getCell(7) },
        { name: 'Future', zh: getCell(4), en: getCell(8) },
      ];

      for (const pos of positions) {
        // Update existing record
        await repo.update(
          { card_name: cardNameEn, category: fileInfo.category, position: pos.name },
          {
            summary_zh: summaryZh,
            summary_en: summaryEn,
            interpretation_zh: pos.zh,
            interpretation_en: pos.en,
          }
        );
      }
    }
    console.log(`Fixed ${cardIndex} cards for ${fileInfo.category}`);
  }

  console.log('All data fixed.');
  await app.close();
}
bootstrap();
