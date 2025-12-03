
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = path.join(__dirname, '../master (1).xlsx');
const workbook = XLSX.readFile(filePath);

const targetString = "你经历着灵魂深处的共鸣";

console.log(`Searching for: "${targetString}" in ${filePath}`);

workbook.SheetNames.forEach(sheetName => {
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    data.forEach((row: any, rowIndex) => {
        row.forEach((cell: any, colIndex) => {
            if (String(cell).includes(targetString)) {
                console.log(`Found in sheet "${sheetName}", Row ${rowIndex + 1}, Col ${colIndex}:`);
                console.log(cell);
            }
        });
    });
});
