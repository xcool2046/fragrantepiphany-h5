import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'orders' })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'integer' })
  amount: number;

  @Column()
  currency: string;

  @Column({ nullable: true })
  price_id: string;

  @Column({ default: 'pending' })
  status: string;

  @Column({ nullable: true })
  stripe_session_id: string;

  @Column({ nullable: true })
  payment_intent_id: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @CreateDateColumn()
  created_at: Date;
}
