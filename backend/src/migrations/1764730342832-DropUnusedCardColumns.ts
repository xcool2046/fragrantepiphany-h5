import { MigrationInterface, QueryRunner } from "typeorm";

export class DropUnusedCardColumns1764730342832 implements MigrationInterface {
    name = 'DropUnusedCardColumns1764730342832'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "default_meaning_en"`);
        await queryRunner.query(`ALTER TABLE "cards" DROP COLUMN "default_meaning_zh"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cards" ADD "default_meaning_zh" text`);
        await queryRunner.query(`ALTER TABLE "cards" ADD "default_meaning_en" text`);
    }

}
