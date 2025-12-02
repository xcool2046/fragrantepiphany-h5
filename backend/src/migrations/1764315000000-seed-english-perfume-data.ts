import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedEnglishPerfumeData1764315000000 implements MigrationInterface {
  name = 'SeedEnglishPerfumeData1764315000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update data for "The Coveted Duchess Rose" (Card: The Fool, Scene: A. 玫瑰园)
    // Based on user screenshot:
    // Title: Penhaligon's The Coveted Duchess Rose
    // Subtitle (Notes): Fresh Red Roses, Lemon, Mint
    // Description: The Fool's innocence opens a new emotional journey. Fresh roses bring pure emotion to new acquaintances or renewed relationships.
    // Quote: THE FOOL · A. ROSE GARDEN

    await queryRunner.query(`
      UPDATE perfumes 
      SET 
        product_name_en = 'The Coveted Duchess Rose',
        brand_name_en = 'Penhaligon''s',
        description_en = 'The Fool''s innocence opens a new emotional journey. Fresh roses bring pure emotion to new acquaintances or renewed relationships.',
        notes_top_en = 'Fresh Red Roses, Lemon',
        notes_heart_en = 'Mint',
        notes_base_en = 'Musk, Woody Notes',
        quote_en = 'THE FOOL · A. ROSE GARDEN'
      WHERE product_name LIKE '%Duchess Rose%' OR product_name LIKE '%狐狸%'
    `);

    // We should also try to update other perfumes if possible, but for now let's target the one the user complained about.
    // It seems the previous migration only added the column scene_choice_en but didn't populate other _en fields properly or they were populated with Chinese fallback.
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // No need to revert data updates usually, or we could set them back to null
  }
}
