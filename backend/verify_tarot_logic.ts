
import { DataSource } from 'typeorm';

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@localhost:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [], // No entities needed for raw query
  synchronize: false,
});

async function verify() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected');

        // Check 'The Fool' in all categories to find Perfume Mapping text
        const res = await AppDataSource.query(
            `SELECT category, position, interpretation_zh, recommendation_zh, summary_zh 
             FROM tarot_interpretations 
             WHERE card_name = 'The Fool' AND position = 'Present'`
        );
        
        if (res && res.length > 0) {
            console.log('Found "The Fool" (Present) records:');
            console.log(JSON.stringify(res, null, 2));
        } else {
            console.log('No "The Fool" (Present) records found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

verify();
