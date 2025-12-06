
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@localhost:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Perfume],
  synchronize: false,
});

async function checkValues() {
    try {
        await AppDataSource.initialize();
        // Check The Fool perfumes
        const res = await AppDataSource.query(
            `SELECT p.id, p.scene_choice, p.product_name, c.name_en 
             FROM perfumes p 
             JOIN cards c ON p.card_id = c.id 
             WHERE c.name_en = 'The Fool'`
        );
        console.log('Actual DB Values for The Fool:');
        console.log(JSON.stringify(res, null, 2));

        // Check Death perfumes
        const res2 = await AppDataSource.query(
            `SELECT p.id, p.scene_choice, p.product_name, c.name_en 
             FROM perfumes p 
             JOIN cards c ON p.card_id = c.id 
             WHERE c.name_en = 'Death'`
        );
        console.log('Actual DB Values for Death:');
        console.log(JSON.stringify(res2, null, 2));

    } catch (error) {
        console.error(error);
    } finally {
        await AppDataSource.destroy();
    }
}

checkValues();
