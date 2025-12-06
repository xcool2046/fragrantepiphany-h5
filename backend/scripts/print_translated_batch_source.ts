
import * as fs from 'fs';
import * as path from 'path';

const filePath = path.join(__dirname, '../perfume_source_for_translation.json');
const rawData = fs.readFileSync(filePath, 'utf-8');
const data = JSON.parse(rawData);

const batch2 = data.slice(80, 160);
console.log(JSON.stringify(batch2, null, 2));
