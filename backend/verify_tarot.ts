
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

async function verify() {
  try {
    await AppDataSource.initialize();
    const result = await AppDataSource.query('SELECT count(*) FROM "tarot_interpretations"');
    console.log(`Total Interpretations: ${result[0].count}`);
    
    const countResult = await AppDataSource.query('SELECT count(*) FROM "tarot_interpretations"');
    console.log(`Total Interpretations: ${countResult[0].count}`);

    // Check for 'The Fool'
    const foolEn = await AppDataSource.query(`SELECT count(*) FROM "tarot_interpretations" WHERE "card_name" = 'The Fool'`);
    console.log(`Count 'The Fool': ${foolEn[0].count}`);

    // Check for '愚人牌'
    const foolCn = await AppDataSource.query(`SELECT count(*) FROM "tarot_interpretations" WHERE "card_name" = '愚人牌'`);
    console.log(`Count '愚人牌': ${foolCn[0].count}`);
    
    // Show a sample of '愚人牌'
    if (parseInt(foolCn[0].count) > 0) {
        const sampleCn = await AppDataSource.query(`SELECT * FROM "tarot_interpretations" WHERE "card_name" = '愚人牌' LIMIT 1`);
        console.log('Sample (愚人牌):', sampleCn[0]);
    }

    // Show a sample of 'The Fool'
    if (parseInt(foolEn[0].count) > 0) {
        const sampleEn = await AppDataSource.query(`SELECT * FROM "tarot_interpretations" WHERE "card_name" = 'The Fool' LIMIT 1`);
        console.log('Sample (The Fool):', sampleEn[0]);
    }

    
    await AppDataSource.destroy();
  } catch (err) {
    console.error('Error:', err);
  }
}

verify();
