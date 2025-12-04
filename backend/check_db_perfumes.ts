
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Perfume],
  synchronize: false,
});

async function checkPerfumes() {
  await AppDataSource.initialize();
  const perfumeRepo = AppDataSource.getRepository(Perfume);
  
  const perfumes = await perfumeRepo.find({ take: 3 });
  console.log('DB Perfumes:', JSON.stringify(perfumes, null, 2));
  
  await AppDataSource.destroy();
}

checkPerfumes().catch(console.error);
