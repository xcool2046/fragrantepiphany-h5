
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);

const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
const mappingData = XLSX.utils.sheet_to_json<any[]>(mappingSheet, { header: 1 });

const masterSheet = workbook.Sheets['Perfume master'];
const masterData = XLSX.utils.sheet_to_json<any>(masterSheet);
const masterMap = new Map(masterData.map(r => [r['UNIQUE ID'], r]));

// Scenario 2 Inputs
const targetCardZh = '愚者'; 
const targetOption = 'C'; // Column 7 (Index 7)

console.log(`Searching for card: ${targetCardZh}`);

let cardRow: any[] | undefined;
for (let i = 1; i < mappingData.length; i++) {
    if (mappingData[i][0] === targetCardZh) {
        cardRow = mappingData[i];
        break;
    }
}

if (cardRow) {
    console.log('Found Card Row:', cardRow);
    
    // Option C is at Index 7 (ID) and Index 9 (Description)
    const perfumeId = cardRow[7];
    const expectedDesc = cardRow[9];
    
    console.log(`Option C -> Perfume ID: ${perfumeId}`);
    
    const perfume = masterMap.get(perfumeId);
    if (perfume) {
        console.log('--- Actual Data from Excel ---');
        console.log('Brand:', perfume['Brand']);
        console.log('Name:', perfume['Name']);
        console.log('Tags:', [perfume['Tag1'], perfume['Tag2'], perfume['Tag3']]);
        console.log('Description (from Mapping):', expectedDesc);
        
        // Expected from Logic Sheet
        // Perfume: Comptoir Sud Pacifique - Vanille Abricot
        
        console.log('\n--- Verification ---');
        console.log(`Brand Match: ${perfume['Brand'] === 'Comptoir Sud Pacifique' ? 'YES' : 'NO'} (${perfume['Brand']})`);
        console.log(`Name Match: ${perfume['Name'] === 'Vanille Abricot' ? 'YES' : 'NO'} (${perfume['Name']})`);
        
    } else {
        console.error('Perfume ID not found in Master!');
    }

} else {
    console.error('Card not found.');
}
