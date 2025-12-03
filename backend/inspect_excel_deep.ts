
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.join(__dirname, '../master (1).xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  console.log('Sheet Names:', workbook.SheetNames);

  for (const sheetName of workbook.SheetNames) {
    console.log(`\n--- Inspecting Sheet: ${sheetName} ---`);
    const sheet = workbook.Sheets[sheetName];
    const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
    
    // Headers
    const headers: string[] = [];
    for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: range.s.r };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = sheet[cellRef];
        if (cell && cell.v) headers.push(String(cell.v));
    }
    console.log('Headers:', headers);

    // Search for "Oud Satin Mood"
    const data = XLSX.utils.sheet_to_json(sheet);
    const found = data.find((row: any) => {
        return Object.values(row).some(val => String(val).toLowerCase().includes('oud satin mood'));
    });

    if (found) {
        console.log('Found "Oud Satin Mood":', found);
    } else {
        console.log('"Oud Satin Mood" NOT found in this sheet.');
    }
  }

} catch (error) {
  console.error('Error reading Excel:', error);
}
