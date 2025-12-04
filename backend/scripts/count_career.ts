
import { DataSource } from 'typeorm';
import { config } from 'dotenv';

config();

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [],
  synchronize: false,
});

async function bootstrap() {
  try {
    await AppDataSource.initialize();
    const res = await AppDataSource.query("SELECT COUNT(*) as count FROM tarot_interpretations WHERE category = 'Career'");
    console.log('Career Records Count:', res[0].count);
    
    // Also check distinct cards
    const distinct = await AppDataSource.query("SELECT COUNT(DISTINCT card_name) as count FROM tarot_interpretations WHERE category = 'Career'");
    console.log('Distinct Cards Count:', distinct[0].count);

    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
  }
}

bootstrap();
