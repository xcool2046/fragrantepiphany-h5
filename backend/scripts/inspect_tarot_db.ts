
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    
    // Check Strength card for Career category
    const res = await AppDataSource.query(
      `SELECT card_name, interpretation_en, interpretation_zh 
       FROM tarot_interpretations 
       WHERE category = 'Career' AND card_name = 'Strength'
       LIMIT 1`
    );
    
    console.log('--- Strength (Career) Interpretations ---');
    if (res && res.length > 0) {
        console.log(`EN: ${res[0].interpretation_en.substring(0, 100)}...`);
        console.log(`ZH: ${res[0].interpretation_zh.substring(0, 100)}...`);
    } else {
        console.log('No data found');
    }
    
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
  }
}

run();
