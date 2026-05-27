// src/booking/booking.controller.ts
import { Controller, Post, Body, UseGuards, Req, Get, Patch, Param } from '@nestjs/common';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  // API tạo đặt bàn
  @Post()
  create(@Body() createBookingDto: CreateBookingDto, @Req() req: any) {
    const userId = req.user?.userId;
    return this.bookingService.create(createBookingDto, userId);
  }

  // API lấy danh sách đặt bàn của nhà hàng cho chủ quán
  @Get('restaurant/:restaurantId')
  getBookingsByRestaurant(@Param('restaurantId') restaurantId: string) {
    return this.bookingService.getBookingsByRestaurant(Number(restaurantId));
  }

  // API cập nhật trạng thái đặt bàn
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: any; rejectReason?: string },
  ) {
    return this.bookingService.updateBookingStatus(Number(id), body.status, body.rejectReason);
  }
}
