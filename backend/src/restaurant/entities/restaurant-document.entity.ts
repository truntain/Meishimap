// src/restaurant/entities/restaurant-document.entity.ts
import { 
  Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, 
  OneToOne, JoinColumn 
} from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity('restaurant_documents')
export class RestaurantDocument {
  @PrimaryGeneratedColumn()
  id!: number;

  // Quan hệ 1-1 với Restaurant
  @OneToOne(() => Restaurant, restaurant => restaurant.documents, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'restaurant_id' })
  restaurant!: Restaurant;

  @Column({ type: 'varchar', length: 255, name: 'japanese_proof', nullable: true })
  japaneseProof!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'business_license', nullable: true })
  businessLicense!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'food_safety_cert', nullable: true })
  foodSafetyCert!: string | null;

  @Column({ type: 'varchar', length: 255, name: 'identity_card', nullable: true })
  identityCard!: string | null;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  updatedAt!: Date;
}