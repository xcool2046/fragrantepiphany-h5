
import * as fs from 'fs';
import * as path from 'path';

const backendDir = path.join(process.cwd(), 'backend');
const assetsDir = path.join(process.cwd(), 'assets', 'excel_files');

if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
}

// 1. Reconstruct translations
const batches = [
    'perfume_translations_batch_1.json',
    'perfume_translations_batch_2.json',
    'perfume_translations_batch_3.json',
    'perfume_translations_batch_4.json'
];

let allTranslations: any[] = [];

batches.forEach(batch => {
    const filePath = path.join(backendDir, batch);
    if (fs.existsSync(filePath)) {
        console.log(`Reading ${batch}...`);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
        allTranslations = allTranslations.concat(content);
    } else {
        console.warn(`Warning: ${batch} not found.`);
    }
});

// Also check if there was a final file in backend (unlikely since we checked, but just in case)
// We'll just use the batches.

// Write to assets/excel_files
const finalTransPath = path.join(assetsDir, 'perfume_translations_final.json');
fs.writeFileSync(finalTransPath, JSON.stringify(allTranslations, null, 2));
console.log(`Wrote ${allTranslations.length} translations to ${finalTransPath}`);

// 2. Copy master.xlsx
const masterSource = path.join(process.cwd(), 'master.xlsx');
const masterDest = path.join(assetsDir, 'perfume_master.xlsx');

if (fs.existsSync(masterSource)) {
    fs.copyFileSync(masterSource, masterDest);
    console.log(`Copied master.xlsx to ${masterDest}`);
} else {
    console.error(`Error: master.xlsx not found at ${masterSource}`);
}
