
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { Card } from '../src/entities/card.entity';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';
import { Perfume } from '../src/entities/perfume.entity'; // Dummy import for DataSource

config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@db:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Card, Perfume],
  synchronize: false,
});

async function main() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const workbook = XLSX.readFile('/home/projects/h5/master (3).xlsx');
    
    // 1. Read "Perfume master" (Metadata) for reference if needed
    // But we mainly need "Perfume+卡 mapping" for the Chinese link text
    const masterSheet = workbook.Sheets['Perfume master'];
    const masterData = XLSX.utils.sheet_to_json(masterSheet, { header: 1 });
    const masterMap = new Map<number, any>();
    
    // Helper to extract master info
    masterData.slice(1).forEach((row: any) => {
        if (!row[0]) return;
        const id = parseInt(row[0]);
        // ID is col 0
        // Brand is col 2 (from previous analysis)
        // Name is col 3
        masterMap.set(id, {
            brandEn: row[2],
            nameEn: row[3]
        });
    });

    // 2. Read "Perfume+卡 mapping"
    const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
    const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1 });
    
    // Load Cards
    const cardRepo = AppDataSource.getRepository(Card);
    const allCards = await cardRepo.find();
    const cardMap = new Map<string, Card>();
    
    function normalizeChineseName(name: string): string {
      if (!name) return '';
      let n = name.replace(/牌$/, '');
      return n.trim();
    }

    allCards.forEach(c => {
        if (c.name_zh) {
            cardMap.set(c.name_zh.trim(), c);
            cardMap.set(normalizeChineseName(c.name_zh), c);
        }
    });

    const choices = ['A', 'B', 'C', 'D'];
    const output: any[] = [];

    // Parse Mapping
    for (let i = 1; i < mappingData.length; i++) {
        const row: any = mappingData[i];
        if (!row[0]) continue;
        
        const cardNameRaw = row[0].toString().trim();
        
        // Loop Choices
        for (let cIdx = 0; cIdx < choices.length; cIdx++) {
            const choiceLabel = choices[cIdx];
            const baseIdx = 1 + (cIdx * 3); // A=1, B=4, C=7, D=10
            
            const rawId = row[baseIdx];
            if (!rawId) continue;
            
            const uniqueId = parseInt(rawId);
            const linkTextZh = row[baseIdx + 2]; // Description Snippet (Chinese)

            if (linkTextZh) {
                const master = masterMap.get(uniqueId);
                output.push({
                    id: uniqueId,
                    card_name: cardNameRaw,
                    choice: choiceLabel,
                    brand: master?.brandEn,
                    product: master?.nameEn,
                    description_zh: linkTextZh
                });
            }
        }
    }

    console.log(`Extracted ${output.length} items.`);
    fs.writeFileSync('perfume_source_for_translation.json', JSON.stringify(output, null, 2));
}

main().catch(console.error);
