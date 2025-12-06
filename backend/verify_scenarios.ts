
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@localhost:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Perfume],
  synchronize: false,
});

async function verifyScenarios() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected\n');

        // --- Scenario 1 ---
        // Questions: Q2=A (Rose), Q4=Love (Relationship)
        // Cards: Past=Justice, Present=Death, Future=Nine of Wands
        console.log('🔹 Verifying Scenario 1: [Love] Past(Justice) -> Present(Death) -> Future(9 of Wands) | Scent: A (Rose)');
        
        // 1. Check Interpretations
        const cards1 = [
            { name: 'Justice', pos: 'Past', name_zh: '正义' },
            { name: 'Death', pos: 'Present', name_zh: '死神' }, // Trigger Card
            { name: 'Nine of Wands', pos: 'Future', name_zh: '权杖九' }
        ];

        for (const c of cards1) {
            const res = await AppDataSource.query(
                `SELECT interpretation_zh, summary_zh FROM tarot_interpretations 
                 WHERE card_name = $1 AND category = 'Love' AND position = $2`,
                [c.name, c.pos]
            );
            if (res.length > 0) {
                const text = res[0].interpretation_zh;
                console.log(`   ✅ [Card] ${c.name} (${c.pos}): Found. Preview: "${text?.substring(0, 20)}..."`);
                if (c.pos === 'Present') {
                    console.log(`   ✅ [Sentence] (from Present card): "${res[0].summary_zh}"`);
                }
            } else {
                console.error(`   ❌ [Card] ${c.name} (${c.pos}): MISSING in DB!`);
            }
        }

        // 2. Check Perfume (Trigger: Death + Scent A)
        const deathCard = await AppDataSource.query(`SELECT id FROM cards WHERE name_en = 'Death'`);
        if (deathCard.length > 0) {
            const deathId = deathCard[0].id;
            // Scent A maps to scene_choice 'A'
            const perfume = await AppDataSource.getRepository(Perfume).findOne({
                where: { card_id: deathId, scene_choice: 'A' }
            });
            
            if (perfume) {
                console.log(`   ✅ [Perfume] Found: ${perfume.product_name} (${perfume.brand_name})`);
                console.log(`   ✅ [Perfume Interpretation] (Mapping Text): "${perfume.description}"`);
            } else {
                console.error(`   ❌ [Perfume] Missing Perfume for Death + A (Rose)`);
            }
        }

        console.log('\n---------------------------------------------------\n');

        // --- Scenario 2 ---
        // Questions: Q2=C (Cafe), Q4=Self (Growth)
        // Cards: Past=The World, Present=The Fool, Future=Ace of Pentacles
        console.log('🔹 Verifying Scenario 2: [Self] Past(The World) -> Present(The Fool) -> Future(Ace of Pentacles) | Scent: C (Cafe)');

        const cards2 = [
            { name: 'The World', pos: 'Past', name_zh: '世界' },
            { name: 'The Fool', pos: 'Present', name_zh: '愚者' }, // Trigger Card
            { name: 'Ace of Pentacles', pos: 'Future', name_zh: '星币一' }
        ];

        for (const c of cards2) {
            const res = await AppDataSource.query(
                `SELECT interpretation_zh, summary_zh FROM tarot_interpretations 
                 WHERE card_name = $1 AND category = 'Self' AND position = $2`,
                [c.name, c.pos]
            );
            if (res.length > 0) {
                const text = res[0].interpretation_zh;
                // Try to match snippet from image if possible
                console.log(`   ✅ [Card] ${c.name} (${c.pos}): Found. Preview: "${text?.substring(0, 20)}..."`);
                if (c.pos === 'Present') {
                    console.log(`   ✅ [Sentence] (from Present card): "${res[0].summary_zh}"`);
                }
            } else {
                console.error(`   ❌ [Card] ${c.name} (${c.pos}): MISSING in DB!`);
            }
        }

        // 2. Check Perfume (Trigger: The Fool + Scent C)
        const foolCard = await AppDataSource.query(`SELECT id FROM cards WHERE name_en = 'The Fool'`);
        if (foolCard.length > 0) {
            const foolId = foolCard[0].id;
            // Scent C maps to scene_choice 'C'
            const perfume = await AppDataSource.getRepository(Perfume).findOne({
                where: { card_id: foolId, scene_choice: 'C' }
            });
            
            if (perfume) {
                console.log(`   ✅ [Perfume] Found: ${perfume.product_name} (${perfume.brand_name})`);
                console.log(`   ✅ [Perfume Interpretation] (Mapping Text): "${perfume.description}"`);
            } else {
                console.error(`   ❌ [Perfume] Missing Perfume for Fool + C (Cafe)`);
            }
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

verifyScenarios();
