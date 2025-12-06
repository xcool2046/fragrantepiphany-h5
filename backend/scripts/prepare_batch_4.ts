
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const sourcePath = path.join(__dirname, '../perfume_source_for_translation.json');
    if (!fs.existsSync(sourcePath)) {
        console.error('Source file not found');
        process.exit(1);
    }
    const rawData = fs.readFileSync(sourcePath, 'utf-8');
    const allData = JSON.parse(rawData);
    
    // Batch 4: 240 to end
    const batchData = allData.slice(240);
    
    const outputPath = path.join(__dirname, '../batch_4_source.json');
    fs.writeFileSync(outputPath, JSON.stringify(batchData, null, 2));
    console.log(`Wrote ${batchData.length} items to ${outputPath}`);
}

main();
