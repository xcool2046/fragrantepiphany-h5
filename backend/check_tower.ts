
import { DataSource } from 'typeorm';
import { Interpretation } from './src/entities/interpretation.entity';
import { Card } from './src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Interpretation, Card],
  synchronize: false,
});

async function check() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Interpretation);
  
  console.log('Checking for "The Tower"...');
  const results = await repo.find({
    where: { card_name: 'The Tower' }
  });
  
  console.log(`Found ${results.length} records for "The Tower".`);
  results.forEach(r => {
    console.log(`- Card: "${r.card_name}", Cat: ${r.category}, Pos: ${r.position}, Rec: ${r.recommendation_en ? 'EN' : 'No EN'} / ${r.recommendation_zh ? 'ZH' : 'No ZH'}`);
  });

  if (results.length === 0) {
      console.log("Checking all card names...");
      const all = await repo.createQueryBuilder('i').select('DISTINCT i.card_name').getRawMany();
      console.log("Available cards:", all.map(a => a.card_name));
  }

  await AppDataSource.destroy();
}

check().catch(console.error);
