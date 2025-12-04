
import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

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
    console.log('Connected to database...');

    const jsonPath = path.join(__dirname, '../career_en_fixed.json');
    if (!fs.existsSync(jsonPath)) {
        console.error('JSON file not found:', jsonPath);
        process.exit(1);
    }

    const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    console.log(`Loaded ${data.length} records from JSON.`);

    for (const item of data) {
        const cardName = item.card;
        const category = 'Career';

        // Update Past
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Past'`,
            [item.past_en, item.sentence_en, cardName, category]
        );

        // Update Present
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Present'`,
            [item.present_en, item.sentence_en, cardName, category]
        );

        // Update Future
        await AppDataSource.query(
            `UPDATE "tarot_interpretations" 
             SET "interpretation_en" = $1, "recommendation_en" = $2
             WHERE "card_name" = $3 AND "category" = $4 AND "position" = 'Future'`,
            [item.future_en, item.sentence_en, cardName, category]
        );
    }

    console.log('Career English data updated successfully!');
    await AppDataSource.destroy();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

bootstrap();
