import { DataSource, Not, IsNull } from 'typeorm';
import { Perfume } from '../src/entities/perfume.entity';
import { Card } from '../src/entities/card.entity';
import { config } from 'dotenv';

config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@db:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Perfume, Card],
  synchronize: false,
});

async function check() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Perfume);
    
    // 1. Check ALL inserted
    const count = await repo.count();
    console.log(`Total Perfumes: ${count}`);
    
    // Check Cards
    const cardsRepo = AppDataSource.getRepository(Card);
    const king = await cardsRepo.findOne({ where: { name_en: 'King of Pentacles' } });
    console.log('DB King of Pentacles:', JSON.stringify(king, null, 2));
    
    const fool = await cardsRepo.findOne({ where: { name_en: 'The Fool' } });
    console.log('DB The Fool:', JSON.stringify(fool, null, 2));
    
    const justice = await cardsRepo.findOne({ where: { name_en: 'Justice' } });
    console.log('DB Justice:', JSON.stringify(justice, null, 2));
    
    // 2. Check Specific Examples
    // 2. Check Specific Examples (Corrected)
    // Scenario 1: Death (ID 13) + A -> Le Labo - Rose 31
    const scenario1 = await repo.findOne({ 
        where: { 
            card_id: 13, // Death
            scene_choice: 'A'
        } 
    });
    console.log('\n--- Scenario 1: Death (ID 13) + A ---');
    console.log(JSON.stringify(scenario1, null, 2));

    // Verify Order
    console.log('\n--- Order Verification ---');
    const firstArr = await repo.find({ order: { sort_order: 'ASC' }, take: 1 });
    const lastArr = await repo.find({ order: { sort_order: 'DESC' }, take: 1 });
    const first = firstArr[0];
    const last = lastArr[0];
    console.log(`First Record (Order ${first?.sort_order}): Card ID ${first?.card_id}, Choice ${first?.scene_choice}`);
    console.log(`Last Record (Order ${last?.sort_order}): Card ID ${last?.card_id}, Choice ${last?.scene_choice}`);

    // Scenario 2: The Fool (ID 2) + C -> Comptoir Sud Pacifique - Vanille Abricot
    const scenario2 = await repo.findOne({ 
        where: { 
            card_id: 2, // The Fool
            scene_choice: 'C'
        } 
    });
    console.log('\n--- Scenario 2: The Fool (ID 2) + C ---');
    console.log(`Product: ${scenario2?.product_name_en}`);
    console.log(`Description EN: ${scenario2?.description_en ? scenario2.description_en.substring(0, 50) + '...' : 'NULL'}`);
    console.log(`Description ZH: ${scenario2?.description ? scenario2.description.substring(0, 50) + '...' : 'NULL'}`);
    
    await AppDataSource.destroy();
}

async function checkUnique() {
    await AppDataSource.initialize();
    const repo = AppDataSource.getRepository(Perfume);
    
    // Count total
    const total = await repo.count();
    
    // Count with description_en not null
    const notNull = await repo.count({ where: { description_en: Not(IsNull()) } }); // Need import Not, IsNull or use query builder
    
    // Unique names
    const raw = await repo.query('SELECT COUNT(DISTINCT product_name) as cnt FROM perfumes');
    const unique = raw[0].cnt;
    
    console.log(`\n--- Coverage Stats ---`);
    console.log(`Total Records: ${total}`);
    console.log(`Records with EN Desc: ${notNull}`);
    console.log(`Unique Product Names: ${unique}`);

    if (notNull < total) {
        console.log(`\n--- Missing Descriptions ---`);
        const missing = await repo.query('SELECT DISTINCT product_name FROM perfumes WHERE description_en IS NULL');
        missing.forEach((r: any) => console.log(`- ${r.product_name}`));
    }
    
    await AppDataSource.destroy();
}

// check().catch(console.error);
checkUnique().catch(console.error);
