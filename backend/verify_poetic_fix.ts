
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';

// Key IDs to check
const checkIds = [
    3474, // Ten of Cups - Santal 33
    3277, // Three of Swords - Bluebell
    3434, // King of Pentacles - Santal 33 (Should be different from 3474)
    3393, // Four of Wands - La Chasse
    3253  // Moon - Bluebell (Should be different from 3277)
];

async function main() {
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    console.log('--- Verification Report ---');
    
    for (const id of checkIds) {
        const p = await perfumeRepo.findOneBy({ id });
        if (p) {
            console.log(`\n[ID: ${p.id}] Card: ${p.card_id} | Name: ${p.product_name}`);
            console.log(`DESC_ZH: ${p.description}`);
            console.log(`DESC_EN: ${p.description_en}`);
            console.log('------------------------------------------------');
        } else {
            console.log(`\n[ID: ${id}] NOT FOUND`);
        }
    }
    
    await AppDataSource.destroy();
}

main();
