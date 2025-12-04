
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import { Card } from '../src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Interpretation, Card],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    const interpRepo = AppDataSource.getRepository(Interpretation);
    const cardRepo = AppDataSource.getRepository(Card);

    console.log('--- Checking Cards Table ---');
    const cards = await cardRepo.find({ take: 5 });
    cards.forEach(c => console.log(`ID: ${c.id}, Code: ${c.code}, Name EN: "${c.name_en}"`));

    console.log('\n--- Checking Interpretations Table ---');
    const interps = await interpRepo.find({ take: 5 });
    interps.forEach(i => console.log(`ID: ${i.id}, Card Name: "${i.card_name}", Category: ${i.category}, Pos: ${i.position}`));

    console.log('\n--- Testing Match ---');
    if (cards.length > 0) {
      console.log('\n--- Testing Specific Card: King of Swords ---');
    const cardName = "King of Swords";
    const categories = ['Self', 'Career', 'Love'];
    const positions = ['Past', 'Present', 'Future'];

    for (const cat of categories) {
        for (const pos of positions) {
            const record = await interpRepo.findOne({
                where: { card_name: cardName, category: cat, position: pos }
            });
            if (record) {
                console.log(`[OK] Found ${cardName} / ${cat} / ${pos}`);
            } else {
                console.error(`[MISSING] ${cardName} / ${cat} / ${pos}`);
            }
        }
    }
        const card = cards[0];
        const match = await interpRepo.findOne({
            where: { card_name: card.name_en }
        });
        if (match) {
            console.log(`SUCCESS: Found interpretation for card "${card.name_en}"`);
        } else {
            console.error(`FAILURE: No interpretation found for card "${card.name_en}"`);
            
            // Try fuzzy match
            const fuzzy = await interpRepo.createQueryBuilder('i')
                .where('i.card_name ILIKE :name', { name: `%${card.name_en}%` })
                .getOne();
            if (fuzzy) {
                console.log(`PARTIAL MATCH: Found "${fuzzy.card_name}" for "${card.name_en}"`);
            }
        }
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
