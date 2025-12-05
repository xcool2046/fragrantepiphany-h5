
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = path.join(__dirname, '../../assets/excel_files/perfume_master.xlsx');

if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    process.exit(1);
}

const workbook = XLSX.readFile(filePath);
const sheet = workbook.Sheets['Perfume master'];
const data = XLSX.utils.sheet_to_json<any>(sheet);

if (data.length === 0) {
    console.log('No data found');
} else {
    console.log('Headers:', Object.keys(data[0]));
    console.log('\nFirst 3 rows:');
    data.slice(0, 3).forEach((row, i) => {
        console.log(`Row ${i + 1}:`);
        console.log(`  Name: ${row['Name']}`);
        console.log(`  Tag1: ${row['Tag1']}`);
        console.log(`  Tag2: ${row['Tag2']}`);
        console.log(`  Tag3: ${row['Tag3']}`);
        // Check for potential Chinese tag columns
        Object.keys(row).forEach(k => {
            if (k.toLowerCase().includes('tag') || k.includes('标签')) {
                if (k !== 'Tag1' && k !== 'Tag2' && k !== 'Tag3') {
                     console.log(`  Found potential tag column: ${k} = ${row[k]}`);
                }
            }
        });
    });
}
