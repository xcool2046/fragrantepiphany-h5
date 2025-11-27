import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  '/home/code/h5-web/docs/archive/result.xlsx',
  '/home/code/h5-web/docs/archive/感情解析.xlsx'
];

files.forEach(filePath => {
  console.log('--------------------------------------------------');
  console.log('Reading file:', filePath);
  
  if (!fs.existsSync(filePath)) {
    console.error('File not found');
    return;
  }

  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get array of arrays

  if (data.length > 0) {
    console.log('Headers:', data[0]);
    console.log('First Row:', data[1]);
  } else {
    console.log('Empty sheet');
  }
});
