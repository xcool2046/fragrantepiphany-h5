
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
    
    const perfumes = await perfumeRepo.find();
    const descMap = new Map<string, { id: number, cardId: number, name: string }[]>();
    
    perfumes.forEach(p => {
        if (!p.description_en || p.description_en.length < 20) return;
        const desc = p.description_en.trim();
        if (!descMap.has(desc)) {
            descMap.set(desc, []);
        }
        descMap.get(desc)?.push({ id: p.id, cardId: p.card_id, name: p.product_name });
    });
    
    let mismatchCount = 0;
    
    console.log('--- Duplicate Description Analysis ---');
    for (const [desc, items] of descMap.entries()) {
        const uniqueCards = new Set(items.map(i => i.cardId));
        if (uniqueCards.size > 1) {
            console.log(`\n[MISMATCH] Description shared by ${uniqueCards.size} Cards:`);
            console.log(`Desc: "${desc.substring(0, 50)}..."`);
            items.forEach(i => console.log(` - Card ${i.cardId}: ID ${i.id} (${i.name})`));
            mismatchCount++;
        }
    }
    
    console.log(`\nFound ${mismatchCount} suspicious description groups.`);
    
    await AppDataSource.destroy();
}

main();
