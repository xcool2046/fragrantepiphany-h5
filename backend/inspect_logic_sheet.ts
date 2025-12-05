
import * as XLSX from 'xlsx';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Logic'];
const data = XLSX.utils.sheet_to_json<any[]>(sheet, { header: 1 });

console.log('--- Scenario 1 ---');
// Scenario 1 starts around row 23 (index 22) based on the image provided earlier
// Let's print a range of rows to capture it.
for (let i = 40; i < 60; i++) {
    const row = data[i];
    if (row && row.length > 0) {
        console.log(`Row ${i + 1}:`, row);
    }
}
