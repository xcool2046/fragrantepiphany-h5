
import * as XLSX from 'xlsx';
import * as path from 'path';

// List of card names that are missing descriptions (from previous step)
const missingCards = [
    '愚者', '女祭司', '命运之轮', '宝剑八', '教皇', '恋人', '宝剑侍者', 
    '力量', '隐士', '正义', '倒吊人', '宝剑国王', '高塔', '太阳', '审判', 
    '宝剑一', '宝剑二', '宝剑四', '宝剑七', '宝剑骑士', 
    '星币四', '星币七', 
    '圣杯皇后', 
    '权杖一', '权杖二', '权杖三', '权杖四', '权杖五', '权杖八', '权杖九', '权杖侍者', '权杖骑士', '权杖皇后',
    '圣杯一', '圣杯二', '圣杯四', '圣杯八', '圣杯十', '圣杯国王'
];

async function main() {
    console.log('Reading Excel...');
    const workbook = XLSX.readFile('/home/projects/h5/master (3).xlsx');
    const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
    const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1 });

    console.log('Inspecting Rows for Missing Cards...');
    
    // Header row is 0
    // Col 0 is Card Name
    
    for (let i = 1; i < mappingData.length; i++) {
        const row: any = mappingData[i];
        if (!row[0]) continue;
        const excelCardName = row[0].toString().trim();
        
        // Check if this row roughly matches one of our missing cards
        // We do a loose check because of Trad/Simp diffs
        // e.g. "聖杯" includes "圣杯" if we convert? 
        // Let's just print any that contain related chars
        
        const isSuspicious = missingCards.some(m => {
            // Check for key characters
            const key = m.replace(/[一二三四五六七八九十JKQ]/g, '').replace(/King|Queen|Knight|Page/g, ''); 
            // "圣杯", "权杖"
            // "聖杯" vs "圣杯"
            const simp = key;
            const trad = key.replace('圣杯', '聖杯').replace('权杖', '權杖').replace('宝剑', '寶劍').replace('星币', '星幣');
            
            return excelCardName.includes(simp) || excelCardName.includes(trad);
        });

        if (isSuspicious) {
            console.log(`Row ${i+1}: "${excelCardName}"`);
        }
    }
}

main();
