
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';

async function main() {
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    // Search for Ten of Cups
    // My previous logs said CardID 74 is "圣杯十" (Ten of Cups).
    // Let's search by internal Card ID 74.
    
    const perfumes = await perfumeRepo.find({ where: { card_id: 74 } });
    
    console.log(`Found ${perfumes.length} entries for Card ID 74.`);
    
    // Search Wood Sage & Sea Salt for Card 74
    const woodSage = await perfumeRepo.findOne({ where: { card_id: 74, product_name: 'Wood Sage & Sea Salt' } as any });
    // product_name is OK if I cast or fix entity usage, let's use as any to be safe
    // Actually, `check_tags.ts` failed on `product_name` check earlier without cast.
    
    if (woodSage) {
        console.log(`\n--- ID: ${woodSage.id} Choice: ${woodSage.scene_choice} ---`);
        console.log(`Product: ${woodSage.product_name}`);
        console.log(`Desc ZH: ${woodSage.description}`);
        console.log(`Desc EN: ${woodSage.description_en}`);
    } else {
        console.log('Wood Sage not found for Card 74');
    }
    
    await AppDataSource.destroy();
}

main();
