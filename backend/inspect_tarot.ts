
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = '/home/projects/h5/backend/assets/excel_files/事业正式.xlsx';

if (!fs.existsSync(filePath)) {
  console.error(`File not found: ${filePath}`);
  process.exit(1);
}

const wb = xlsx.readFile(filePath);
const sheetName = wb.SheetNames[0];
const sheet = wb.Sheets[sheetName];
const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

if (data.length > 0) {
  console.log('Headers:', data[0]);
} else {
  console.log('Empty sheet');
}
