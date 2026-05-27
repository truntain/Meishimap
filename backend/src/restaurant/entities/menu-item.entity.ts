import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'integer', name: 'restaurant_id' })
  restaurant_id!: number;

  @Column({ type: 'varchar', length: 255, nullable: false })
  name!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name_jp!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: false })
  category!: string;

  @Column({ type: 'numeric', precision: 10, scale: 0, nullable: false })
  price!: number;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  image_url!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  badge!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  emoji!: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  created_at!: Date;

  @ManyToOne(() => Restaurant, (restaurant) => restaurant.menuItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;
}
