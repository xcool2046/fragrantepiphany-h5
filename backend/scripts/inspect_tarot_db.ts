
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Interpretation],
  synchronize: false,
});

async function inspect() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Interpretation);

  const samples = await repo.find({ where: { category: 'Self' }, take: 5 });
  
  console.log('--- Sample Interpretations (Self) ---');
  for (const item of samples) {
    console.log(`ID: ${item.id}, Card: ${item.card_name}, Category: ${item.category}, Position: ${item.position}`);
    console.log(`Summary (ZH): ${item.summary_zh}`);
    console.log(`Interpretation (ZH): ${item.interpretation_zh?.substring(0, 50)}...`);
    console.log(`Interpretation (EN): ${item.interpretation_en?.substring(0, 50)}...`);
    console.log('------------------------------');
  }

  await AppDataSource.destroy();
}

inspect().catch(console.error);
