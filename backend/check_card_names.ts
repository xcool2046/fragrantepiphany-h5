
import { DataSource } from 'typeorm';
import { Card } from './src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: 'postgres://tarot:tarot@localhost:5432/tarot',
  entities: [Card],
  synchronize: false,
});

async function checkCardNames() {
  await AppDataSource.initialize();
  const cardRepo = AppDataSource.getRepository(Card);

  const suits = ['Cups', 'Pentacles', 'Swords', 'Wands'];
  
  for (const suit of suits) {
    console.log(`\nChecking cards with "${suit}" in name_en...`);
    const cards = await cardRepo.createQueryBuilder('c')
      .where('c.name_en ILIKE :kw', { kw: `%${suit}%` })
      .getMany();

    if (cards.length === 0) {
      console.log(`No cards found for ${suit}.`);
    } else {
      console.log(`Found ${cards.length} cards.`);
      // Print first 3 as sample
      cards.slice(0, 3).forEach(c => {
        console.log(`[${c.code}] EN: "${c.name_en}", ZH: "${c.name_zh}"`);
      });
    }
  }

  await AppDataSource.destroy();
}

checkCardNames().catch(console.error);
