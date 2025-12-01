
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { Perfume } from '../src/entities/perfume.entity';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function run() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    // Check Admin Credentials (Env)
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin';
    console.log(`[INFO] Admin Credentials (Env/Default): User='${adminUser}', Pass='${adminPass}'`);

    // Check Perfume Data
    const perfumeRepo = AppDataSource.getRepository(Perfume);
    const count = await perfumeRepo.count();
    console.log(`[INFO] Total Perfume Records: ${count}`);
    
    if (count > 0) {
        const sample = await perfumeRepo.findOne({ where: {} });
        console.log('[OK] Sample Perfume found:', sample?.product_name);
    } else {
        console.error('[FAIL] No Perfume records found in "perfumes" table.');
    }

    await AppDataSource.destroy();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

run();
