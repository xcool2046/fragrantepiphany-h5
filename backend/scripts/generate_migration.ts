import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.resolve(__dirname, '../src/migrations/perfumes_data.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const perfumes = JSON.parse(rawData);

const migrationContent = `import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedPerfumes1764238000000 implements MigrationInterface {
  name = 'SeedPerfumes1764238000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // 1. Get all cards to map name -> id
    const cards = await queryRunner.query('SELECT id, name_zh FROM cards');
    const cardMap = new Map<string, number>();
    cards.forEach((c: any) => {
      if (c.name_zh) cardMap.set(c.name_zh.trim(), c.id);
    });

    // Manual fixes for name mismatches
    cardMap.set('愚者', cardMap.get('愚人')!);

    const perfumes = ${JSON.stringify(perfumes, null, 2)};

    // 2. Insert perfumes
    for (const p of perfumes) {
      const cardId = cardMap.get(p.card_name.trim());
      if (!cardId) {
        console.warn('Card not found for:', p.card_name);
        continue;
      }

      await queryRunner.query(
        \`INSERT INTO perfumes (
          card_id, card_name, scene_choice, brand_name, product_name, 
          tags, description, notes_top, image_url, status, sort_order
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'active', 0)\`,
        [
          cardId,
          p.card_name,
          p.scene_choice,
          p.brand_name,
          p.product_name,
          JSON.stringify(p.tags),
          p.description,
          p.notes_top,
          p.image_url
        ]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DELETE FROM perfumes');
  }
}
`;

const outputPath = path.resolve(__dirname, '../src/migrations/1764238000000-seed-perfumes.ts');
fs.writeFileSync(outputPath, migrationContent);
console.log('Generated migration file:', outputPath);
