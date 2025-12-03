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

  @Column({ name: 'summary_en', type: 'text', nullable: true })
  sentence_en!: string | null;

  @Column({ name: 'summary_zh', type: 'text', nullable: true })
  sentence_zh!: string | null;

  @Column({ type: 'text', nullable: true })
  interpretation_en!: string | null;

  @Column({ type: 'text', nullable: true })
  interpretation_zh!: string | null;

  @Column({ type: 'text', nullable: true })
  recommendation_en!: string | null;

  @Column({ type: 'text', nullable: true })
  recommendation_zh!: string | null;
}
