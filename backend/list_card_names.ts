
import { DataSource } from 'typeorm';
import { Card } from './src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Card],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();
  const cards = await AppDataSource.getRepository(Card).find();
  cards.forEach(c => console.log(`${c.name_zh} | ${c.name_en}`));
  await AppDataSource.destroy();
}

run().catch(console.error);
