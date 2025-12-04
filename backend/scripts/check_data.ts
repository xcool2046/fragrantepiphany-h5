import { DataSource } from 'typeorm';
import { Question } from '../src/entities/question.entity';
import { Card } from '../src/entities/card.entity';
import { config } from 'dotenv';
import * as path from 'path';

config({ path: path.resolve(__dirname, '../.env') });

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
  console.error('Error: DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Question, Card],
  synchronize: false,
});

async function checkData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected');

    const questionCount = await AppDataSource.getRepository(Question).count();
    console.log(`Questions count: ${questionCount}`);
    
    if (questionCount > 0) {
      const questions = await AppDataSource.getRepository(Question).find();
      console.log('Questions:', JSON.stringify(questions, null, 2));
    }

    const cardCount = await AppDataSource.getRepository(Card).count();
    console.log(`Cards count: ${cardCount}`);
    if (cardCount > 0) {
      const cards = await AppDataSource.getRepository(Card).find({ take: 5 });
      console.log('Cards sample:', JSON.stringify(cards, null, 2));
    }

    console.log('Rules table已移除，未做检查。');

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkData();
