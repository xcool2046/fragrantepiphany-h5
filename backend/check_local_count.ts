
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_DATABASE || 'tarot',
  entities: [Perfume],
  synchronize: false,
});

async function check() {
  try {
    await AppDataSource.initialize();
    const count = await AppDataSource.getRepository(Perfume).count();
    console.log(`Local Perfume Count: ${count}`);
    await AppDataSource.destroy();
  } catch (e) {
    console.error(e);
  }
}

check();
