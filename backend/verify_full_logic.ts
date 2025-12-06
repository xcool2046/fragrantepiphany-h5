import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import * as fs from 'fs';
import { Perfume } from './src/entities/perfume.entity';
import { Interpretation } from './src/entities/interpretation.entity'; // Assuming this exists, need to check path
// If Interpretation entity file path is different, I might need to adjust, 
// but for raw query I don't strictly need the Entity class if I use `.query`.
// Let's use raw query for interpretations to be safe and entity for Perfume.

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@localhost:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Perfume], 
  synchronize: false,
});

async function verify() {
    try {
        await AppDataSource.initialize();
        console.log('✅ Database connected');

        console.log('\n--- 1. Verifying Card Interpretation Logic (Past/Present/Future) ---');
        // Check 'The Fool' (愚者) as sample
        const cardNameEn = 'The Fool';
        const interps = await AppDataSource.query(
            `SELECT category, position, interpretation_zh, summary_zh, interpretation_en, summary_en 
             FROM tarot_interpretations 
             WHERE card_name = $1 
             ORDER BY category, position`,
            [cardNameEn]
        );

        const categories = ['Self', 'Career', 'Love'];
        const positions = ['Past', 'Present', 'Future'];
        
        console.log(`Checking combinations for card: ${cardNameEn}`);
        let missingInterp = false;
        
        for (const cat of categories) {
            for (const pos of positions) {
                const found = interps.find((i: any) => i.category === cat && i.position === pos);
                if (found) {
                    const hasText = found.interpretation_zh && found.interpretation_zh.length > 0;
                    const status = hasText ? 'OK' : 'EMPTY TEXT';
                    console.log(`  [${cat} - ${pos}]: Found - ${status}`);
                    if (!hasText) missingInterp = true;
                } else {
                    console.log(`  [${cat} - ${pos}]: ❌ MISSING RECORD`);
                    missingInterp = true;
                }
            }
        }

        console.log('\n--- 2. Verifying Perfume Mapping Logic (Part 2 Text) ---');
        // Check Perfumes for 'The Fool'
        // We need to know the card_id for 'The Fool'
        const cardRes = await AppDataSource.query(`SELECT id FROM cards WHERE name_en = $1`, [cardNameEn]);
        if (cardRes.length === 0) {
            console.error('❌ Card "The Fool" not found in cards table');
            return;
        }
        const cardId = cardRes[0].id;
        console.log(`Card ID for ${cardNameEn}: ${cardId}`);

        const perfumes = await AppDataSource.getRepository(Perfume).find({
            where: { card_id: cardId }
        });

        if (perfumes.length === 0) {
            console.log('❌ No perfumes found for this card.');
        } else {
            console.log(`Found ${perfumes.length} perfumes linked to ${cardNameEn}. Checking 'description' (Mapping Text)...`);
            perfumes.forEach(p => {
                // description should contain the mapping text
                const hasDesc = p.description && p.description.trim().length > 0;
                const preview = hasDesc ? p.description?.substring(0, 30) + '...' : '(empty)';
                console.log(`  [Option ${p.scene_choice || '?'}] ID: ${p.id} | Desc found: ${hasDesc ? '✅' : '❌'} | Preview: ${preview}`);
                if (!hasDesc) console.warn(`    ⚠️  Logic Gap: Perfume ${p.id} matches card ${cardNameEn} but missing mapping description.`);
            });
        }

        console.log('\n--- 3. Verifying Excel Master File Source ---');
        const excelPath = path.join(process.cwd(), 'assets', 'excel_files', 'perfume_master.xlsx');
        if (fs.existsSync(excelPath)) {
            console.log(`Reading Excel: ${excelPath}`);
            const wb = XLSX.readFile(excelPath);
            const sheetName = 'Perfume+卡 mapping';
            const sheet = wb.Sheets[sheetName];
            if (!sheet) {
                console.error(`❌ Sheet "${sheetName}" not found in Excel!`);
            } else {
                // Check a specific cell known to have text.
                // Assuming Row 1 is header. Row 2 is typically 'The Fool' - 'A'.
                // Column D (index 3) is typically the text for A.
                // Let's look at the raw json
                const rows: any[] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
                const header = rows[0];
                console.log('Excel Headers:', header);
                
                // Find "The Fool" row
                const foolRow = rows.find(r => r[0] && (r[0].includes('愚者') || r[0].includes('The Fool')));
                if (foolRow) {
                    console.log('Found "The Fool" row in Excel:');
                    console.log(`  Card: ${foolRow[0]}`);
                    // A Text is usually index 3 (D column)
                    console.log(`  Option A Text (Col D): ${foolRow[3] ? (typeof foolRow[3] === 'string' ? foolRow[3].substring(0, 30) + '...' : 'Present') : '❌ EMPTY'}`);
                } else {
                    console.log('❌ "The Fool" row not found in Excel.');
                }
            }
        } else {
            console.error(`❌ Excel file not found at ${excelPath}`);
        }

    } catch (error) {
        console.error('❌ Verification Error:', error);
    } finally {
        await AppDataSource.destroy();
    }
}

verify();
