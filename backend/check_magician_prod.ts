
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
    const card = await AppDataSource.getRepository(Card).findOne({ where: { code: '01' } });
    console.log('Magician Card:', JSON.stringify(card, null, 2));
    
    const search = await AppDataSource.getRepository(Card)
      .createQueryBuilder('card')
      .where('card.name_zh ILIKE :kw', { kw: '%魔术师%' })
      .getMany();
    console.log('Search "魔术师" result:', search.length);
    
    await AppDataSource.destroy();
  } catch (e) {
    console.error(e);
  }
}

check();
