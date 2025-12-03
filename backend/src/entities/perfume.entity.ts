import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'perfumes' })
@Index(['card_id', 'scene_choice'], { unique: true })
export class Perfume {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'int' })
  card_id!: number;

  @Column({ type: 'varchar', length: 120 })
  card_name!: string;

  @Column({ type: 'varchar', length: 255 })
  scene_choice!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  scene_choice_en!: string | null;

  @Column({ type: 'varchar', length: 255 })
  brand_name!: string;

  @Column({ type: 'varchar', length: 255 })
  product_name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  product_name_en!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  brand_name_en!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  tags!: string[] | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  description_en!: string | null;

  @Column({ type: 'text', nullable: true })
  quote!: string | null;

  @Column({ type: 'text', nullable: true })
  quote_en!: string | null;

  @Column({ type: 'text', nullable: true })
  image_url!: string | null;



  @Column({ type: 'int', default: 0 })
  sort_order!: number;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
