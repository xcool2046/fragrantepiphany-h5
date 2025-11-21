import { Column, Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, Index } from 'typeorm'
import { Question } from './question.entity'

@Entity({ name: 'rules' })
@Index('uq_rule_question_cards', ['question_id', 'card_codes'], { unique: true })
export class Rule {
  @PrimaryGeneratedColumn()
  id!: number

  @Column()
  question_id!: number

  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'question_id' })
  question!: Question

  @Column({ type: 'text', array: true })
  card_codes!: string[]

  @Column({ type: 'int', default: 100 })
  priority!: number

  @Column({ type: 'jsonb', nullable: true })
  summary_free!: { en?: string; zh?: string } | null

  @Column({ type: 'jsonb', nullable: true })
  interpretation_full!: { en?: string; zh?: string } | null

  @Column({ type: 'jsonb', nullable: true })
  recommendations!: Array<{ title_en?: string; title_zh?: string; desc_en?: string; desc_zh?: string }> | null

  @Column({ type: 'boolean', default: true })
  enabled!: boolean

  @CreateDateColumn()
  created_at!: Date

  @UpdateDateColumn()
  updated_at!: Date
}
