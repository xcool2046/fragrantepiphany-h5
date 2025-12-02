
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_NAME || 'tarot',
  entities: [],
  synchronize: false,
});

async function reset() {
  try {
    await AppDataSource.initialize();
    console.log('Deleting migration record...');
    await AppDataSource.query(`DELETE FROM "migrations" WHERE "name" LIKE '%SeedTarotData%'`);
    console.log('Migration record deleted.');
    
    console.log('Cleaning up bad data...');
    await AppDataSource.query(`DELETE FROM "tarot_interpretations" WHERE "category" IN ('Career', 'Love', 'Self')`);
    console.log('Bad data deleted.');

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error:', err);
  }
}

reset();
