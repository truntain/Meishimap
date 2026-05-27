import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

export class CreateBookingDto {
  @IsNumber()
  @IsNotEmpty()
  restaurantId: number;

  @IsString()
  @IsNotEmpty()
  date: string;

  @IsString()
  @IsNotEmpty()
  time: string;

  @IsNumber()
  @IsNotEmpty()
  guests: number;

  @IsString()
  @IsOptional()
  note?: string;
}
