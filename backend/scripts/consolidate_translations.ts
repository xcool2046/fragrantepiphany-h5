
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const batch1 = JSON.parse(fs.readFileSync(path.join(__dirname, '../perfume_translations_batch_new_1.json'), 'utf-8'));
    const batch2 = JSON.parse(fs.readFileSync(path.join(__dirname, '../perfume_translations_batch_new_2.json'), 'utf-8'));
    const batch3 = JSON.parse(fs.readFileSync(path.join(__dirname, '../perfume_translations_batch_new_3.json'), 'utf-8'));
    const batch4 = JSON.parse(fs.readFileSync(path.join(__dirname, '../perfume_translations_batch_new_4.json'), 'utf-8'));

    // Combine
    const allData = [...batch1, ...batch2, ...batch3, ...batch4];

    // Sort by ID to be safe (though source order might already be sorted, explicit sort is better)
    // Actually the source list was ordered by Excel rows.
    // Let's just keep the concatenation or sort by something if needed?
    // The previous logic relied on "Card + Choice" mapping.
    // Each item has: id (unique ID for master entry), card_name, choice, brand, product, description_zh, description_en.
    
    // We should ensure we have 312 items.
    console.log(`Total items: ${allData.length}`);
    if (allData.length !== 312) {
        console.warn(`Warning: Expected 312 items, got ${allData.length}`);
    }

    const outputPath = path.join(__dirname, '../perfume_translations_consolidated.json');
    fs.writeFileSync(outputPath, JSON.stringify(allData, null, 2));
    console.log(`Successfully consolidated to ${outputPath}`);
}

main();
