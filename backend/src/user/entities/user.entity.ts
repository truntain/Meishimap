import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  CreateDateColumn, 
  UpdateDateColumn,
  OneToMany
} from 'typeorm';

import { Booking } from '../../booking/entities/booking.entity';
import { Notification } from '../../notification/entities/notification.entity';
import { Review } from '../../review/entities/review.entity';
import { UserRole } from '../../common/enums';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // Thêm dấu ! ở đây

  @Column({ 
    type: 'varchar', 
    length: 255, 
    unique: true, 
    nullable: false 
  })
  email!: string; // Và ở đây

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: true 
  })
  name!: string;

  @Column({ 
    type: 'varchar', 
    length: 255, 
    nullable: false 
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.CUSTOMER,
    nullable: false
  })
  role!: UserRole;

  @Column({ 
    type: 'boolean', 
    default: true 
  })
  is_active!: boolean;

  @CreateDateColumn({ 
    type: 'timestamp with time zone', 
    default: () => 'CURRENT_TIMESTAMP' 
  })
  created_at!: Date;

  @UpdateDateColumn({ 
    type: 'timestamp with time zone', 
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP' 
  })
  updated_at!: Date;

  @OneToMany(() => Booking, booking => booking.user)
  bookings!: Booking[];

  @OneToMany(() => Notification, notification => notification.user)
  notifications!: Notification[];

  @OneToMany(() => Review, review => review.user)
  reviews!: Review[];
}