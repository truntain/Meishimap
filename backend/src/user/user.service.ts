import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';

export type UserResponse = {
  id: number;
  email: string;
  name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
};

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const newUser = this.userRepository.create(userData);
    return this.userRepository.save(newUser);
  }

  async findAll(): Promise<UserResponse[]> {
    const users = await this.userRepository.find({
      order: { id: 'ASC' },
    });

    return users.map((user) => this.toResponse(user));
  }

  async findOne(id: number): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }

    return this.toResponse(user);
  }

  async update(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<UserResponse> {
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('Không tìm thấy người dùng!');
    }

    const nextEmail = updateUserDto.email?.trim().toLowerCase();
    if (nextEmail && nextEmail !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: nextEmail },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('Email này đã được sử dụng!');
      }

      user.email = nextEmail;
    }

    if (updateUserDto.name !== undefined) {
      const nextName = updateUserDto.name.trim();
      if (!nextName) {
        throw new BadRequestException('Tên không được để trống!');
      }

      user.name = nextName;
    }

    const savedUser = await this.userRepository.save(user);
    return this.toResponse(savedUser);
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'name', 'password', 'role', 'is_active'],
    });
  }

  private toResponse(user: User): UserResponse {
    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      role: user.role,
      is_active: user.is_active,
      created_at: user.created_at,
      updated_at: user.updated_at,
    };
  }
}
