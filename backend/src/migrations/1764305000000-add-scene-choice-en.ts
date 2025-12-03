import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSceneChoiceEn1764305000000 implements MigrationInterface {
  name = 'AddSceneChoiceEn1764305000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfumes" ADD "scene_choice_en" character varying(255)`,
    );

    // Seed data for The Fool
    const updates = [
      {
        scene_choice: 'A. 玫瑰园',
        scene_choice_en: 'A. Rose Garden',
      },
      {
        scene_choice: '午后被阳光烘暖的木质家具',
        scene_choice_en: 'Sun-warmed wooden furniture',
      },
      {
        scene_choice: '夜晚咖啡馆飘出的烘焙香气',
        scene_choice_en: 'Baking scent from a night cafe',
      },
      {
        scene_choice: '海边度假时的白色香皂',
        scene_choice_en: 'White soap at seaside',
      },
    ];

    for (const update of updates) {
      await queryRunner.query(
        `UPDATE perfumes SET scene_choice_en = $1 WHERE scene_choice = $2`,
        [update.scene_choice_en, update.scene_choice],
      );
    }

    // Fallback for others
    await queryRunner.query(
      `UPDATE perfumes SET scene_choice_en = scene_choice WHERE scene_choice_en IS NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "perfumes" DROP COLUMN "scene_choice_en"`,
    );
  }
}
