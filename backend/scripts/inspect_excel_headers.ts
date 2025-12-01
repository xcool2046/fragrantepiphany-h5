
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const files = [
  { name: '事业正式.xlsx', category: 'Career' },
  { name: '感情正式.xlsx', category: 'Love' },
  { name: '自我正式.xlsx', category: 'Self' },
];

const baseDir = path.join(__dirname, '../assets/excel_files');

for (const file of files) {
  const filePath = path.join(baseDir, file.name);
  if (fs.existsSync(filePath)) {
    console.log(`\n--- ${file.name} ---`);
    const workbook = XLSX.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    if (data.length > 0) {
        const header = data[0] as any[];
        header.forEach((h, i) => {
            console.log(`Col ${i}: ${h}`);
        });
        
        // Search for King of Swords
        const target = "King of Swords";
        const row = data.find(r => {
            const rData = r as any[];
            return String(rData[0]).trim() === target || String(rData[0]).includes(target);
        });

        if (row) {
            console.log(`\nFOUND "${target}" in ${file.name}:`);
            const rData = row as any[];
            rData.forEach((c, i) => {
                let val = String(c);
                if (val.length > 50) val = val.substring(0, 50) + '...';
                console.log(`Col ${i}: "${val}"`);
            });
        } else {
            console.log(`\nNOT FOUND "${target}" in ${file.name}`);
        }
    }
  } else {
    console.log(`File not found: ${filePath}`);
  }
}
