import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSceneChoiceEn1764320000000 implements MigrationInterface {
  name = 'SeedSceneChoiceEn1764320000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Map Chinese scene choices to English
    const mappings = [
      {
        zh: '初夏清晨的玫瑰园',
        en: 'Rose garden in early summer morning'
      },
      {
        zh: '午后被阳光烘暖的木质家具',
        en: 'Sun-warmed wooden furniture in the afternoon'
      },
      {
        zh: '夜晚咖啡馆飘出的烘焙香气',
        en: 'Baking scent from a night cafe'
      },
      {
        zh: '海边度假时的白色香皂',
        en: 'White soap during a seaside vacation'
      }
    ];

    // Also handle the "A. " prefix that might exist in the DB
    // The DB seems to have "A. 玫瑰园" sometimes, or just the text.
    // Based on previous file views, it seems to be mixed or standardized.
    // Let's look at the service: 
    // const keywords = dbChoice.replace(/^[A-Z]\.\s*/, '').split(/[\s,]+/)
    // This implies the DB might have "A. ...".
    
    // Let's try to update based on partial match if exact match fails, 
    // but for safety, let's try to be specific.
    
    // Actually, looking at the previous migration (SeedPerfumeEn...), it used:
    // scene_choice: 'A. 玫瑰园'
    // scene_choice: '午后被阳光烘暖的木质家具'
    
    // So we should handle both cases.
    
    // Add the column first if it doesn't exist
    // We use IF NOT EXISTS to be safe, but Postgres ADD COLUMN IF NOT EXISTS is only available in newer versions (9.6+)
    // TypeORM usually handles this via schema sync, but we are doing manual migrations.
    // Let's check if column exists or just try to add it.
    // Column should already exist from previous migration (1764305000000)
    // We skip adding it to avoid transaction aborts if it exists.

    for (const map of mappings) {
      // Update where scene_choice contains the Chinese text
      await queryRunner.query(
        `UPDATE perfumes 
         SET scene_choice_en = $1 
         WHERE scene_choice LIKE '%' || $2 || '%'`,
        [map.en, map.zh]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "perfumes" DROP COLUMN "scene_choice_en"`);
  }
}
