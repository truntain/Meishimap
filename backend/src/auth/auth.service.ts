// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto): Promise<any> {
    const { name, email, password } = registerDto;

    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    // 2. Mã hóa mật khẩu
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
    });

    // 4. Trả về thông tin (loại bỏ password)
    const { password: _, ...result } = newUser;
    return result;
  }

  async signIn(loginDto: LoginDto): Promise<any> {
    const { email, password } = loginDto; // Giải nén email và password từ DTO

    // 1. Tìm user
    const user = await this.usersService.findOneByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Email không tồn tại trong hệ thống!');
    }

    // 2. Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      throw new UnauthorizedException('Mật khẩu không chính xác!');
    }

    // 3. Tạo Payload và Token
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };
  }
}