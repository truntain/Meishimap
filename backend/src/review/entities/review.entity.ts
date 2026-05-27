// src/reviews/entities/review.entity.ts
import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  ManyToOne, JoinColumn, Check 
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';

@Entity('reviews')
@Check(`"stars" BETWEEN 1 AND 5`)
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.reviews, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, restaurant => restaurant.reviews, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'int' })
  stars: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'text', name: 'owner_reply', nullable: true })
  ownerReply: string;

  @Column({ type: 'date', name: 'visit_date', nullable: true })
  visitDate: string;

  @Column({ type: 'boolean', name: 'is_reported', default: false })
  isReported: boolean;

  @Column({ type: 'text', name: 'report_reason', nullable: true })
  reportReason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}