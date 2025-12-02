
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  '事业正式.xlsx',
  '感情正式.xlsx',
  '自我正式.xlsx'
];

for (const file of files) {
  const filePath = path.join(__dirname, '../../assets/excel_files', file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    continue;
  }
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];

  console.log(`\n--- ${file} ---`);
  // Print Header
  console.log('Header:', data[0]);
  // Print First Row of Data
  if (data.length > 1) {
    console.log('Row 1:', data[1].map((cell, i) => `[${i}] ${String(cell).substring(0, 20)}...`));
  }
}
