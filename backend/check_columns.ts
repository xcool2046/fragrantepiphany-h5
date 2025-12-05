
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Perfume master'];
const data = XLSX.utils.sheet_to_json<any>(sheet);

if (data.length > 0) {
    console.log('Columns found:', Object.keys(data[0]));
    console.log('First Row:', data[0]);
} else {
    console.log('No data found');
}
