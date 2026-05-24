// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Restaurant])], 
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}