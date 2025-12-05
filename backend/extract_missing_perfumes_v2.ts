
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  path.join(__dirname, 'assets/perfume.xlsx'),
  path.join(__dirname, 'assets/excel_files/master (1).xlsx'), // Checking if this exists
];

const missingTargets = [
  'Red Roses', 'Wonderwood', 'Italica', 'Chocolate Greedy', 'Tobacco Vanille', 'White Musk'
];

function findMissing() {
  for (const file of files) {
    if (!fs.existsSync(file)) {
      console.log(`Skipping missing file: ${file}`);
      continue;
    }
    console.log(`Reading ${file}...`);
    const workbook = XLSX.readFile(file);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet);

    for (const row of data as any[]) {
      // Check product name or brand
      const pName = row['Product Name'] || row['Name'] || row['name'] || '';
      const bName = row['Brand'] || row['Brand Name'] || row['brand'] || '';
      
      const match = missingTargets.find(t => pName.includes(t) || bName.includes(t));
      if (match) {
        console.log('------------------------------------------------');
        console.log(`FOUND: ${match}`);
        console.log(JSON.stringify(row, null, 2));
      }
    }
  }
}

findMissing();
