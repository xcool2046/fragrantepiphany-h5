import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'tarot_interpretations' })
@Index(['card_name', 'category', 'position', 'language'], { unique: true })
export class Interpretation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  card_name: string;

  @Column()
  category: string;

  @Column()
  position: string;

  @Column()
  language: string;

  @Column({ type: 'text' })
  summary: string;

  @Column({ type: 'text', nullable: true })
  interpretation: string;

  @Column({ type: 'text', nullable: true })
  action: string;

  @Column({ type: 'text', nullable: true })
  future: string;

  @Column({ type: 'jsonb', nullable: true })
  recommendation: any;
}
