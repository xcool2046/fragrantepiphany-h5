
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
  const repo = AppDataSource.getRepository(Perfume);

  const missing = await repo.createQueryBuilder('p')
    .where('p.description_en IS NULL')
    .orWhere("p.description_en = ''")
    .getMany();

  console.log(`Missing Descriptions: ${missing.length}`);
  
  const byCard: Record<string, number> = {};
  
  for (const p of missing) {
      // Log details to help identify if they are Traditional Chinese
      console.log(`[MISSING] ID: ${p.id}, Card: "${p.card_name}", Choice: ${p.scene_choice}, Brand: ${p.brand_name}`);
      byCard[p.card_name] = (byCard[p.card_name] || 0) + 1;
  }
  
  console.log('--- Missing Count by Card Name ---');
  console.log(byCard);

  await AppDataSource.destroy();
}

main();
