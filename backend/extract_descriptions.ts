
import * as xlsx from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';

const filePath = '/home/projects/h5/master (1).xlsx';
const wb = xlsx.readFile(filePath);
const sheet = wb.Sheets['Perfume+卡 mapping']; // The descriptions are in the mapping sheet under '文案'
const data = xlsx.utils.sheet_to_json(sheet);

const descriptions = new Set<string>();
data.forEach((row: any) => {
    if (row['文案']) {
        descriptions.add(row['文案'].trim());
    }
});

console.log(`Found ${descriptions.size} unique descriptions.`);
const output = Array.from(descriptions).map(desc => ({ zh: desc, en: '' }));
fs.writeFileSync('perfume_descriptions_to_translate.json', JSON.stringify(output, null, 2));
console.log('Saved to perfume_descriptions_to_translate.json');
