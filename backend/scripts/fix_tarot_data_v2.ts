
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import { Card } from '../src/entities/card.entity';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

// --- CONSTANTS ---
const MAJORS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];
const SUITS = ['Swords', 'Pentacles', 'Wands', 'Cups']; // Image Order
const RANKS = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King'
];

// Construct the EXACT order of images on disk (0-77)
// 1. Majors (0-21) - WITH SWAP: 0=Magician, 1=Fool
const IMAGE_ORDER_MAJORS = [...MAJORS];
// Swap Fool and Magician to match Image 01/02
const temp = IMAGE_ORDER_MAJORS[0]; // Fool
IMAGE_ORDER_MAJORS[0] = IMAGE_ORDER_MAJORS[1]; // Magician
IMAGE_ORDER_MAJORS[1] = temp; // Fool

// 2. Suits (22-77)
const IMAGE_ORDER_SUITS: string[] = [];
for (const suit of SUITS) {
    for (const rank of RANKS) {
        IMAGE_ORDER_SUITS.push(`${rank} of ${suit}`);
    }
}

const FINAL_IMAGE_ORDER = [...IMAGE_ORDER_MAJORS, ...IMAGE_ORDER_SUITS];

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const interpRepo = app.get<Repository<Interpretation>>(getRepositoryToken(Interpretation));
  const cardRepo = app.get<Repository<Card>>(getRepositoryToken(Card));

  console.log('--- STARTING ROBUST NAME-BASED FIX ---');


  // ... (Keep constants and setup) ...

  // 1. Load Excel Files and Build Map based on CONTENT
  // Map<Category, Map<CardName, RowData>>
  const excelData = new Map<string, Map<string, any>>();

  const files = [
    { name: '事业正式.xlsx', category: 'Career' },
    { name: '感情正式.xlsx', category: 'Love' },
    { name: '自我正式.xlsx', category: 'Self' }
  ];

  for (const file of files) {
      const filePath = path.join(__dirname, '../../assets/excel_files', file.name);
      if (!fs.existsSync(filePath)) {
          console.error(`File not found: ${filePath}`);
          continue;
      }
      const workbook = XLSX.readFile(filePath);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
      
      const categoryMap = new Map<string, any>();
      
      
      // Use Column 0 (English Name) to identify the card for ALL categories
      const idCol = 0;

      // Iterate all rows to find card names from CONTENT
      for (let r = 0; r < data.length; r++) {
          const row = data[r];
          if (!row || row.length < 7) continue;
          
          // Use Identification Column to identify the card
          const text = String(row[idCol] || '');
          if (!text || text.length < 5) continue;

          // Try to match against known Card Names
          let matchedName: string | null = null;
          
          // Check Majors
          for (const name of MAJORS) {
              if (text.toLowerCase().startsWith(name.toLowerCase())) {
                  matchedName = name;
                  break;
              }
          }
          // Check Suits
          if (!matchedName) {
              for (const suit of SUITS) {
                  for (const rank of RANKS) {
                      const name = `${rank} of ${suit}`;
                      if (text.toLowerCase().startsWith(name.toLowerCase()) || 
                          text.toLowerCase().startsWith(`the ${name.toLowerCase()}`)) {
                          matchedName = name;
                          break;
                      }
                  }
                  if (matchedName) break;
              }
          }

          if (matchedName) {
              categoryMap.set(matchedName, row);
              // console.log(`Mapped Row ${r} to ${matchedName}`);
          }
      }
      excelData.set(file.category, categoryMap);
      console.log(`Loaded ${categoryMap.size} cards for ${file.category} (Content-Based)`);
  }

  // 2. Iterate through our FINAL_IMAGE_ORDER and update DB
  for (let i = 0; i < FINAL_IMAGE_ORDER.length; i++) {
      const correctName = FINAL_IMAGE_ORDER[i];
      
      // A. Update Card Name in 'cards' table
      await cardRepo.update({ id: i + 1 }, { name_en: correctName });

      // B. Update Interpretations
      for (const file of files) {
          const catMap = excelData.get(file.category);
          if (!catMap) continue;

          let row = catMap.get(correctName);
          
          // Fallback: Try adding "The " if missing
          if (!row && !correctName.startsWith('The ')) {
              row = catMap.get('The ' + correctName);
          }

          if (row) {
              const colOffset = file.category === 'Self' ? 2 : 0; 
              const clean = (txt: any) => txt ? String(txt).trim() : '';

              // Update Past
              await interpRepo.update(
                  { card_name: correctName, category: file.category, position: 'Past' },
                  { interpretation_zh: clean(row[2 + colOffset]), interpretation_en: clean(row[6 + colOffset]) }
              );
              // Update Present
              await interpRepo.update(
                  { card_name: correctName, category: file.category, position: 'Present' },
                  { interpretation_zh: clean(row[3 + colOffset]), interpretation_en: clean(row[7 + colOffset]) }
              );
              // Update Future
              await interpRepo.update(
                  { card_name: correctName, category: file.category, position: 'Future' },
                  { interpretation_zh: clean(row[4 + colOffset]), interpretation_en: clean(row[8 + colOffset]) }
              );
              
          } else {
              console.warn(`Missing Excel data for ${correctName} in ${file.category}`);
          }
      }
  }

  console.log('--- FIX COMPLETE ---');
  await app.close();
}
bootstrap();
