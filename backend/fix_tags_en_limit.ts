
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import ormconfig from './ormconfig';

async function main() {
    const AppDataSource = new DataSource({
        ...(ormconfig.options as any),
        entities: [Perfume],
    });
    
    await AppDataSource.initialize();
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    const perfumes = await perfumeRepo.find();
    let updatedCount = 0;
    
    console.log(`Checking ${perfumes.length} perfumes for EN tags...`);
    
    for (const p of perfumes) {
        let tagsEn = p.tags_en || [];
        
        let uniqueTags = Array.from(new Set(tagsEn));
        
        if (uniqueTags.length > 3) {
            uniqueTags = uniqueTags.slice(0, 3);
            p.tags_en = uniqueTags;
            await perfumeRepo.save(p);
            updatedCount++;
        } else if (uniqueTags.length < tagsEn.length) {
             p.tags_en = uniqueTags;
             await perfumeRepo.save(p);
             updatedCount++;
        }
    }
    
    console.log(`Fixed EN tags for ${updatedCount} perfumes.`);
    await AppDataSource.destroy();
}

main();
