
import * as XLSX from 'xlsx';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);

console.log('All Sheet Names:', workbook.SheetNames);
