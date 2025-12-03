import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMagicianPerfumeEn1764330000000 implements MigrationInterface {
  name = 'SeedMagicianPerfumeEn1764330000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Fix the scene_choice_en for "A. 玫瑰园" if it wasn't caught by the previous generic update
    // The previous update used LIKE '%玫瑰园%', so it might have worked, but let's be explicit for the Magician card.

    // Magician Card ID is likely 2 (based on audit), but we should look it up or use the name.

    const updates = [
      {
        scene_choice_zh: 'A. 玫瑰园',
        scene_choice_en: 'Rose garden in early summer morning',
        product_name_en: 'The Coveted Duchess Rose',
        brand_name_en: "Penhaligon's",
        description_en:
          'The Magician represents the spark of creation. Like a rose garden in early summer, it signifies the beginning of a beautiful romance. You have all the tools you need to manifest the love you desire.',
        quote_en: 'As above, so below.',
        notes_top_en: 'Mandarin, Rose, Musk, Woody Notes',
      },
      {
        scene_choice_zh: '午后被阳光烘暖的木质家具',
        scene_choice_en: 'Sun-warmed wooden furniture in the afternoon',
        product_name_en: 'Rose 31',
        brand_name_en: 'Le Labo',
        description_en:
          "The Magician's resourcefulness meets the grounding warmth of wood. This scent embodies the power to transform the ordinary into the extraordinary, grounding your potential in reality.",
        quote_en: 'Manifest your reality.',
        notes_top_en: 'Rose, Cumin, Vetiver, Cedar',
      },
      {
        scene_choice_zh: '夜晚咖啡馆飘出的烘焙香气',
        scene_choice_en: 'Baking scent from a night cafe',
        product_name_en: 'Café Rose',
        brand_name_en: 'Tom Ford',
        description_en:
          'A blend of mystery and mastery. The Magician invites you to explore the depths of your potential. Like a dark cafe, it offers a space for deep conversation and magical connections.',
        quote_en: 'Magic is in the details.',
        notes_top_en: 'Turkish Rose, Coffee, Incense, Patchouli',
      },
      {
        scene_choice_zh: '海边度假时的白色香皂',
        scene_choice_en: 'White soap during a seaside vacation',
        product_name_en: 'Rose Ikebana',
        brand_name_en: 'Hermès',
        description_en:
          'Pure potential and clarity. The Magician clears the way for new beginnings. This crisp, clean scent reflects a mind ready to create and a heart open to fresh possibilities.',
        quote_en: 'Pure intention, pure creation.',
        notes_top_en: 'Rose, Rhubarb, Tea, Musk',
      },
    ];

    for (const update of updates) {
      // Update by matching the Chinese scene choice and Card Name '魔术师' (or 'The Magician')
      // We'll use a subquery for the card_id to be safe
      await queryRunner.query(
        `
        UPDATE perfumes
        SET 
          scene_choice_en = $1,
          product_name_en = $2,
          brand_name_en = $3,
          description_en = $4,
          quote_en = $5,
          notes_top_en = $6
        WHERE 
          (scene_choice LIKE '%' || $7 || '%' OR scene_choice = $7)
          AND card_id IN (SELECT id FROM cards WHERE name_zh = '魔术师' OR name_en = 'The Magician')
      `,
        [
          update.scene_choice_en,
          update.product_name_en,
          update.brand_name_en,
          update.description_en,
          update.quote_en,
          update.notes_top_en,
          update.scene_choice_zh,
        ],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to revert
  }
}
