
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
    
    // Check Card 56 vs 76 (Sole di Positano)
    const p1 = await perfumeRepo.findOne({ where: { card_id: 56, product_name: 'Sole di Positano' } as any });
    const p2 = await perfumeRepo.findOne({ where: { card_id: 76, product_name: 'Sole di Positano' } as any });
    
    if (p1 && p2) {
        console.log(`\nCard 56 (ID ${p1.id}): ${p1.description}`);
        console.log(`Card 76 (ID ${p2.id}): ${p2.description}`);
        console.log(`EN Shared: ${p1.description_en === p2.description_en}`);
    }
    
    // Check Card 25 vs 54 (Bluebell / La Chasse)
    const p3 = await perfumeRepo.findOne({ where: { card_id: 25, product_name: 'Bluebell' } as any });
    // Note: Output said ID 3393 is La Chasse (Card 54).
    const p4 = await perfumeRepo.findOne({ where: { card_id: 54, product_name: 'La Chasse aux Papillons' } as any });
    
    if (p3 && p4) {
        console.log(`\nCard 25 (ID ${p3.id}): ${p3.description}`);
        console.log(`Card 54 (ID ${p4.id}): ${p4.description}`);
        console.log(`EN Shared: ${p3.description_en === p4.description_en}`);
    }

    await AppDataSource.destroy();
}

main();
