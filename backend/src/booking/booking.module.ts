// src/booking/booking.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { User } from '../user/entities/user.entity';
import { BookingGateway } from './booking.gateway';

@Module({
  imports: [TypeOrmModule.forFeature([Booking, Restaurant, User])], 
  controllers: [BookingController],
  providers: [BookingService, BookingGateway],
  exports: [BookingService, BookingGateway],
})
export class BookingModule {}