// src/bookings/entities/booking.entity.ts
import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, 
  ManyToOne, JoinColumn, Index 
} from 'typeorm';
import { BookingStatus } from '../../common/enums';
import { User } from '../../user/entities/user.entity';
import { Restaurant } from '../../restaurant/entities/restaurant.entity';

@Entity('bookings')
@Index('idx_bookings_restaurant_date', ['restaurant', 'bookingDate'])
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, user => user.bookings, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Restaurant, restaurant => restaurant.bookings, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant: Restaurant;

  @Column({ type: 'date', name: 'booking_date' })
  bookingDate: string;

  @Column({ type: 'time', name: 'booking_time' })
  bookingTime: string;

  @Column({ type: 'int' })
  guests: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ type: 'enum', enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: 'text', nullable: true, name: 'reject_reason' })
  rejectReason: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt: Date;
}