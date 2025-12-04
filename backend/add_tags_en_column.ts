
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  synchronize: false,
});

async function addTagsEnColumn() {
  await AppDataSource.initialize();
  console.log('Database connected.');

  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    // Check if column exists
    const hasColumn = await queryRunner.hasColumn('perfumes', 'tags_en');
    if (!hasColumn) {
      console.log('Adding tags_en column...');
      await queryRunner.query(`ALTER TABLE "perfumes" ADD COLUMN "tags_en" jsonb`);
      console.log('Column tags_en added.');
    } else {
      console.log('Column tags_en already exists.');
    }
  } catch (error) {
    console.error('Error adding column:', error);
  } finally {
    await queryRunner.release();
    await AppDataSource.destroy();
  }
}

addTagsEnColumn().catch(console.error);
