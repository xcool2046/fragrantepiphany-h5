import { MigrationInterface, QueryRunner } from 'typeorm';

export class DropRules1764239000000 implements MigrationInterface {
  name = 'DropRules1764239000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "rules" DROP CONSTRAINT IF EXISTS "FK_rules_question"`,
    );
    await queryRunner.query(
      `DROP INDEX IF EXISTS "uq_rule_question_cards"`,
    );
    await queryRunner.query(`DROP TABLE IF EXISTS "rules"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "rules" ("id" SERIAL NOT NULL, "question_id" integer NOT NULL, "card_codes" text array NOT NULL, "priority" integer NOT NULL DEFAULT '100', "summary_free" jsonb, "interpretation_full" jsonb, "recommendations" jsonb, "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1c74c143eb34c41c246d7fa7e3b" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "uq_rule_question_cards" ON "rules" ("question_id", "card_codes") `,
    );
    await queryRunner.query(
      `ALTER TABLE "rules" ADD CONSTRAINT "FK_rules_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }
}
