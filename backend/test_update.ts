
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { Interpretation } from './src/entities/interpretation.entity';

config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USER || 'tarot',
  password: process.env.DB_PASSWORD || 'tarot',
  database: process.env.DB_NAME || 'tarot',
  entities: [Interpretation],
  synchronize: false,
});

async function testUpdate() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to DB');

    const repo = AppDataSource.getRepository(Interpretation);
    
    // 1. Find a target
    const target = await repo.findOne({ where: { id: 1 } });
    if (!target) {
        console.log('No target found with ID 1');
        return;
    }
    console.log('Original Summary EN:', target.summary_en);

    // 2. Update
    const newSummary = `Updated by script at ${new Date().toISOString()}`;
    await repo.update(1, { summary_en: newSummary });
    console.log('Update command executed.');

    // 3. Verify
    const updated = await repo.findOne({ where: { id: 1 } });
    console.log('New Summary EN:', updated?.summary_en);

    if (updated?.summary_en === newSummary) {
        console.log('SUCCESS: Update persisted.');
    } else {
        console.log('FAILURE: Update did not persist.');
    }

    // 4. Revert
    await repo.update(1, { summary_en: target.summary_en });
    console.log('Reverted to original.');

    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error:', err);
  }
}

testUpdate();
