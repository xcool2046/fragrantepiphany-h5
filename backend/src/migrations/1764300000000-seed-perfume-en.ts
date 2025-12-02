import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPerfumeEn1764300000000 implements MigrationInterface {
  name = 'SeedPerfumeEn1764300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Copy existing English names to _en columns for all records as a baseline
    await queryRunner.query(`UPDATE perfumes SET product_name_en = product_name, brand_name_en = brand_name`);

    // 2. Update specific translations for The Fool (愚者)
    const updates = [
      {
        card_name: '愚者',
        scene_choice: 'A. 玫瑰园',
        description_en: "The Fool's innocence opens a new emotional journey. Fresh roses bring pure emotion to new acquaintances or renewed relationships.",
        notes_top_en: "Fresh Red Roses, Lemon, Mint"
      },
      {
        card_name: '愚者',
        scene_choice: '午后被阳光烘暖的木质家具',
        description_en: "The Fool's free soul finds belonging in warm wood, suitable for establishing a stable emotional foundation.",
        notes_top_en: "Pepper Rose, Patchouli, Woody"
      },
      {
        card_name: '愚者',
        scene_choice: '夜晚咖啡馆飘出的烘焙香气',
        description_en: "The Fool's adventurous spirit joins the warmth of coffee, injecting intimate moments of deep conversation into the relationship.",
        notes_top_en: "Black Rose, Coffee, Amber"
      },
      {
        card_name: '愚者',
        scene_choice: '海边度假时的白色香皂',
        description_en: "The Fool's sincerity is purified through the soapy scent, returning feelings to their simple and pure essence.",
        notes_top_en: "Citrus Rose, Clean Musk"
      }
    ];

    for (const update of updates) {
      await queryRunner.query(
        `UPDATE perfumes SET description_en = $1, notes_top_en = $2 WHERE card_name = $3 AND scene_choice = $4`,
        [update.description_en, update.notes_top_en, update.card_name, update.scene_choice]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No op
  }
}
