
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from './src/entities/perfume.entity';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config({ path: __dirname + '/.env' });

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
  logging: false,
});

async function batchUpdate() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfumeRepo = AppDataSource.getRepository(Perfume);
    
    // Read the batch file
    const batchFile = process.argv[2] || 'perfume_translations_batch_1.json';
    const filePath = path.join(__dirname, batchFile);
    
    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      process.exit(1);
    }

    const updates = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    console.log(`Processing ${updates.length} updates from ${batchFile}...`);

    let successCount = 0;
    let errorCount = 0;

    for (const update of updates) {
      try {
        const perfume = await perfumeRepo.findOne({ where: { id: update.id } });
        if (perfume) {
          perfume.description_en = update.description_en;
          perfume.sentence_en = update.quote_en;
          await perfumeRepo.save(perfume);
          // console.log(`Updated ID ${update.id}: ${perfume.product_name}`);
          successCount++;
        } else {
          console.warn(`ID ${update.id} not found!`);
          errorCount++;
        }
      } catch (err) {
        console.error(`Error updating ID ${update.id}:`, err);
        errorCount++;
      }
    }

    console.log(`\nBatch completed.`);
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  }
}

batchUpdate();
