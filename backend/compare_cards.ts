
import * as fs from 'fs';
import * as path from 'path';

const excelCards = fs.readFileSync('excel_cards.txt', 'utf-8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('Searching') && !s.startsWith('Row'));
const dbCards = fs.readFileSync('db_cards.txt', 'utf-8').split('\n').map(s => s.trim()).filter(s => s && !s.startsWith('Total Cards'));

const dbSet = new Set(dbCards);
const missingInDb = excelCards.filter(c => !dbSet.has(c));

console.log(`Excel Cards: ${excelCards.length}`);
console.log(`DB Cards: ${dbCards.length}`);
console.log(`Missing in DB: ${missingInDb.length}`);
console.log('Missing Cards:', missingInDb);
