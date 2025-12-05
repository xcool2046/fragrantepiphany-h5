
import * as XLSX from 'xlsx';
import * as fs from 'fs';
import * as path from 'path';

const file1Path = '/home/projects/h5/master (3).xlsx';
const file2Path = '/home/projects/h5/legacy/raw_assets/excel_files/perfume_master.xlsx';

console.log(`Comparing:\n1. ${file1Path} (User)\n2. ${file2Path} (System/Legacy)\n`);

if (!fs.existsSync(file1Path)) { console.error('File 1 not found'); process.exit(1); }
if (!fs.existsSync(file2Path)) { console.error('File 2 not found'); process.exit(1); }

const wb1 = XLSX.readFile(file1Path);
const wb2 = XLSX.readFile(file2Path);

const sheet1 = wb1.Sheets['Perfume master'];
const sheet2 = wb2.Sheets['Perfume master'];

if (!sheet1 || !sheet2) {
    console.error('Perfume master sheet missing in one of the files');
    process.exit(1);
}

const data1 = XLSX.utils.sheet_to_json<any>(sheet1);
const data2 = XLSX.utils.sheet_to_json<any>(sheet2);

const map1 = new Map(data1.map(r => [r['UNIQUE ID'], r]));
const map2 = new Map(data2.map(r => [r['UNIQUE ID'], r]));

const allIds = new Set([...map1.keys(), ...map2.keys()]);
const sortedIds = Array.from(allIds).sort((a, b) => Number(a) - Number(b));

const differences: string[] = [];
const nonEnglishNames: {id: any, val: any}[] = [];
const isEnglish = (text: string) => /^[A-Za-z0-9\s\p{P}]+$/u.test(text);

sortedIds.forEach(id => {
    const r1 = map1.get(id);
    const r2 = map2.get(id);

    if (!r1) {
        differences.push(`ID ${id}: Missing in User File`);
        return;
    }
    if (!r2) {
        differences.push(`ID ${id}: Missing in System File`);
        return;
    }

    // Check English Name
    if (r1['Name'] && !isEnglish(r1['Name'])) {
        nonEnglishNames.push({id, val: r1['Name']});
    }

    // Compare fields
    const fields = ['Brand', 'Name', 'Tag1', 'Tag2', 'Tag3'];
    fields.forEach(f => {
        const v1 = r1[f];
        const v2 = r2[f];
        if (v1 != v2) {
             if (!v1 && !v2) return;
             differences.push(`ID ${id} [${f}]: User="${v1}" | System="${v2}"`);
        }
    });
});

if (differences.length === 0) {
    console.log('Files are identical.');
} else {
    console.log(`Found ${differences.length} differences:`);
    console.log(differences.join('\n'));
}

console.log(`\nNon-English Names found: ${nonEnglishNames.length}`);
if (nonEnglishNames.length > 0) console.log(nonEnglishNames.slice(0, 5));

console.log('\nSample ID 70 Data (User File):', {
    Name: map1.get(70)['Name'],
    Brand: map1.get(70)['Brand'],
    Tag1: map1.get(70)['Tag1'],
    Tag2: map1.get(70)['Tag2'],
    Tag3: map1.get(70)['Tag3']
});
