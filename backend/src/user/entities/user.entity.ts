import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

// Định nghĩa Enum tương ứng với user_role trong Database
export enum UserRole {
  KHACH_HANG = 'khách hàng',
  QUAN_LY = 'quản lý',
  CHU_NHA_HANG = 'chủ nhà hàng',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id!: number; // Thêm dấu ! ở đây

  @Column({
    type: 'varchar',
    length: 255,
    unique: true,
    nullable: false,
  })
  email!: string; // Và ở đây

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  name!: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
  })
  password!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.KHACH_HANG,
    nullable: false,
  })
  role!: UserRole;

  @Column({
    type: 'boolean',
    default: true,
  })
  is_active!: boolean;

  @CreateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
  })
  created_at!: Date;

  @UpdateDateColumn({
    type: 'timestamp with time zone',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
  })
  updated_at!: Date;
}
