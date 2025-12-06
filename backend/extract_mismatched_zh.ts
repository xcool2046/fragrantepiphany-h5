
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';
import * as fs from 'fs';

async function main() {
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    const perfumes = await perfumeRepo.find();
    const descMap = new Map<string, Perfume[]>();
    
    perfumes.forEach(p => {
        if (!p.description_en || p.description_en.length < 20) return;
        const desc = p.description_en.trim();
        if (!descMap.has(desc)) {
            descMap.set(desc, []);
        }
        descMap.get(desc)?.push(p);
    });
    
    const mismatched: any[] = [];
    
    for (const [desc, items] of descMap.entries()) {
        const uniqueCards = new Set(items.map(i => i.card_id));
        if (uniqueCards.size > 1) {
            // These descriptions are likely wrong for some entries (or all but one)
            // We will re-translate ALL of them to be safe and card-specific.
            for (const item of items) {
                mismatched.push({
                    id: item.id,
                    card_id: item.card_id,
                    product_name: item.product_name,
                    description_zh: item.description
                });
            }
        }
    }
    
    console.log(`Found ${mismatched.length} mismatched items.`);
    fs.writeFileSync('backend/mismatched_zh.json', JSON.stringify(mismatched, null, 2));
    
    await AppDataSource.destroy();
}

main();
