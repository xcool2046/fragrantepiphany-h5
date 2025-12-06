
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Perfume } from './src/entities/perfume.entity';
import { Card } from './src/entities/card.entity';
import ormconfig from './ormconfig';

async function main() {
  const AppDataSource = new DataSource({
    ...(ormconfig.options as any),
    entities: [Perfume, Card],
  });

  await AppDataSource.initialize();
  const repo = AppDataSource.getRepository(Perfume);

  const total = await repo.count();
  const withDescEn = await repo.createQueryBuilder('p')
    .where('p.description_en IS NOT NULL')
    .andWhere("p.description_en != ''")
    .getCount();

  console.log(`Total Perfumes: ${total}`);
  console.log(`With English Description: ${withDescEn}`);

  await AppDataSource.destroy();
}

main();
