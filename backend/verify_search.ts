
import { DataSource } from 'typeorm';
import { Interpretation } from './src/entities/interpretation.entity';
import { InterpretationService } from './src/interp/interp.service';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Interpretation],
  synchronize: false,
});

async function run() {
  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Interpretation);
  const service = new InterpretationService(repo);

  console.log('--- Verifying Search Restriction ---');

  // 1. Search by card_name (Should find results)
  const result1 = await service.findAll(1, 10, { keyword: 'Fool' });
  console.log(`Search 'Fool' (Card Name): Found ${result1.total} results.`);
  if (result1.total === 0) console.error('FAIL: Should have found "Fool".');

  // 2. Search by content (Should NOT find results)
  // "adventure" is likely in the interpretation of Fool or others
  const result2 = await service.findAll(1, 10, { keyword: 'adventure' });
  console.log(`Search 'adventure' (Content): Found ${result2.total} results.`);
  if (result2.total > 0) console.error('FAIL: Should NOT have found results for content keyword.');
  else console.log('PASS: Content search restricted.');

  await AppDataSource.destroy();
}

run().catch(console.error);
