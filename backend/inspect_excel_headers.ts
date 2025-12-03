
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.join(__dirname, '../master (1).xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  
  // Get range
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
  
  // Read first row (headers)
  const headers: string[] = [];
  for (let C = range.s.c; C <= range.e.c; ++C) {
    const cellAddress = { c: C, r: range.s.r };
    const cellRef = XLSX.utils.encode_cell(cellAddress);
    const cell = sheet[cellRef];
    if (cell && cell.v) {
      headers.push(String(cell.v));
    }
  }
  
  console.log('Excel Headers:', headers);
  
  // Print first data row to verify content
  const firstDataRow: any[] = [];
  if (range.e.r > range.s.r) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = { c: C, r: range.s.r + 1 };
        const cellRef = XLSX.utils.encode_cell(cellAddress);
        const cell = sheet[cellRef];
        firstDataRow.push(cell ? cell.v : null);
      }
      console.log('First Data Row:', firstDataRow);
  }

} catch (error) {
  console.error('Error reading Excel:', error);
}
