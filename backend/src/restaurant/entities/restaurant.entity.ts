import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';

import { Booking } from '../../booking/entities/booking.entity';
import { Review } from '../../review/entities/review.entity';

@Entity('restaurants')
export class Restaurant {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_jp!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  category!: string;

  @Column({ type: 'numeric', precision: 2, scale: 1, default: 0 })
  rating!: string;

  @Column({ type: 'text', nullable: false })
  address!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  district!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city!: string | null;

  @Column({ type: 'double precision', nullable: false, default: 0 })
  latitude!: number;

  @Column({ type: 'double precision', nullable: false, default: 0 })
  longitude!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone!: string | null;

  @Column({ type: 'text', nullable: true })
  image_url!: string | null;

  @Column({ type: 'boolean', default: false })
  has_japanese_support!: boolean;

  @CreateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp without time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;

  @OneToMany(() => Booking, booking => booking.restaurant)
  bookings!: Booking[];

  @OneToMany(() => Review, review => review.restaurant)
  reviews!: Review[];
}
