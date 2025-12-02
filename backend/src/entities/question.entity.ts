import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity({ name: 'questions' })
export class Question {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  title_en!: string;

  @Column({ type: 'text', nullable: true })
  title_zh!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  options_en!: string[] | null;

  @Column({ type: 'jsonb', nullable: true })
  options_zh!: string[] | null;

  @Column({ type: 'boolean', default: true })
  active!: boolean;

  @Column({ type: 'int', default: 0 })
  weight!: number;

  @CreateDateColumn()
  created_at!: Date;

  @UpdateDateColumn()
  updated_at!: Date;
}
