import { MigrationInterface, QueryRunner } from 'typeorm';

export class MergeInterpretations17634625532121696342553212
  implements MigrationInterface
{
  name = 'MergeInterpretations17634625532121696342553212';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "summary_en" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "summary_zh" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "interpretation_en" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "interpretation_zh" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "action_en" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "action_zh" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "future_en" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "future_zh" text`,
    );
    // 推荐字段使用 text，避免历史 jsonb 中的字符串格式解析错误
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "recommendation_en" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "recommendation_zh" text`,
    );

    // load existing
    const rows: any[] = await queryRunner.query(
      `SELECT * FROM "tarot_interpretations" ORDER BY id ASC`,
    );
    const keepMap = new Map<string, number>();
    for (const row of rows) {
      const lang = (row.language || 'en').toLowerCase();
      const key = `${row.card_name}|${row.category}|${row.position}`;
      const recRaw = row.recommendation;
      const recText =
        recRaw === null || recRaw === undefined
          ? null
          : typeof recRaw === 'string'
            ? recRaw
            : JSON.stringify(recRaw);

      const assignColumns = {
        summary_en: null,
        summary_zh: null,
        interpretation_en: null,
        interpretation_zh: null,
        action_en: null,
        action_zh: null,
        future_en: null,
        future_zh: null,
        recommendation_en: null,
        recommendation_zh: null,
      } as any;
      if (lang === 'en') {
        assignColumns.summary_en = row.summary;
        assignColumns.interpretation_en = row.interpretation;
        assignColumns.action_en = row.action;
        assignColumns.future_en = row.future;
        assignColumns.recommendation_en = recText;
      } else {
        assignColumns.summary_zh = row.summary;
        assignColumns.interpretation_zh = row.interpretation;
        assignColumns.action_zh = row.action;
        assignColumns.future_zh = row.future;
        assignColumns.recommendation_zh = recText;
      }

      if (!keepMap.has(key)) {
        // keep this row, set new columns
        keepMap.set(key, row.id);
        await queryRunner.query(
          `UPDATE "tarot_interpretations" SET summary_en=COALESCE(summary_en,$1), summary_zh=COALESCE(summary_zh,$2), interpretation_en=COALESCE(interpretation_en,$3), interpretation_zh=COALESCE(interpretation_zh,$4), action_en=COALESCE(action_en,$5), action_zh=COALESCE(action_zh,$6), future_en=COALESCE(future_en,$7), future_zh=COALESCE(future_zh,$8), recommendation_en=COALESCE(recommendation_en,$9), recommendation_zh=COALESCE(recommendation_zh,$10) WHERE id=$11`,
          [
            assignColumns.summary_en,
            assignColumns.summary_zh,
            assignColumns.interpretation_en,
            assignColumns.interpretation_zh,
            assignColumns.action_en,
            assignColumns.action_zh,
            assignColumns.future_en,
            assignColumns.future_zh,
            assignColumns.recommendation_en,
            assignColumns.recommendation_zh,
            row.id,
          ],
        );
      } else {
        const keepId = keepMap.get(key)!;
        await queryRunner.query(
          `UPDATE "tarot_interpretations" SET summary_en=COALESCE(summary_en,$1), summary_zh=COALESCE(summary_zh,$2), interpretation_en=COALESCE(interpretation_en,$3), interpretation_zh=COALESCE(interpretation_zh,$4), action_en=COALESCE(action_en,$5), action_zh=COALESCE(action_zh,$6), future_en=COALESCE(future_en,$7), future_zh=COALESCE(future_zh,$8), recommendation_en=COALESCE(recommendation_en,$9), recommendation_zh=COALESCE(recommendation_zh,$10) WHERE id=$11`,
          [
            assignColumns.summary_en,
            assignColumns.summary_zh,
            assignColumns.interpretation_en,
            assignColumns.interpretation_zh,
            assignColumns.action_en,
            assignColumns.action_zh,
            assignColumns.future_en,
            assignColumns.future_zh,
            assignColumns.recommendation_en,
            assignColumns.recommendation_zh,
            keepId,
          ],
        );
        // delete duplicate row
        await queryRunner.query(
          `DELETE FROM "tarot_interpretations" WHERE id=$1`,
          [row.id],
        );
      }
    }

    // drop old index and columns
    await queryRunner.query(
      `DROP INDEX IF EXISTS "IDX_3aa0aee546708698aa111b5257"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "language"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "summary"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "interpretation"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "action"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "future"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "recommendation"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_interp_unique" ON "tarot_interpretations" ("card_name","category","position")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_interp_unique"`);
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "recommendation" jsonb`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "future" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "action" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "interpretation" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "summary" text NOT NULL default ''`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" ADD "language" character varying NOT NULL default 'en'`,
    );

    const rows: any[] = await queryRunner.query(
      `SELECT * FROM "tarot_interpretations" ORDER BY id ASC`,
    );
    // expand into two rows if both languages exist
    for (const row of rows) {
      // clear old columns
      await queryRunner.query(
        `UPDATE "tarot_interpretations" SET summary=NULL, interpretation=NULL, action=NULL, future=NULL, recommendation=NULL WHERE id=$1`,
        [row.id],
      );
      if (
        row.summary_en ||
        row.interpretation_en ||
        row.action_en ||
        row.future_en ||
        row.recommendation_en
      ) {
        await queryRunner.query(
          `UPDATE "tarot_interpretations" SET language='en', summary=$1, interpretation=$2, action=$3, future=$4, recommendation=$5 WHERE id=$6`,
          [
            row.summary_en,
            row.interpretation_en,
            row.action_en,
            row.future_en,
            row.recommendation_en,
            row.id,
          ],
        );
      } else {
        await queryRunner.query(
          `UPDATE "tarot_interpretations" SET language='en', summary='', interpretation=NULL, action=NULL, future=NULL, recommendation=NULL WHERE id=$1`,
          [row.id],
        );
      }
      if (
        row.summary_zh ||
        row.interpretation_zh ||
        row.action_zh ||
        row.future_zh ||
        row.recommendation_zh
      ) {
        await queryRunner.query(
          `INSERT INTO "tarot_interpretations" (card_name,category,position,language,summary,interpretation,action,future,recommendation) VALUES ($1,$2,$3,'zh',$4,$5,$6,$7,$8)`,
          [
            row.card_name,
            row.category,
            row.position,
            row.summary_zh,
            row.interpretation_zh,
            row.action_zh,
            row.future_zh,
            row.recommendation_zh,
          ],
        );
      }
    }
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "recommendation_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "recommendation_zh"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "future_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "future_zh"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "action_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "action_zh"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "interpretation_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "interpretation_zh"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "summary_en"`,
    );
    await queryRunner.query(
      `ALTER TABLE "tarot_interpretations" DROP COLUMN "summary_zh"`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_3aa0aee546708698aa111b5257" ON "tarot_interpretations" ("card_name","category","position","language")`,
    );
  }
}
