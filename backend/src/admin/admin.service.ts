import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Restaurant } from '../restaurant/entities/restaurant.entity';
import { ApprovalStatus } from '../common/enums';
import { MailService } from '../mail/mail.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    private mailService: MailService,
  ) {}

  async getStats() {
    // 1. Dữ liệu đếm tổng thực tế từ DB
    const totalRestaurants = await this.restaurantRepository.count({
      where: { status: ApprovalStatus.APPROVED },
    });

    const totalMembers = await this.userRepository.count();

    const pendingRestaurants = await this.restaurantRepository.count({
      where: { status: ApprovalStatus.PENDING },
    });

    // 2. Gom nhóm dữ liệu 6 tháng gần nhất từ cơ sở dữ liệu
    const labels: string[] = [];
    const restaurantRegistrations: number[] = [];
    const userRegistrations: number[] = [];

    const monthNamesVi = [
      'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6',
      'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'
    ];

    const today = new Date();
    const monthKeys: { year: number; month: number }[] = [];
    
    // Tạo cấu trúc dữ liệu cho 6 tháng gần đây (ví dụ: Tháng 12 -> Tháng 5)
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(today.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth(); // 0-11
      labels.push(monthNamesVi[month]);
      restaurantRegistrations.push(0);
      userRegistrations.push(0);
      monthKeys.push({ year, month });
    }

    // Lấy mốc thời gian 6 tháng trước
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(today.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setHours(0, 0, 0, 0);

    // Lấy danh sách người dùng đăng ký trong 6 tháng qua
    const users = await this.userRepository.find({
      where: {
        created_at: MoreThanOrEqual(sixMonthsAgo),
      },
      select: ['id', 'created_at'],
    });

    // Lấy danh sách nhà hàng tạo mới trong 6 tháng qua
    const restaurants = await this.restaurantRepository.find({
      where: {
        created_at: MoreThanOrEqual(sixMonthsAgo),
      },
      select: ['id', 'created_at'],
    });

    // Gom nhóm người dùng đăng ký mới
    users.forEach((user) => {
      const date = new Date(user.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      const index = monthKeys.findIndex((k) => k.year === year && k.month === month);
      if (index !== -1) {
        userRegistrations[index]++;
      }
    });

    // Gom nhóm nhà hàng đăng ký mới
    restaurants.forEach((restaurant) => {
      const date = new Date(restaurant.created_at);
      const year = date.getFullYear();
      const month = date.getMonth();
      const index = monthKeys.findIndex((k) => k.year === year && k.month === month);
      if (index !== -1) {
        restaurantRegistrations[index]++;
      }
    });

    return {
      summary: {
        totalRestaurants,
        totalRestaurantsTrend: 100, // % Tăng trưởng tương đối
        totalMembers,
        totalMembersTrend: 100,
        pendingRestaurants,
        pendingRestaurantsTrend: 100,
      },
      charts: {
        labels,
        restaurantRegistrations,
        userRegistrations,
      },
    };
  }

  async getApprovals() {
    return this.restaurantRepository.find({
      relations: ['owner', 'documents'],
      order: { created_at: 'DESC' },
    });
  }

  async approveRestaurant(id: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    
    restaurant.status = ApprovalStatus.APPROVED;
    restaurant.rejectReason = null;
    await this.restaurantRepository.save(restaurant);

    if (restaurant.owner) {
      // Gửi email thông báo phê duyệt, thông báo mật khẩu là mật khẩu đối tác tự chọn lúc đăng ký
      await this.mailService.sendApprovalEmail(
        restaurant.owner.email,
        restaurant.owner.name,
        '(Mật khẩu bạn đã thiết lập khi đăng ký)',
      );
    }

    return restaurant;
  }

  async rejectRestaurant(id: number, reason: string) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
    });
    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng');
    }
    restaurant.status = ApprovalStatus.REJECTED;
    restaurant.rejectReason = reason;
    return this.restaurantRepository.save(restaurant);
  }
}
