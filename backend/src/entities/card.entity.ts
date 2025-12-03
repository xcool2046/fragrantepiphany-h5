import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity({ name: 'cards' })
export class Card {
  @PrimaryGeneratedColumn()
  id!: number;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 120 })
  code!: string;

  @Column({ type: 'text', nullable: true })
  name_en: string;

  @Column({ type: 'text', nullable: true })
  name_zh: string;

  @Column({ type: 'text', nullable: true })
  image_url: string | null;

  @Column({ type: 'boolean', default: true })
  enabled!: boolean;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
