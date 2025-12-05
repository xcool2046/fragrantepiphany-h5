
import * as XLSX from 'xlsx';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Perfume+卡 mapping'];
const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

console.log('Mapping Sheet Header:', data[0]);
console.log('First Data Row:', data[1]);
console.log('Second Data Row:', data[2]);
