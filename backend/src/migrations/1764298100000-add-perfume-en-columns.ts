import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPerfumeEnColumns1764298100000 implements MigrationInterface {
  name = 'AddPerfumeEnColumns1764298100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfumes" ADD "product_name_en" character varying(255)`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfumes" ADD "brand_name_en" character varying(255)`,
    );
    await queryRunner.query(`ALTER TABLE "perfumes" ADD "description_en" text`);
    await queryRunner.query(`ALTER TABLE "perfumes" ADD "quote_en" text`);
    await queryRunner.query(`ALTER TABLE "perfumes" ADD "notes_top_en" text`);
    await queryRunner.query(`ALTER TABLE "perfumes" ADD "notes_heart_en" text`);
    await queryRunner.query(`ALTER TABLE "perfumes" ADD "notes_base_en" text`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "notes_base_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "notes_heart_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "notes_top_en"`,
    );
    await queryRunner.query(`ALTER TABLE "perfumes" DROP COLUMN "quote_en"`);
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "description_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "brand_name_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "product_name_en"`,
    );
  }
}
