import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      // Lấy Token từ header 'Authorization: Bearer <token>'
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Không chấp nhận token hết hạn
      secretOrKey: configService.get<string>('JWT_SECRET')!, // Lấy secret từ file .env
    });
  }

  // Hàm này sẽ chạy sau khi Token được giải mã thành công
  async validate(payload: any) {
    // Trả về dữ liệu để NestJS gán vào object request (req.user)
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
