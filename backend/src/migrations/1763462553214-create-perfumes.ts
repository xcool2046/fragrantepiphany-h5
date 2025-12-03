import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableIndex,
  TableUnique,
} from 'typeorm';

export class CreatePerfumes1763462553214 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'perfumes',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment',
          },
          { name: 'card_id', type: 'int', isNullable: false },
          {
            name: 'card_name',
            type: 'varchar',
            length: '120',
            isNullable: false,
          },
          {
            name: 'scene_choice',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'brand_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          {
            name: 'product_name',
            type: 'varchar',
            length: '255',
            isNullable: false,
          },
          { name: 'tags', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'quote', type: 'text', isNullable: true },
          { name: 'image_url', type: 'text', isNullable: true },
          { name: 'notes_top', type: 'text', isNullable: true },
          { name: 'notes_heart', type: 'text', isNullable: true },
          { name: 'notes_base', type: 'text', isNullable: true },
          { name: 'sort_order', type: 'int', isNullable: false, default: 0 },
          {
            name: 'status',
            type: 'varchar',
            length: '30',
            isNullable: false,
            default: "'active'",
          },
          {
            name: 'created_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
          {
            name: 'updated_at',
            type: 'timestamp',
            isNullable: false,
            default: 'now()',
          },
        ],
      }),
      true,
    );

    await queryRunner.createUniqueConstraint(
      'perfumes',
      new TableUnique({
        name: 'UQ_perfumes_card_scene',
        columnNames: ['card_id', 'scene_choice'],
      }),
    );

    await queryRunner.createIndex(
      'perfumes',
      new TableIndex({ name: 'IDX_perfumes_status', columnNames: ['status'] }),
    );
    await queryRunner.createIndex(
      'perfumes',
      new TableIndex({ name: 'IDX_perfumes_card', columnNames: ['card_id'] }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('perfumes', 'IDX_perfumes_card');
    await queryRunner.dropIndex('perfumes', 'IDX_perfumes_status');
    await queryRunner.dropUniqueConstraint(
      'perfumes',
      'UQ_perfumes_card_scene',
    );
    await queryRunner.dropTable('perfumes');
  }
}
