// src/notifications/entities/notification.entity.ts
import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, 
  ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { User } from '../../user/entities/user.entity';

@Entity('notifications')
@Index('idx_notifications_user', ['user', 'isRead'])
export class Notification {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'boolean', name: 'is_read', default: false })
  isRead: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  type: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;
}