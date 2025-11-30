import * as XLSX from 'xlsx';
import * as path from 'path';

  const baseDir = path.join(__dirname, '../../assets/excel_files');
  const files = ['自我正式.xlsx'];
  const rowsToCheck = [1]; 

  for (const file of files) {
      console.log(`\n=== Inspecting ${file} ===`);
      const workbook = XLSX.readFile(path.join(baseDir, file));
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      
      for (const R of rowsToCheck) {
        console.log(`\n--- Row ${R} ---`);
        for (let C = 0; C <= 15; C++) {
            const cell = sheet[XLSX.utils.encode_cell({ r: R, c: C })];
            const val = cell ? String(cell.v).substring(0, 20) : 'NULL';
            console.log(`Col ${C}: ${val}`);
        }
      }
  }
