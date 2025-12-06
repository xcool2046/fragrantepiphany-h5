
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
    
    // Fix ID 3476 (Ten of Cups / Wood Sage - Choice D)
    // Current EN: "You move steadily..." (Knight of Pentacles)
    // Target EN: "You experience emotional fulfillment..."
    
    // Note: I will search by Card ID 74 and Choice D to be safe, or just ID if known.
    // My previous output said ID 3476.
    
    const p = await perfumeRepo.findOne({ where: { card_id: 74, product_name: 'Wood Sage & Sea Salt' } as any });
    
    if (p) {
        console.log(`Updating ID ${p.id} (${p.product_name})...`);
        
        // Correct Translation for Ten of Cups
        const newDescEn = "You experience emotional fulfillment and harmony; love and warmth make you feel complete. Jo Malone's Wood Sage & Sea Salt crowns this happy moment—the freshness of sea breeze and the warmth of sage build an emotional community full of belonging. This scent witnesses the home of love you create.";
        
        // Use repo update
        await perfumeRepo.update(p.id, { description_en: newDescEn });
        console.log('Update success.');
        
        // Check other choices just in case
        const others = await perfumeRepo.find({ where: { card_id: 74 } });
        others.forEach(o => {
            console.log(`[Check] ID ${o.id} (${o.product_name}): ${o.description_en?.substring(0, 30)}...`);
        });
        
    } else {
        console.error('Target perfume not found!');
    }
    
    await AppDataSource.destroy();
}

main();
