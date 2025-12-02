
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.join(__dirname, '../assets/excel_files/事业正式.xlsx');
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

const output = [];
const cardMap = new Map();

// console.log('--- Fixing Career Scramble ---');

const MAJORS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];
const SUITS = ['Swords', 'Pentacles', 'Wands', 'Cups'];
const RANKS = [
  'Ace', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
  'Page', 'Knight', 'Queen', 'King'
];

function identifyCardFromText(text: string): string | null {
    if (!text) return null;
    const lowerText = text.toLowerCase();
    
    // Check Majors
    for (const m of MAJORS) {
        if (lowerText.startsWith(m.toLowerCase()) || lowerText.startsWith('the ' + m.toLowerCase())) {
            return m;
        }
    }
    
    // Check Suits
    for (const s of SUITS) {
        for (const r of RANKS) {
            const name = `${r} of ${s}`;
            // Match "Ace of Wands" or "The Ace of Wands"
            if (lowerText.startsWith(name.toLowerCase()) || lowerText.startsWith('the ' + name.toLowerCase())) {
                return name;
            }
        }
    }
    return null;
}

for (let r = 0; r < data.length; r++) {
  const row = data[r];
  if (!row || row.length < 10) continue; // Need English columns

  const pastEn = String(row[6] || '').trim();
  const presentEn = String(row[7] || '').trim();
  const futureEn = String(row[8] || '').trim();
  const sentenceEn = String(row[9] || '').trim();

  if (!pastEn) continue;

  const cardName = identifyCardFromText(pastEn);
  if (cardName) {
      if (cardMap.has(cardName)) {
          console.warn(`Duplicate found for ${cardName} at row ${r}`);
      }
      cardMap.set(cardName, {
          card: cardName,
          past_en: pastEn,
          present_en: presentEn,
          future_en: futureEn,
          sentence_en: sentenceEn
      });
  } else {
      console.warn(`Could not identify card from text: "${pastEn.substring(0, 30)}..."`);
  }
}

// Convert map to array
const result = Array.from(cardMap.values());
console.log(JSON.stringify(result, null, 2));
