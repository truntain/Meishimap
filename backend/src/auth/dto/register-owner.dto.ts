import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterOwnerDto {
  @ApiProperty({ example: 'Nguyễn Văn Chủ', description: 'Họ và tên chủ nhà hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Tên chủ nhà hàng không được để trống!' })
  name!: string;

  @ApiProperty({ example: 'owner@example.com', description: 'Email của chủ nhà hàng' })
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @IsNotEmpty({ message: 'Email không được để trống!' })
  email!: string;

  // Restaurant details
  @ApiProperty({ example: 'Nhà hàng Sakura', description: 'Tên nhà hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Tên nhà hàng không được để trống!' })
  restaurantName!: string;

  @ApiProperty({ example: 'さくらレストラン', description: 'Tên tiếng Nhật của nhà hàng', required: false })
  @IsString()
  @IsOptional()
  restaurantNameJp?: string;

  @ApiProperty({ example: 'Sushi', description: 'Loại hình ẩm thực (category)' })
  @IsString()
  @IsNotEmpty({ message: 'Loại hình ẩm thực không được để trống!' })
  category!: string;

  @ApiProperty({ example: '123 Đường Kim Mã, Ba Đình', description: 'Địa chỉ nhà hàng' })
  @IsString()
  @IsNotEmpty({ message: 'Địa chỉ không được để trống!' })
  address!: string;

  @ApiProperty({ example: 'Ba Đình', description: 'Quận/Huyện', required: false })
  @IsString()
  @IsOptional()
  district?: string;

  @ApiProperty({ example: 'Hà Nội', description: 'Tỉnh/Thành phố', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: '0241234567', description: 'Số điện thoại nhà hàng', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'Nhà hàng sushi truyền thống Nhật Bản', description: 'Mô tả nhà hàng', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  // Documents
  @ApiProperty({ example: 'https://example.com/jp_proof.jpg', description: 'Bằng chứng tiếng Nhật (Menu, hình ảnh)', required: false })
  @IsString()
  @IsOptional()
  japaneseProof?: string;

  @ApiProperty({ example: 'https://example.com/license.pdf', description: 'Giấy phép kinh doanh', required: false })
  @IsString()
  @IsOptional()
  businessLicense?: string;

  @ApiProperty({ example: 'https://example.com/food_safety.pdf', description: 'Giấy Vệ sinh ATTP', required: false })
  @IsString()
  @IsOptional()
  foodSafetyCert?: string;

  @ApiProperty({ example: 'https://example.com/identity.pdf', description: 'CMND/CCCD của chủ quán', required: false })
  @IsString()
  @IsOptional()
  identityCard?: string;
}
