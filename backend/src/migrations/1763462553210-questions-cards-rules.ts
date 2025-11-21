import { MigrationInterface, QueryRunner } from "typeorm";

export class QuestionsCardsRules1763462553210 implements MigrationInterface {
    name = 'QuestionsCardsRules1763462553210'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "questions" ("id" SERIAL NOT NULL, "title_en" text NOT NULL, "title_zh" text, "options_en" jsonb, "options_zh" jsonb, "active" boolean NOT NULL DEFAULT true, "weight" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_08a6d4b0f49ff300bf6b74a9e1b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "cards" ("id" SERIAL NOT NULL, "code" character varying(120) NOT NULL, "name_en" text NOT NULL, "name_zh" text, "image_url" text, "default_meaning_en" text, "default_meaning_zh" text, "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_cards_code" UNIQUE ("code"), CONSTRAINT "PK_5e0a53c53d7e2d753dd61b825e3" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "rules" ("id" SERIAL NOT NULL, "question_id" integer NOT NULL, "card_codes" text array NOT NULL, "priority" integer NOT NULL DEFAULT '100', "summary_free" jsonb, "interpretation_full" jsonb, "recommendations" jsonb, "enabled" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1c74c143eb34c41c246d7fa7e3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "uq_rule_question_cards" ON "rules" ("question_id", "card_codes") `);
        await queryRunner.query(`ALTER TABLE "rules" ADD CONSTRAINT "FK_rules_question" FOREIGN KEY ("question_id") REFERENCES "questions"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "rules" DROP CONSTRAINT "FK_rules_question"`);
        await queryRunner.query(`DROP INDEX "public"."uq_rule_question_cards"`);
        await queryRunner.query(`DROP TABLE "rules"`);
        await queryRunner.query(`DROP TABLE "cards"`);
        await queryRunner.query(`DROP TABLE "questions"`);
    }

}
