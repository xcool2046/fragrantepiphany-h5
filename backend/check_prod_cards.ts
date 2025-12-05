
import { DataSource } from 'typeorm';
import { Card } from './src/entities/card.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_DATABASE || 'tarot',
  entities: [Card],
  synchronize: false,
});

async function check() {
  try {
    await AppDataSource.initialize();
    const cards = await AppDataSource.getRepository(Card).find();
    console.log(`Total Cards in Prod: ${cards.length}`);
    
    // Print all cards to be sure
    cards.forEach(c => console.log(`${c.id}: ${c.name_en} = ${c.name_zh}`));
    
    await AppDataSource.destroy();
  } catch (e) {
    console.error(e);
  }
}

check();
