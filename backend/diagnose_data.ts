
import { DataSource } from 'typeorm';
import { Card } from './src/entities/card.entity';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Card, Perfume],
  synchronize: false,
});

async function diagnose() {
  await AppDataSource.initialize();
  const cardRepo = AppDataSource.getRepository(Card);
  const perfumeRepo = AppDataSource.getRepository(Perfume);

  console.log('--- DIAGNOSTIC START ---');

  // 1. Check Cards
  const cardCount = await cardRepo.count();
  console.log(`Card Count: ${cardCount}`);
  
  const sampleCards = await cardRepo.find({ take: 5, order: { id: 'ASC' } });
  console.log('Sample Cards (Top 5):');
  sampleCards.forEach(c => console.log(`  ID: ${c.id}, Code: ${c.code}, Name: ${c.name_zh}/${c.name_en}`));

  const invalidCodes = await cardRepo.createQueryBuilder('c')
    .where("code NOT SIMILAR TO '[0-9]{2}'")
    .getCount();
  console.log(`Cards with invalid format codes: ${invalidCodes}`);

  // 2. Check Perfumes
  const perfumeCount = await perfumeRepo.count();
  const activePerfumeCount = await perfumeRepo.count({ where: { status: 'active' } });
  console.log(`Perfume Count: ${perfumeCount} (Active: ${activePerfumeCount})`);

  // 3. Check Fallback Perfume (ID 22)
  const fallback = await perfumeRepo.findOne({ where: { id: 22 } });
  if (fallback) {
      console.log(`Fallback Perfume (ID 22): Found. Status: ${fallback.status}, CardID: ${fallback.card_id}`);
  } else {
      console.log(`Fallback Perfume (ID 22): NOT FOUND`);
  }

  // 4. Check Association
  // Find a card that HAS a perfume
  const perfumeWithCard = await perfumeRepo.findOne({ where: { status: 'active' } });
  if (perfumeWithCard) {
      console.log(`Active Perfume Sample: ID ${perfumeWithCard.id} -> CardID ${perfumeWithCard.card_id}`);
      const relatedCard = await cardRepo.findOne({ where: { id: perfumeWithCard.card_id } });
      console.log(`  -> Related Card: ${relatedCard ? `${relatedCard.code} (${relatedCard.name_zh})` : 'MISSING'}`);
  } else {
      console.log('No active perfumes found to check association.');
  }

  await AppDataSource.destroy();
  console.log('--- DIAGNOSTIC END ---');
}

diagnose().catch(console.error);
