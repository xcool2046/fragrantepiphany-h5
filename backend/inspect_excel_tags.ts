
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = path.resolve('/home/projects/h5/master.xlsx');

try {
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0]; // Assuming data is in the first sheet
  const sheet = workbook.Sheets[sheetName];
  
  // Get headers (first row)
  const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0] as string[];
  console.log('Headers:', headers);

  // Get first 3 rows of data
  const data = XLSX.utils.sheet_to_json(sheet).slice(0, 3);
  console.log('Sample Data:', JSON.stringify(data, null, 2));

} catch (error) {
  console.error('Error reading Excel file:', error);
}
