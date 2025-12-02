
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = ['self_drive.xlsx'];

for (const file of files) {
  console.log(`\n--- Analysis of ${file} ---`);
  const filePath = path.join(__dirname, `../assets/excel_files/${file}`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

const MAJORS = [
  'The Fool', 'The Magician', 'The High Priestess', 'The Empress', 'The Emperor',
  'The Hierophant', 'The Lovers', 'The Chariot', 'Strength', 'The Hermit',
  'Wheel of Fortune', 'Justice', 'The Hanged Man', 'Death', 'Temperance',
  'The Devil', 'The Tower', 'The Star', 'The Moon', 'The Sun',
  'Judgement', 'The World'
];

console.log('--- Analysis of Career English Text ---');

for (let r = 0; r < data.length; r++) {
  const row = data[r];
  if (!row || row.length < 5) continue;
  const rawName = String(row[0] || '').trim();
  
  let cardName = '';
  for(const m of MAJORS) {
      if(rawName.toLowerCase().startsWith(m.toLowerCase())) {
          cardName = m;
          break;
      }
  }
  if(!cardName) continue;

  const text = String(row[6] || '').substring(0, 50).replace(/\n/g, ' '); // Past EN column
  console.log(`${cardName.padEnd(20)} | ${text}`);
}
}
