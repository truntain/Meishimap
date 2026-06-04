import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { User } from '../user/entities/user.entity';
import { BookingStatus } from '../common/enums';
import { BookingGateway } from './booking.gateway';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private bookingRepository: Repository<Booking>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private bookingGateway: BookingGateway,
  ) {}

    async create(createBookingDto: CreateBookingDto, userId?: number) {
      const restaurant = await this.restaurantRepository.findOne({ where: { id: createBookingDto.restaurantId } });
      if (!restaurant) {
        throw new NotFoundException('Restaurant not found');
      }

      let user: User | null = null;
      if (userId) {
        user = await this.userRepository.findOne({ where: { id: userId } });
      }

      const booking = this.bookingRepository.create({
        restaurant,
        user: user || undefined,
        bookingDate: createBookingDto.date,
        bookingTime: createBookingDto.time,
        guests: createBookingDto.guests,
        note: createBookingDto.note,
        status: BookingStatus.PENDING,
      });

      const savedBooking = await this.bookingRepository.save(booking);

      // Phát sự kiện realtime báo có đặt bàn mới cho chủ quán
      this.bookingGateway.notifyNewBooking(restaurant.id, {
        id: savedBooking.id,
        name: user?.name || 'Khách vãng lai',
        phone: user?.email || 'Chưa cập nhật',
        date: savedBooking.bookingDate,
        time: savedBooking.bookingTime,
        guests: savedBooking.guests + ' người',
        note: savedBooking.note || '',
        status: savedBooking.status,
      });

      return savedBooking;
    }

  async getBookingsByRestaurant(restaurantId: number) {
    return this.bookingRepository.find({
      where: { restaurant: { id: restaurantId } },
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async updateBookingStatus(id: number, status: BookingStatus, rejectReason?: string) {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['user', 'restaurant'],
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    booking.status = status;
    if (rejectReason) {
      booking.rejectReason = rejectReason;
    }

    const updatedBooking = await this.bookingRepository.save(booking);

    // Phát sự kiện thông báo cập nhật trạng thái đặt bàn cho khách hàng
    if (booking.user) {
      this.bookingGateway.notifyBookingStatus(booking.user.id, {
        id: updatedBooking.id,
        restaurantName: booking.restaurant.name,
        date: updatedBooking.bookingDate,
        time: updatedBooking.bookingTime,
        status: updatedBooking.status,
        rejectReason: updatedBooking.rejectReason || '',
      });
    }

    return updatedBooking;
  }

  async deleteBooking(id: number) {
    const booking = await this.bookingRepository.findOne({ where: { id } });
    if (!booking) {
      throw new NotFoundException('Booking not found');
    }
    return this.bookingRepository.remove(booking);
  }

  async getBookingsByUser(userId: number) {
    return this.bookingRepository.find({
      where: { user: { id: userId } },
      relations: ['restaurant'],
      order: { createdAt: 'DESC' },
    });
  }
}
