
import * as XLSX from 'xlsx';
import * as path from 'path';

const excelPath = '/home/projects/h5/master.xlsx';
const workbook = XLSX.readFile(excelPath);
const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
const mappingData = XLSX.utils.sheet_to_json<any[]>(mappingSheet, { header: 1 });

console.log('Searching for Coin Ten...');
for (let i = 0; i < mappingData.length; i++) {
    const row = mappingData[i];
    const cardName = row[0];
    if (cardName) {
        console.log(cardName);
    }
}
