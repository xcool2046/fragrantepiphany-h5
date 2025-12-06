
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';

import { batch1 } from './poetic_translations_batch1';
import { batch2 } from './poetic_translations_batch2';
import { batch3 } from './poetic_translations_batch3';
import { batch4 } from './poetic_translations_batch4';

const allUpdates = [
    ...batch1,
    ...batch2,
    ...batch3,
    ...batch4
];

async function main() {
    console.log('Connecting to database...');
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    console.log(`Starting update for ${allUpdates.length} items...`);
    
    let successCount = 0;
    let errorCount = 0;

    // Use a transaction or just sequential updates
    // Sequential is safer for visibility
    for (const update of allUpdates) {
        try {
            await perfumeRepo.update(update.id, { description_en: update.desc_en });
            
            // Log every 20 items to show progress without spam
            if ((successCount + 1) % 20 === 0) {
                console.log(`Progress: Updated ${successCount + 1} items...`);
            }
            successCount++;
        } catch (err) {
            console.error(`Failed to update ID ${update.id}:`, err);
            errorCount++;
        }
    }
    
    console.log('------------------------------------------------');
    console.log(`Update Complete.`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors:  ${errorCount}`);
    console.log('------------------------------------------------');
    
    await AppDataSource.destroy();
}

main().catch(err => {
    console.error('Fatal error:', err);
    process.exit(1);
});
