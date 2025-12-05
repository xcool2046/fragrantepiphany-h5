
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.join(__dirname, '../../master (3).xlsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[sheetName];
const data = XLSX.utils.sheet_to_json<any>(sheet);

if (data.length === 0) {
    console.log('No data found');
} else {
    console.log('Headers:', Object.keys(data[0]));
    console.log('\nFirst 3 rows (checking English fields):');
    data.slice(0, 3).forEach((row, i) => {
        console.log(`Row ${i + 1}:`);
        console.log(`  Name: ${row['Name']}`);
        console.log(`  English Name: ${row['English Name']}`);
        console.log(`  Chinese Name: ${row['Chinese Name']}`);
        // Check for other potential English fields
        Object.keys(row).forEach(k => {
            if (k.toLowerCase().includes('english') || k.toLowerCase().includes('en')) {
                 console.log(`  Found potential English column: ${k} = ${row[k]}`);
            }
        });
    });
}
