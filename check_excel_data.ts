
import xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  'backend/assets/excel_files/自我正式.xlsx',
  'backend/assets/excel_files/事业正式.xlsx',
  'backend/assets/excel_files/感情正式.xlsx'
];

files.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${file}`);
    return;
  }

  console.log(`\n--- Reading ${path.basename(file)} ---`);
  const wb = xlsx.readFile(fullPath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows: any[] = xlsx.utils.sheet_to_json(sheet);

  if (rows.length === 0) {
    console.log('Empty sheet');
    return;
  }

  // Print headers
  console.log('Headers:', Object.keys(rows[0]));

  // Find "The Tower" (or just first row)
  const sample = rows.find(r => r['name'] === 'The Tower' || r['card'] === 'The Tower' || r['name_en'] === 'The Tower');
  if (sample) {
      console.log('Sample Row (The Tower):');
      console.log('  sentence:', sample['sentence']);
      console.log('  sentence_en:', sample['sentence_en']);
      console.log('  past_en:', sample['past_en']);
      console.log('  present_en:', sample['present_en']);
  } else {
      console.log('The Tower not found, showing first row:');
      console.log(rows[0]);
  }
});
