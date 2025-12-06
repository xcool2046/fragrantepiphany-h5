
import * as XLSX from 'xlsx';

async function main() {
    console.log('Reading Excel...');
    const workbook = XLSX.readFile('/home/projects/h5/master (3).xlsx');
    const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
    const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1 });

    console.log('Inspecting Row 2 (Index 1) raw content:');
    console.log(JSON.stringify(mappingData[1]));
    
    console.log('Inspecting Row 3 (Index 2) raw content:');
    console.log(JSON.stringify(mappingData[2]));

    // Find a known missing card row and print it
    const targetName = '聖杯四'; // One of the missing ones
    for (let i = 0; i < mappingData.length; i++) {
        const row: any = mappingData[i];
        if (row[0] && row[0].toString().includes(targetName)) {
            console.log(`\nFound ${targetName} at Row ${i}:`);
            console.log(JSON.stringify(row));
            break;
        }
    }
}

main();
