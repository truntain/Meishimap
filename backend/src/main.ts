import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // Tự động loại bỏ các trường không được định nghĩa trong DTO
    forbidNonWhitelisted: true, // Báo lỗi nếu client gửi thừa trường lạ
    transform: true, // Tự động chuyển đổi kiểu dữ liệu (ví dụ: string sang number)
  }));
  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
