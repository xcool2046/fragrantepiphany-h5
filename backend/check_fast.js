const XLSX = require('xlsx');
const path = require('path');
const filePath = '/home/projects/h5/master (3).xlsx';

try {
    if (require('fs').existsSync(filePath)) {
        console.log(`Reading file: ${filePath}`);
        const workbook = XLSX.readFile(filePath);
        console.log('Sheet Names:', workbook.SheetNames);
        
        const match = workbook.SheetNames.find(n => /logic|interpretation|解读/i.test(n));
        if (match) {
            console.log(`Found potential logic sheet: ${match}`);
            const sheet = workbook.Sheets[match];
            const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
            console.log('--- Logic Sheet Rows 0-30 ---');
            console.log(JSON.stringify(data.slice(0, 30), null, 2));
        }

        ['Perfume master', 'Perfume+卡 mapping'].forEach(name => {
             if (workbook.Sheets[name]) {
                 console.log(`--- Sheet: ${name} ---`);
                 const s = workbook.Sheets[name];
                 const d = XLSX.utils.sheet_to_json(s, { header: 1 });
                 console.log('Header:', JSON.stringify(d[0]));
                 console.log('Sample (rows 1-3):', JSON.stringify(d.slice(1, 4)));
             }
        });
    } else {
        console.log(`File not found: ${filePath}`);
    }
} catch (e) {
    console.error(e);
}
