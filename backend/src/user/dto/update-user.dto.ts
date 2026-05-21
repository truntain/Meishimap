import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateUserDto {
  @ApiPropertyOptional({ example: 'Nguyen Van A' })
  @IsOptional()
  @IsString()
  @IsNotEmpty({ message: 'Tên không được để trống!' })
  @MaxLength(255, { message: 'Tên không được vượt quá 255 ký tự!' })
  name?: string;

  @ApiPropertyOptional({ example: 'user@example.com' })
  @IsOptional()
  @IsEmail({}, { message: 'Email không đúng định dạng!' })
  @MaxLength(255, { message: 'Email không được vượt quá 255 ký tự!' })
  email?: string;
}
