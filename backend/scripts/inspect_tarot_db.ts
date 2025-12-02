
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [Interpretation],
  synchronize: false,
});

async function inspect() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Interpretation);

  const samples = await repo.find({ take: 5 });
  
  console.log('--- Sample Interpretations ---');
  for (const item of samples) {
    console.log(`ID: ${item.id}, Card: ${item.card_name}, Category: ${item.category}, Position: ${item.position}`);
    console.log(`Summary (ZH): ${item.summary_zh}`);
    console.log(`Interpretation (ZH): ${item.interpretation_zh?.substring(0, 100)}...`); // Truncate for readability
    console.log('------------------------------');
  }

  await AppDataSource.destroy();
}

inspect().catch(console.error);
