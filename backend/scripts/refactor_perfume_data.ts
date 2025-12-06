
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { Perfume } from '../src/entities/perfume.entity';
import { Card } from '../src/entities/card.entity';
import * as path from 'path';
import * as fs from 'fs';
import { config } from 'dotenv';

config();

const dbUrl = process.env.DATABASE_URL || 'postgresql://tarot:tarot@db:5432/tarot';

const AppDataSource = new DataSource({
  type: 'postgres',
  url: dbUrl,
  entities: [Perfume, Card],
  synchronize: false,
});


async function main() {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const workbook = XLSX.readFile('/home/projects/h5/master (3).xlsx');
    
    // 1. Load DB Data (Source of Chinese Translations)
    // We map by Product Name (normalized) -> DB Record
    const dbPerfumes = await AppDataSource.getRepository(Perfume).find();
    const dbMap = new Map<string, Perfume>();
    
    const normalize = (s: string) => {
        if (!s) return '';
        return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]/g, '');
    };
    
    dbPerfumes.forEach(p => {
        // We use product_name (which is likely Chinese or Mixed in DB) 
        // But we also potentially need to match against Excel English Name.
        // Wait, Prod DB product_name might be "Vanille Abricot" or "香草杏子"?
        // Let's assume there's some commonality. 
        // Actually, let's map by English Name if available, or try to match mostly by English token.
        // In the verify step, we saw DB product_name as "Vanille Abricot". So it's English!
        // Good.
        if (p.product_name) {
            dbMap.set(normalize(p.product_name), p);
        }
    });

    console.log(`Loaded ${dbMap.size} existing perfumes from DB for translation matching.`);

    // 2. Read "Perfume master" (Metadata)
    const masterSheet = workbook.Sheets['Perfume master'];
    const masterData = XLSX.utils.sheet_to_json(masterSheet, { header: 1 });
    // Header: [ID, Brand, Product Name, Tags, Desc, Image, Sort] (roughly)
    // Index mapping (0-based) based on observation:
    // 0: ID
    // 1: Brand
    // 2: Product Name
    // 3: Tags (EN)
    // 4: Description (EN) - or mixed
    // 5: Image
    
    const masterMap = new Map<number, any>();
    masterData.slice(1).forEach((row: any) => {
        if (!row[0]) return;
        const id = parseInt(row[0]);
        // Observed Structure (ID 7):
        // 0: ID
        // 1: Choice (A)
        // 2: Brand (Aesop)
        // 3: Name (Rozu)
        // 4,5: Tag1 En/Zh
        // 6,7: Tag2 ...
        
        const tagsEn: string[] = [];
        const tagsZh: string[] = [];
        // Harvest tags from col 4 onwards
        for (let c = 4; c < row.length; c += 2) {
             if (row[c]) tagsEn.push(row[c]);
             if (row[c+1]) tagsZh.push(row[c+1]);
        }

        masterMap.set(id, {
            brandEn: row[2], // Corrected from 1
            nameEn: row[3],  // Corrected from 2
            tagsEn: tagsEn.join(', '), // Store as string for now if used as source? Or array.
            tagsArrayEn: tagsEn,
            tagsArrayZh: tagsZh,
            // descEn: row[?] // Description seems missing in first few cols. 
            // If User said Master has "Link to English", maybe Mapping sheet has En Link too?
            // Mapping sheet had: Card, Choice, ID, RefName, LinkText(ZH).
            // Let's assume description EN matches LinkText(ZH)? 
            // Or leave blank.
            image: null, // Image column unknown?
            sort: row[0] // Use ID as sort? Or find Sort column.
        });
    });

    // 3. Read "Perfume+卡 mapping" (Logic)
    const mappingSheet = workbook.Sheets['Perfume+卡 mapping'];
    const mappingData = XLSX.utils.sheet_to_json(mappingSheet, { header: 1 });
    // Header: [CardName, Choice, ID, RefName, LinkText]
    // 0: Card
    // 1: Choice (A. Name)
    // 2: Unique ID
    // 3: Ref Name
    // 4: Link Text (Seems to be Chinese in Excel, but user said treat as structure. We will check.)

    // Pre-load all cards into a map
    const cardRepo = AppDataSource.getRepository(Card);
    const perfumeRepo = AppDataSource.getRepository(Perfume);

    // Clear existing perfumes
    await perfumeRepo.clear();
    console.log('Cleared existing perfumes table.');

    const allCards = await cardRepo.find();
    const cardMap = new Map<string, Card>();
    
    // Normalization helper (from seed_tarot_direct.ts)
    function normalizeChineseName(name: string): string {
      if (!name) return '';
      let n = name.replace(/牌$/, '');
      n = n.replace(/圣杯/g, '聖杯').replace(/宝剑/g, '寶劍').replace(/星币/g, '星幣').replace(/权杖/g, '權杖');
      n = n.replace(/侍卫/g, '侍者').replace(/骑士/g, '騎士').replace(/女王/g, '皇后').replace(/国王/g, '國王');
      n = n.replace(/魔术师/g, '魔術師').replace(/战车/g, '戰車').replace(/恋人/g, '戀人').replace(/隐士|隐者/g, '隱士');
      n = n.replace(/命运之轮/g, '命運之輪').replace(/正义/g, '正義').replace(/挂人|吊人|倒吊人/g, '倒吊人');
      n = n.replace(/节制/g, '節制').replace(/恶魔/g, '惡魔').replace(/审判/g, '審判').replace(/世界/g, '世界');
      n = n.replace(/太阳/g, '太陽').replace(/月亮/g, '月亮').replace(/星星/g, '星星');
      return n;
    }

    allCards.forEach(c => {
        if (c.name_en) cardMap.set(c.name_en.trim().toLowerCase(), c);
        if (c.name_zh) {
            cardMap.set(c.name_zh.trim(), c);
            cardMap.set(normalizeChineseName(c.name_zh).trim(), c);
        }
    });

    console.log(`Loaded ${allCards.length} cards into map.`);

    let insertedCount = 0;
    
    // Manual Map from seed (handles aliases)
    const manualMap: Record<string, string> = {
        '隐者': 'The Hermit', '隐士': 'The Hermit', '隱者': 'The Hermit', // Added Traditional
        '愚人': 'The Fool', '愚者': 'The Fool',
        '女皇': 'The Empress',
        '吊人': 'The Hanged Man', '倒吊人': 'The Hanged Man',
        '太阳': 'The Sun', '月亮': 'The Moon', '星星': 'The Star',
        '正义': 'Justice', '正義': 'Justice'
    };
    
    // Buffer for sorting
    const perfumesToInsert: Perfume[] = [];

    // 4. Load English Translations from JSON (Backup Source)
    // 4. Load English Translations from JSON (Backup Sources)
    // [DEPRECATED] - The old JSON sources are incompatible with the new 312-card schema.
    // Logic removed to prevent bad data matching.
    const enMap = new Map<string, string>(); 
    console.log(`Skipping legacy JSON translation loading (Incompatible data).`);

    // Process Mappings (Horizontal: Card Name, Col 1-3=A, 4-6=B, 7-9=C, 10-12=D)
    // Structure: 0: Card, 1: ID(A), 2: Name(A), 3: Desc(A), 4: ID(B)...
    const choices = ['A', 'B', 'C', 'D'];

    for (let i = 1; i < mappingData.length; i++) {
        const row: any = mappingData[i];
        if (!row[0]) continue;
        
        const cardNameRaw = row[0].toString().trim();
        
        // Resolve Card
        let card = cardMap.get(cardNameRaw.toLowerCase());
        if (!card) {
            const aliasEn = manualMap[cardNameRaw] || manualMap[normalizeChineseName(cardNameRaw)];
            if (aliasEn) card = cardMap.get(aliasEn.toLowerCase());
        }
        if (!card) {
            const norm = normalizeChineseName(cardNameRaw);
            card = cardMap.get(norm);
        }

        if (!card) {
            console.warn(`Card not found: ${cardNameRaw}`);
            continue;
        }

        // Loop Choices
        for (let cIdx = 0; cIdx < choices.length; cIdx++) {
            const choiceLabel = choices[cIdx];
            const baseIdx = 1 + (cIdx * 3); // A=1, B=4, C=7, D=10
            
            const rawId = row[baseIdx];
            if (!rawId) continue; // Skip if no mapping for this choice
            
            const uniqueId = parseInt(rawId);
            const linkTextZh = row[baseIdx + 2]; // Description Snippet

            const master = masterMap.get(uniqueId);
            if (!master) {
                console.warn(`Master info not found for ID: ${uniqueId} (Card: ${cardNameRaw}, Choice: ${choiceLabel})`);
                continue;
            }

            // Find matching DB record by Product Name (Legacy check)
            // But now we rely on Master + LinkText mostly.
            // We use dbMatch mainly for fields not in Master? (e.g. ZH tags from DB if Master lacks?)
            // Master has ZH TagsArray!
            // So we really just need DB for... nothing?
            // Maybe just Image if Master is missing? (Master has image map?)
            // Actually, Master sheet has Tags but no Image column identified yet?
            // `Step 667`: ID 7 row len 18.
            // Let's assume Master logic is solid.
            // DB Match is bonus.
            const dbMatch = dbPerfumes.find(p => p.product_name === master.nameEn || p.product_name_en === master.nameEn);

            const newPerfume = new Perfume();
            newPerfume.card_id = card.id;
            newPerfume.card_name = card.name_zh || card.name_en; // Store ZH name in perfume table for reference
            newPerfume.scene_choice = choiceLabel; // A, B, C, D
            
            // Merge Logic
            newPerfume.brand_name_en = master.brandEn;
            newPerfume.brand_name = dbMatch?.brand_name || master.brandEn; // Fallback to EN if no DB match (or update translation later)

            newPerfume.product_name_en = master.nameEn;
            newPerfume.product_name = dbMatch?.product_name || master.nameEn; 

            newPerfume.tags_en = master.tagsArrayEn || [];
            newPerfume.tags = dbMatch?.tags || master.tagsArrayZh || [];
            if (!newPerfume.tags || newPerfume.tags.length === 0) newPerfume.tags = newPerfume.tags_en;

            // Description: Use Mapping Link Text (ZH)
            newPerfume.description = linkTextZh; 
            
            // Description EN: Priority JSON -> Master -> DB -> Null
            // Try lookup by Name, then Brand+Name
            let jsonDesc = enMap.get(normalize(master.nameEn));
            if (!jsonDesc && master.brandEn) {
                jsonDesc = enMap.get(normalize(master.brandEn + master.nameEn));
            }
            if (!jsonDesc && master.brandEn) {
                 // Try Brand + " " + Name (in case normalize handles spaces differently? no, strip spaces)
                 // But maybe JSON has "Brand Name" and Master has "Name".
                 // Also try to check if JSON keys *contain* name? (Expensive loop, do it only if missing)
                 // Or better: In enMap construction, we only have one key per item.
                 const normName = normalize(master.nameEn);
                 if (normName.length > 5) { // Only try scanning for decent length names to avoid false positive
                     for (const [k, v] of enMap) {
                         if (k.includes(normName)) {
                             jsonDesc = v;
                             break;
                         }
                     }
                 }
            }

            newPerfume.description_en = jsonDesc || master.descEn || dbMatch?.description_en || null; 
            
            newPerfume.image_url = dbMatch?.image_url || null; // Use DB image if matching
            newPerfume.sort_order = 0; // Will assign later
            
            newPerfume.status = 'active';

            perfumesToInsert.push(newPerfume);
        }
    }

    // Sort by Card ID (Asc) then Choice (A,B,C,D)
    perfumesToInsert.sort((a, b) => {
        if (a.card_id !== b.card_id) return a.card_id - b.card_id;
        return a.scene_choice.localeCompare(b.scene_choice);
    });

    // Assign Order and Save
    console.log(`Saving ${perfumesToInsert.length} records...`);
    for (let i = 0; i < perfumesToInsert.length; i++) {
        const p = perfumesToInsert[i];
        p.sort_order = i + 1;
        try {
            await perfumeRepo.save(p);
            insertedCount++;
        } catch (e) {
             console.error(`Error saving perfume:`, e);
        }
    }

    console.log(`Refactor complete. Inserted ${insertedCount} records.`);
}

main().catch(console.error);
