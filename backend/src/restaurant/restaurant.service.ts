import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Restaurant } from './entities/restaurant.entity';
import { MenuItem } from './entities/menu-item.entity';
import { UpdateRestaurantDto } from './dto/update-restaurant.dto';
import { CreateMenuItemDto } from './dto/create-menu-item.dto';
import { UpdateMenuItemDto } from './dto/update-menu-item.dto';
import { ApprovalStatus } from '../common/enums';


export type RestaurantResponse = {
  id: number;
  name: string;
  nameJp: string | null;
  category: string;
  rating: number;
  address: string;
  district: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  description: string | null;
  phone: string | null;
  imageUrl: string | null;
  hasJapaneseSupport: boolean;
  hours?: any;
  languages?: string;
  reviewCount?: number;
  menuItems?: any[];
  status?: string;
  rejectReason?: string | null;
};

const MOCK_MENU_ITEMS: Record<string, any[]> = {
  sushi: [
    { id: 101, name: 'Premium Sashimi Set', price: 450000, description: 'Lát cá hồi, cá ngừ, bạch tuộc tươi ngon.', category: 'sashimi', badge: 'Bán chạy nhất' },
    { id: 102, name: 'Sashimi Deluxe', price: 850000, description: 'Sashimi hảo hạng với cá ngừ đại dương, bào ngư.', category: 'sashimi', badge: 'Đặc sản' },
    { id: 103, name: 'Tempura Set', price: 220000, description: 'Tôm và rau củ chiên bột giòn rụm.', category: 'tempura', badge: '' },
    { id: 104, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
  ramen: [
    { id: 201, name: 'Tonkotsu Ramen', price: 185000, description: 'Mì Ramen với nước dùng xương hầm 12 tiếng ngon ngọt.', category: 'ramen', badge: 'Bán chạy nhất' },
    { id: 202, name: 'Shoyu Ramen', price: 165000, description: 'Mì Ramen vị nước tương truyền thống thanh nhẹ.', category: 'ramen', badge: '' },
    { id: 203, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
  kaiseki: [
    { id: 301, name: 'Sashimi Deluxe', price: 850000, description: 'Sashimi hảo hạng với cá ngừ đại dương, bào ngư.', category: 'sashimi', badge: 'Đặc sản' },
    { id: 302, name: 'Premium Sashimi Set', price: 450000, description: 'Lát cá hồi, cá ngừ, bạch tuộc tươi ngon.', category: 'sashimi', badge: '' },
    { id: 303, name: 'Matcha Ice Cream', price: 65000, description: 'Kem trà xanh Nhật Bản nguyên chất.', category: 'dessert', badge: '' }
  ],
};

@Injectable()
export class RestaurantService {
  constructor(
    @InjectRepository(Restaurant)
    private restaurantRepository: Repository<Restaurant>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) { }

  async findAll(options: {
    q?: string;
    category?: string;
    sort?: 'rating' | 'name';
  }): Promise<RestaurantResponse[]> {
    const query = this.restaurantRepository.createQueryBuilder('restaurant');

    query.andWhere('restaurant.status = :status', {
      status: ApprovalStatus.APPROVED,
    });

    if (options.category && options.category !== 'all') {
      query.andWhere('restaurant.category = :category', {
        category: options.category,
      });
    }

    if (options.q?.trim()) {
      query.andWhere(
        `(
          restaurant.name ILIKE :q OR
          restaurant.name_jp ILIKE :q OR
          restaurant.address ILIKE :q OR
          restaurant.district ILIKE :q OR
          restaurant.city ILIKE :q OR
          restaurant.category ILIKE :q
        )`,
        { q: `%${options.q.trim()}%` },
      );
    }

    if (options.sort === 'name') {
      query.orderBy('restaurant.name', 'ASC');
    } else {
      query.orderBy('restaurant.rating', 'DESC').addOrderBy('restaurant.name', 'ASC');
    }

    const restaurants = await query.getMany();
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findFeatured(): Promise<RestaurantResponse[]> {
    const restaurants = await this.restaurantRepository.find({
      where: { status: ApprovalStatus.APPROVED },
      order: {
        rating: 'DESC',
        name: 'ASC',
      },
      take: 6,
    });
    return restaurants.map((restaurant) => this.toResponse(restaurant));
  }

  async findOne(id: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { id },
      relations: ['reviews', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found');
    }

    const response = this.toResponse(restaurant);
    response.reviewCount = restaurant.reviews?.length || 0;

    response.menuItems = restaurant.menuItems?.map(item => ({
      id: item.id,
      name: item.name,
      nameJp: item.name_jp || '',
      price: `${Number(item.price).toLocaleString('vi-VN')}đ`,
      cat: item.category,
      icon: item.emoji || item.badge || '🍣',
      desc: item.description || '',
      descJp: item.description_jp || '',
    })) || [];

    return response;
  }

  async findByOwner(ownerId: number): Promise<RestaurantResponse> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
      relations: ['reviews', 'menuItems'],
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của chủ nhà hàng này');
    }

    const response = this.toResponse(restaurant);
    response.reviewCount = restaurant.reviews?.length || 0;

    response.menuItems = restaurant.menuItems?.map(item => ({
      id: item.id,
      name: item.name,
      nameJp: item.name_jp || '',
      price: `${Number(item.price).toLocaleString('vi-VN')}đ`,
      cat: item.category,
      icon: item.emoji || item.badge || '🍣',
      desc: item.description || '',
      descJp: item.description_jp || '',
    })) || [];

    return response;
  }

  async updateByOwner(ownerId: number, dto: UpdateRestaurantDto): Promise<RestaurantResponse> {
    let restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      // Create a new restaurant for this owner
      restaurant = this.restaurantRepository.create({
        owner: { id: ownerId } as any,
        name: dto.name || 'Nhà hàng mới của tôi',
        category: 'sushi',
        address: dto.address || 'Địa chỉ nhà hàng',
        latitude: 21.03,
        longitude: 105.85,
      });
    }

    if (dto.name !== undefined) restaurant.name = dto.name;
    if (dto.phone !== undefined) restaurant.phone = dto.phone;
    if (dto.address !== undefined) restaurant.address = dto.address;
    if (dto.image_url !== undefined) restaurant.image_url = dto.image_url;
    if (dto.imageUrl !== undefined) restaurant.image_url = dto.imageUrl;
    if (dto.has_japanese_support !== undefined) restaurant.has_japanese_support = dto.has_japanese_support;
    if (dto.hasJapaneseSupport !== undefined) restaurant.has_japanese_support = dto.hasJapaneseSupport;
    if (dto.description !== undefined) restaurant.description = dto.description;

    const updatedRestaurant = await this.restaurantRepository.save(restaurant);
    return this.findOne(updatedRestaurant.id);
  }

  async addMenuItem(ownerId: number, dto: CreateMenuItemDto) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const menuItem = this.menuItemRepository.create({
      restaurant_id: restaurant.id,
      name: dto.name,
      name_jp: dto.name_jp || dto.nameJp || null,
      category: dto.category,
      price: dto.price,
      description: dto.description || null,
      description_jp: dto.description_jp || dto.descriptionJp || null,
      image_url: dto.image_url || dto.imageUrl || null,
      badge: dto.badge || null,
      emoji: dto.icon || null,
    });

    await this.menuItemRepository.save(menuItem);
    return this.findByOwner(ownerId);
  }

  async updateMenuItem(ownerId: number, itemId: number, dto: UpdateMenuItemDto) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, restaurant_id: restaurant.id },
    });

    if (!menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn này trong thực đơn của bạn');
    }

    if (dto.name !== undefined) menuItem.name = dto.name;
    if (dto.name_jp !== undefined) menuItem.name_jp = dto.name_jp;
    if (dto.nameJp !== undefined) menuItem.name_jp = dto.nameJp;
    if (dto.category !== undefined) menuItem.category = dto.category;
    if (dto.price !== undefined) menuItem.price = dto.price;
    if (dto.description !== undefined) menuItem.description = dto.description;
    if (dto.description_jp !== undefined) menuItem.description_jp = dto.description_jp;
    if (dto.descriptionJp !== undefined) menuItem.description_jp = dto.descriptionJp;
    if (dto.image_url !== undefined) menuItem.image_url = dto.image_url;
    if (dto.imageUrl !== undefined) menuItem.image_url = dto.imageUrl;
    if (dto.badge !== undefined) menuItem.badge = dto.badge;
    if (dto.icon !== undefined) menuItem.emoji = dto.icon;

    await this.menuItemRepository.save(menuItem);
    return this.findByOwner(ownerId);
  }

  async deleteMenuItem(ownerId: number, itemId: number) {
    const restaurant = await this.restaurantRepository.findOne({
      where: { owner: { id: ownerId } },
    });

    if (!restaurant) {
      throw new NotFoundException('Không tìm thấy nhà hàng của bạn');
    }

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: itemId, restaurant_id: restaurant.id },
    });

    if (!menuItem) {
      throw new NotFoundException('Không tìm thấy món ăn này trong thực đơn của bạn');
    }

    await this.menuItemRepository.remove(menuItem);
    return this.findByOwner(ownerId);
  }


  private toResponse(restaurant: Restaurant): RestaurantResponse {
    return {
      id: restaurant.id,
      name: restaurant.name,
      nameJp: restaurant.name_jp,
      category: restaurant.category,
      rating: Number(restaurant.rating ?? 0),
      address: restaurant.address,
      district: restaurant.district,
      city: restaurant.city,
      latitude: restaurant.latitude,
      longitude: restaurant.longitude,
      description: restaurant.description,
      phone: restaurant.phone,
      imageUrl: restaurant.image_url,
      hasJapaneseSupport: restaurant.has_japanese_support,
      hours: {
        monday: '10:00 - 22:00',
        tuesday: '10:00 - 22:00',
        wednesday: '10:00 - 22:00',
        thursday: '10:00 - 22:00',
        friday: '10:00 - 22:00',
        saturday: '10:00 - 23:00',
        sunday: '10:00 - 23:00',
      },
      languages: restaurant.has_japanese_support ? 'Tiếng Việt, Tiếng Nhật, English' : 'Tiếng Việt, English',
      reviewCount: 0,
      status: restaurant.status,
      rejectReason: restaurant.rejectReason,
    };
  }
}
