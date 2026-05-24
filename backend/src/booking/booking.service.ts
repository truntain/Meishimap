import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { BookingStatus } from '../common/enums';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
  ) {}

  async create(createBookingDto: CreateBookingDto) {
    const restaurant = await this.restaurantRepository.findOne({ where: { id: createBookingDto.restaurantId } });
    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const booking = this.bookingRepository.create({
      restaurant,
      bookingDate: createBookingDto.date,
      bookingTime: createBookingDto.time,
      guests: createBookingDto.guests,
      note: createBookingDto.note,
      status: BookingStatus.PENDING,
    });

    return await this.bookingRepository.save(booking);
  }
}
