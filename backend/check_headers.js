
const XLSX = require('xlsx');
const path = require('path');


const files = [
  'assets/excel_files/事业正式.xlsx',
  'assets/excel_files/感情正式.xlsx',
  'assets/excel_files/自我正式.xlsx',
  'legacy/data/perfume.xlsx'
];

files.forEach(file => {
  try {
    const filePath = path.join(__dirname, '../', file);
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const headers = [];
    const range = XLSX.utils.decode_range(sheet['!ref']);
    
    // Get headers
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r, c: C })];
      if (cell && cell.v) headers.push(cell.v);
    }
    
    // Get first row of data
    const firstRow = [];
    if (range.e.r >= range.s.r + 1) {
       for (let C = range.s.c; C <= range.e.c; ++C) {
        const cell = sheet[XLSX.utils.encode_cell({ r: range.s.r + 1, c: C })];
        firstRow.push(cell ? cell.v : 'EMPTY');
      }
    }

    console.log(`File: ${file}`);
    console.log(`Headers: ${headers.join(', ')}`);
    console.log(`First Row: ${firstRow.join(', ')}`);
    console.log('---');
  } catch (err) {
    console.error(`Error reading ${file}:`, err.message);
  }
});

