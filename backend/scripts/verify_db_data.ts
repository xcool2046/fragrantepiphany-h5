
import { DataSource } from 'typeorm';
import { Interpretation } from '../src/entities/interpretation.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'tarot',
  password: 'tarot',
  database: 'tarot',
  entities: [Interpretation],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Interpretation);

    const sample = await repo.findOne({
      where: { card_name: '宝剑八', category: 'Career', position: 'past' }
    });

    if (sample) {
      console.log('Sample Record Found:');
      console.log('Card Name:', sample.card_name);
      console.log('Category:', sample.category);
      console.log('Position:', sample.position);
      console.log('Interpretation EN:', sample.interpretation_en ? sample.interpretation_en.substring(0, 50) + '...' : 'NULL');
      console.log('Summary EN:', sample.summary_en);
      
      if (sample.interpretation_en && sample.summary_en) {
          console.log('VERIFICATION PASSED: English fields are populated.');
      } else {
          console.error('VERIFICATION FAILED: English fields are missing.');
          process.exit(1);
      }
    } else {
      console.error('Sample record not found.');
      process.exit(1);
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
