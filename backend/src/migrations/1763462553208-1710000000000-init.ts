import { MigrationInterface, QueryRunner } from "typeorm";

export class Init17100000000001696342553208 implements MigrationInterface {
    name = 'Init17100000000001696342553208'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "tarot_interpretations" ("id" SERIAL NOT NULL, "card_name" character varying NOT NULL, "category" character varying NOT NULL, "position" character varying NOT NULL, "language" character varying NOT NULL, "summary" text NOT NULL, "interpretation" text, "action" text, "future" text, "recommendation" jsonb, CONSTRAINT "PK_350d4b2e5ce2be724b5ffbc1f68" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_3aa0aee546708698aa111b5257" ON "tarot_interpretations" ("card_name", "category", "position", "language") `);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT gen_random_uuid(), "amount" integer NOT NULL, "currency" character varying NOT NULL, "price_id" character varying, "status" character varying NOT NULL DEFAULT 'pending', "stripe_session_id" character varying, "payment_intent_id" character varying, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "users" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "password_hash" character varying NOT NULL, CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3aa0aee546708698aa111b5257"`);
        await queryRunner.query(`DROP TABLE "tarot_interpretations"`);
    }

}
