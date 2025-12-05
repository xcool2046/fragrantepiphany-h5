
import * as XLSX from 'xlsx';
import * as path from 'path';

const filePath = '/home/projects/h5/master (3).xlsx';
const workbook = XLSX.readFile(filePath);

// 1. Load Mapping
const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
const mappingData = XLSX.utils.sheet_to_json<any[]>(mappingSheet, { header: 1 });

// 2. Load Master
const masterSheet = workbook.Sheets['Perfume master'];
const masterData = XLSX.utils.sheet_to_json<any>(masterSheet);
const masterMap = new Map(masterData.map(r => [r['UNIQUE ID'], r]));

// Scenario 1 Inputs
const targetCard = 'Death'; // Need to find Chinese name likely, or check if mapping has English
const targetOption = 'A'; // Column 1 (Index 1)

// Find Card Row
let cardRow: any[] | undefined;
// Mapping sheet structure: Col 0 is Card Name (Chinese usually)
// Need to find which Chinese name corresponds to "Death"
// Or maybe the mapping sheet has English names? Let's check the first few rows again or search.
// Based on previous output, "魔術師" was there. "Death" is likely "死神".

const cardNameMap: Record<string, string> = {
    'Death': '死神'
};

const targetCardZh = cardNameMap[targetCard];

console.log(`Searching for card: ${targetCard} (${targetCardZh})`);

for (let i = 1; i < mappingData.length; i++) {
    if (mappingData[i][0] === targetCardZh) {
        cardRow = mappingData[i];
        break;
    }
}

if (!cardRow) {
    console.error('Card not found in mapping!');
    // Try searching for "Death" directly just in case
    for (let i = 1; i < mappingData.length; i++) {
        if (mappingData[i][0] === targetCard) {
            cardRow = mappingData[i];
            break;
        }
    }
}

if (cardRow) {
    console.log('Found Card Row:', cardRow);
    
    // Option A is at Index 1 (ID) and Index 3 (Description)
    // Wait, let's re-verify indices from previous step
    // Col 0: Card
    // Col 1: A ID
    // Col 2: A Name (Visual aid)
    // Col 3: A Desc
    
    const perfumeId = cardRow[1];
    const expectedDesc = cardRow[3];
    
    console.log(`Option A -> Perfume ID: ${perfumeId}`);
    
    const perfume = masterMap.get(perfumeId);
    if (perfume) {
        console.log('--- Actual Data from Excel ---');
        console.log('Brand:', perfume['Brand']);
        console.log('Name:', perfume['Name']);
        console.log('Tags:', [perfume['Tag1'], perfume['Tag2'], perfume['Tag3']]);
        console.log('Description (from Mapping):', expectedDesc);
        
        // Expected from Logic Sheet
        const expectedName = 'Le Labo - Rose 31'; // Logic sheet says "Le Labo - Rose 31"
        // Note: Excel "Name" is usually just product name "Rose 31", Brand is "Le Labo"
        
        console.log('\n--- Verification ---');
        console.log(`Brand Match: ${perfume['Brand'] === 'Le Labo' ? 'YES' : 'NO'} (${perfume['Brand']})`);
        console.log(`Name Match: ${perfume['Name'] === 'Rose 31' ? 'YES' : 'NO'} (${perfume['Name']})`);
        // Logic sheet combined them: "Le Labo - Rose 31"
        
    } else {
        console.error('Perfume ID not found in Master!');
    }

} else {
    console.error('Card still not found.');
}
