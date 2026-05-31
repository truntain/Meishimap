// src/auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { UserRole, ApprovalStatus } from '../common/enums';
import { RegisterOwnerDto } from './dto/register-owner.dto';
import * as fs from 'fs';
import { join } from 'path';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) { }

  private saveBase64File(base64Str: string | undefined, folderName: string): string | null {
    if (!base64Str) return null;
    
    // Check if it's already a URL/path
    if (base64Str.startsWith('http://') || base64Str.startsWith('https://') || base64Str.startsWith('/uploads/')) {
      return base64Str;
    }

    const matches = base64Str.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return null;
    }

    const mimeType = matches[1];
    const base64Data = matches[2];
    
    let extension = 'png';
    if (mimeType.includes('pdf')) {
      extension = 'pdf';
    } else if (mimeType.includes('jpeg')) {
      extension = 'jpg';
    } else if (mimeType.includes('gif')) {
      extension = 'gif';
    }
    
    const buffer = Buffer.from(base64Data, 'base64');
    const uploadDir = join(process.cwd(), 'uploads', folderName);
    
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}.${extension}`;
    const filePath = join(uploadDir, fileName);
    
    fs.writeFileSync(filePath, buffer);
    
    return `/uploads/${folderName}/${fileName}`;
  }

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

  async registerOwner(registerOwnerDto: RegisterOwnerDto): Promise<any> {
    const {
      name,
      email,
      password,
      restaurantName,
      restaurantNameJp,
      category,
      address,
      district,
      city,
      phone,
      description,
      japaneseProof,
      businessLicense,
      foodSafetyCert,
      identityCard,
      latitude,
      longitude,
    } = registerOwnerDto;

    // 1. Kiểm tra email đã tồn tại chưa
    const existingUser = await this.usersService.findOneByEmail(email);
    if (existingUser) {
      throw new ConflictException('Email này đã được sử dụng!');
    }

    // 2. Mã hóa mật khẩu đối tác tự chọn
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Tạo user mới với vai trò là RESTAURANT_OWNER
    const newUser = await this.usersService.create({
      name,
      email,
      password: hashedPassword,
      role: UserRole.RESTAURANT_OWNER,
    });

    // Save documents to local files and get path links
    const jpProofUrl = this.saveBase64File(japaneseProof, 'documents');
    const licenseUrl = this.saveBase64File(businessLicense, 'documents');
    const safetyCertUrl = this.saveBase64File(foodSafetyCert, 'documents');
    const idCardUrl = this.saveBase64File(identityCard, 'documents');

    // 4. Tạo nhà hàng mới với trạng thái PENDING cùng giấy tờ
    const newRestaurant = this.restaurantRepository.create({
      name: restaurantName,
      name_jp: restaurantNameJp || null,
      category,
      address,
      district: district || null,
      city: city || null,
      phone: phone || null,
      description: description || null,
      latitude: latitude ?? 0,
      longitude: longitude ?? 0,
      status: ApprovalStatus.PENDING,
      owner: newUser,
      documents: {
        japaneseProof: jpProofUrl,
        businessLicense: licenseUrl,
        foodSafetyCert: safetyCertUrl,
        identityCard: idCardUrl,
      }
    });

    await this.restaurantRepository.save(newRestaurant);

    // 5. Trả về thông tin kết quả (loại bỏ password)
    const { password: _, ...userResult } = newUser;
    return {
      user: userResult,
      restaurant: {
        id: newRestaurant.id,
        name: newRestaurant.name,
        category: newRestaurant.category,
        address: newRestaurant.address,
        status: newRestaurant.status,
      },
    };
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

    // 3. Nếu là đối tác (RESTAURANT_OWNER), kiểm tra xem nhà hàng đã được phê duyệt chưa
    if (user.role === UserRole.RESTAURANT_OWNER) {
      const restaurant = await this.restaurantRepository.findOne({
        where: { owner: { id: user.id } },
      });
      if (!restaurant || restaurant.status !== ApprovalStatus.APPROVED) {
        throw new UnauthorizedException(
          'Tài khoản đối tác đang chờ phê duyệt bởi Admin hoặc đã bị từ chối!'
        );
      }
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