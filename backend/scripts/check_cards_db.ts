
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Connected to DB');

    const cards = await AppDataSource.query('SELECT id, name_en, name_zh FROM cards ORDER BY id');
    console.log('Total Cards:', cards.length);
    
    const targetCards = ['Temperance', 'The Devil', 'The Sun', 'Judgement'];
    
    console.log('\n--- Checking Target Cards ---');
    cards.forEach((c: any) => {
        if (targetCards.some(t => c.name_en.includes(t))) {
            console.log(`ID: ${c.id}, EN: ${c.name_en}, ZH: ${c.name_zh}`);
        }
    });

    console.log('\n--- Checking All Cards with "节" or "恶" or "太" or "审" ---');
    cards.forEach((c: any) => {
        if (c.name_zh && (c.name_zh.includes('节') || c.name_zh.includes('恶') || c.name_zh.includes('太') || c.name_zh.includes('审'))) {
             console.log(`ID: ${c.id}, EN: ${c.name_en}, ZH: ${c.name_zh}`);
        }
    });

    await AppDataSource.destroy();
  } catch (error) {
    console.error(error);
  }
}

run();
