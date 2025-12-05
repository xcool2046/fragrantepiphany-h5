
import * as XLSX from 'xlsx';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Perfume+卡 mapping'];
const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

// Print header and first data row (Magician)
console.log('Header:', data[0]);
console.log('Row 1 (Magician):', data[1]);
// Print Death row (Row 14 usually)
const deathRow = data.find(r => r[0] === '死神');
if (deathRow) {
    console.log('Row (Death):', deathRow);
}
