
import { DataSource } from 'typeorm';
import { Perfume } from '../src/entities/perfume.entity';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load env from root
dotenv.config({ path: path.join(__dirname, '../../.env') });

const AppDataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'db',
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME || 'tarot',
    password: process.env.DB_PASSWORD || 'tarot',
    database: process.env.DB_DATABASE || 'tarot',
    entities: [Perfume],
    synchronize: false,
});

async function verify() {
    try {
        await AppDataSource.initialize();
        console.log('Database connected.');

        const repo = AppDataSource.getRepository(Perfume);

        // Scenario 1: Q2=A (Rose Garden), Card=Death
        console.log('\n--- Verifying Scenario 1 (Death + A) ---');
        const s1 = await repo.findOne({
            where: {
                card_name: 'Death',
                scene_choice: 'A. 玫瑰园'
            }
        });

        if (s1) {
            console.log(`Found Perfume: ${s1.brand_name} - ${s1.product_name}`);
            console.log(`English: ${s1.brand_name_en} - ${s1.product_name_en}`);
            console.log(`Tags (EN): ${s1.tags_en}`);
            
            const matchBrand = s1.brand_name_en === "Le Labo" || s1.brand_name === "Le Labo";
            const matchName = s1.product_name_en === "Rose 31" || s1.product_name === "Rose 31";
            
            if (matchBrand && matchName) {
                console.log('✅ Scenario 1 MATCHES!');
            } else {
                console.error('❌ Scenario 1 MISMATCH!');
                console.error('Expected: Le Labo - Rose 31');
            }
        } else {
            console.error('❌ Scenario 1 Perfume NOT FOUND in DB!');
        }

        // Scenario 2: Q2=C (Cafe), Card=The Fool
        console.log('\n--- Verifying Scenario 2 (The Fool + C) ---');
        const s2 = await repo.findOne({
            where: {
                card_name: 'The Fool',
                scene_choice: 'C. 咖啡馆'
            }
        });

        if (s2) {
            console.log(`Found Perfume: ${s2.brand_name} - ${s2.product_name}`);
            console.log(`English: ${s2.brand_name_en} - ${s2.product_name_en}`);
            console.log(`Tags (EN): ${s2.tags_en}`);

            const matchBrand = s2.brand_name_en === "Comptoir Sud Pacifique" || s2.brand_name === "Comptoir Sud Pacifique";
            const matchName = s2.product_name_en === "Vanille Abricot" || s2.product_name === "Vanille Abricot";

            if (matchBrand && matchName) {
                console.log('✅ Scenario 2 MATCHES!');
            } else {
                console.error('❌ Scenario 2 MISMATCH!');
                console.error('Expected: Comptoir Sud Pacifique - Vanille Abricot');
            }
        } else {
            console.error('❌ Scenario 2 Perfume NOT FOUND in DB!');
        }

        await AppDataSource.destroy();

    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

verify();
