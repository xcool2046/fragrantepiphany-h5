import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tarot_interpretations' })
@Index(['card_name', 'category', 'position'], { unique: true })
export class Interpretation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  card_name: string;

  @Column()
  category: string;

  @Column()
  position: string;

  @Column({ type: 'text', nullable: true })
  summary_en: string | null;

  @Column({ type: 'text', nullable: true })
  summary_zh: string | null;

  @Column({ type: 'text', nullable: true })
  interpretation_en: string | null;

  @Column({ type: 'text', nullable: true })
  interpretation_zh: string | null;

  @Column({ type: 'text', nullable: true })
  action_en: string | null;

  @Column({ type: 'text', nullable: true })
  action_zh: string | null;

  @Column({ type: 'text', nullable: true })
  future_en: string | null;

  @Column({ type: 'text', nullable: true })
  future_zh: string | null;

  @Column({ type: 'text', nullable: true })
  recommendation_en: string | null;

  @Column({ type: 'text', nullable: true })
  recommendation_zh: string | null;
}
