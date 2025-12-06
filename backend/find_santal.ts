
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const excelPath = path.resolve('../assets/master (3).xlsx'); // Adjust path relative to backend
// Actually, run from backend dir?
// path.resolve('master (3).xlsx')?
// The file is likely at /home/projects/h5/master (3).xlsx

async function main() {
    const p = '/home/projects/h5/master (3).xlsx';
    if (!fs.existsSync(p)) {
        console.error('File not found at', p);
        return;
    }
    const workbook = XLSX.readFile(p);
    const sheet = workbook.Sheets['Perfume master'];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as any[][];
    
    console.log(`Searching ${data.length} rows...`);
    
    data.forEach((row, i) => {
        const str = JSON.stringify(row);
        if (str.includes('Wood Sage')) {
            console.log(`[Wood Sage] Row ${i+1}: ${str}`);
        }
        if (str.toLowerCase().includes('ten of cups') || str.includes('圣杯十')) {
            console.log(`[Ten of Cups] Row ${i+1}: ${str}`);
        }
    });
}
main();
