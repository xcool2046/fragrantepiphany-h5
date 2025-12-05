
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.resolve('/home/projects/h5/master (3).xlsx');
const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json<any>(sheet);

if (data.length > 0) {
  console.log('Headers:', Object.keys(data[0]));
  console.log('First Row:', JSON.stringify(data[0], null, 2));
} else {
  console.log('File is empty or could not be read.');
}
