import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Card } from '../src/entities/card.entity';
import { Repository } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const repo = app.get<Repository<Card>>(getRepositoryToken(Card));
  
  const cardsToCheck = ['The High Priestess', 'The Empress', 'The Fool', 'Queen of Swords', 'King of Swords', 'Six of Swords'];
  const cards = await repo.find({ where: cardsToCheck.map(name => ({ name_en: name })) });
  
  console.log('Card Codes:');
  cards.forEach(c => console.log(`${c.code}: ${c.name_en}`));

  const runner = app.get(getRepositoryToken(Card)).manager.connection.createQueryRunner();
  await runner.connect();
  
  console.log('\nInterpretations (The Fool - Past):');
  const categories = ['Career', 'Love', 'Self'];
  for (const cat of categories) {
      const res = await runner.query(`SELECT id, card_name, category, position, interpretation_en FROM tarot_interpretations WHERE card_name = 'Queen of Swords' AND category = '${cat}'`);
      console.log(`\n--- ${cat} (Count: ${res.length}) ---`);
      for (const r of res) {
          console.log(`ID: ${r.id}, Pos: ${r.position}`);
          console.log(`Text EN: ${r.interpretation_en ? r.interpretation_en.substring(0, 50) + '...' : 'NULL'}`);
      }
  }
  await runner.release();
  
  await app.close();
}
bootstrap();
