import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateRestaurantDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  image_url?: string;

  @IsString()
  @IsOptional()
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  has_japanese_support?: boolean;

  @IsBoolean()
  @IsOptional()
  hasJapaneseSupport?: boolean;

  @IsString()
  @IsOptional()
  description?: string;
}
