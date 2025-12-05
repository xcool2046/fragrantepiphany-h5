
import AppDataSource from './ormconfig';
import { Perfume } from './src/entities/perfume.entity';
import * as dotenv from 'dotenv';

dotenv.config();

async function checkPerfumeData() {
  try {
    await AppDataSource.initialize();
    console.log('Database connected.');

    const perfume = await AppDataSource.getRepository(Perfume).findOne({
      where: {
        brand_name: 'Diptyque',
        product_name: 'Eau des Sens'
      }
    });

    if (perfume) {
      console.log('Found Perfume:', JSON.stringify(perfume, null, 2));
    } else {
      console.log('Perfume not found.');
    }
    
    // Fetch all perfumes to avoid JSONB operator issues
    const allPerfumes = await AppDataSource.getRepository(Perfume).find();
    
    const wrongTagsPerfume = allPerfumes.filter(p => p.id === 152);

    console.log('Perfumes with suspicious tags:', JSON.stringify(wrongTagsPerfume.map(p => ({
        id: p.id,
        brand: p.brand_name,
        product: p.product_name,
        tags: p.tags,
        tags_en: p.tags_en
    })), null, 2));

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await AppDataSource.destroy();
  }
}

checkPerfumeData();
